from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime, timedelta

from database import get_connection

router = APIRouter(prefix="/bookings", tags=["Bookings"])


def _validate_booking_refs(cursor, stylist_id: int, service_id: int):
    cursor.execute("SELECT * FROM stylists WHERE id = %s", (stylist_id,))
    stylist = cursor.fetchone()
    if not stylist:
        raise HTTPException(status_code=404, detail="Stylist not found")
    if stylist["status"] != "active":
        raise HTTPException(status_code=400, detail="Stylist is not active")

    cursor.execute("""
        SELECT * FROM stylist_services
        WHERE stylist_id = %s AND service_id = %s
    """, (stylist_id, service_id))
    if not cursor.fetchone():
        raise HTTPException(status_code=400, detail="Stylist does not offer this service")

    cursor.execute("SELECT * FROM services WHERE id = %s", (service_id,))
    service = cursor.fetchone()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    return stylist, service


def _check_conflict(cursor, stylist_id: int, booking_date: str, booking_time: str, duration_minutes: int, exclude_id: Optional[int] = None):
    new_start = datetime.strptime(f"{booking_date} {booking_time}", "%Y-%m-%d %H:%M")
    new_end = new_start + timedelta(minutes=duration_minutes)

    cursor.execute("""
        SELECT bookings.id, bookings.booking_time, services.duration_minutes
        FROM bookings
        JOIN services ON bookings.service_id = services.id
        WHERE bookings.stylist_id = %s
        AND bookings.booking_date = %s
        AND bookings.status != 'cancelled'
    """, (stylist_id, booking_date))

    for row in cursor.fetchall():
        if exclude_id and row["id"] == exclude_id:
            continue
        b_start = datetime.strptime(f"{booking_date} {row['booking_time']}", "%Y-%m-%d %H:%M:%S")
        b_end = b_start + timedelta(minutes=row["duration_minutes"])
        if not (new_end <= b_start or new_start >= b_end):
            raise HTTPException(status_code=409, detail="Time slot conflicts with existing booking")


@router.get("/")
def list_bookings(
    stylist_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    date: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT 
            bookings.id,
            clients.name AS client,
            stylists.name AS stylist,
            services.name AS service,
            bookings.booking_date,
            bookings.booking_time,
            bookings.status,
            bookings.price
        FROM bookings
        JOIN clients ON bookings.client_id = clients.id
        JOIN stylists ON bookings.stylist_id = stylists.id
        JOIN services ON bookings.service_id = services.id
        WHERE 1=1
    """
    params = []

    if stylist_id:
        query += " AND bookings.stylist_id = %s"
        params.append(stylist_id)
    if status:
        query += " AND bookings.status = %s"
        params.append(status)
    if date:
        query += " AND bookings.booking_date = %s"
        params.append(date)

    query += " ORDER BY bookings.booking_date, bookings.booking_time"
    cursor.execute(query, params)
    bookings = cursor.fetchall()
    conn.close()
    return [dict(b) for b in bookings]


@router.get("/{booking_id}")
def get_booking(booking_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            bookings.id,
            clients.name AS client,
            stylists.name AS stylist,
            services.name AS service,
            bookings.booking_date,
            bookings.booking_time,
            bookings.status,
            bookings.price
        FROM bookings
        JOIN clients ON bookings.client_id = clients.id
        JOIN stylists ON bookings.stylist_id = stylists.id
        JOIN services ON bookings.service_id = services.id
        WHERE bookings.id = %s
    """, (booking_id,))
    booking = cursor.fetchone()
    conn.close()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return dict(booking)


@router.post("/", status_code=201)
def create_booking(
    client_id: int,
    stylist_id: int,
    service_id: int,
    booking_date: str,
    booking_time: str,
    price: float,
):
    conn = get_connection()
    cursor = conn.cursor()

    _, service = _validate_booking_refs(cursor, stylist_id, service_id)
    _check_conflict(cursor, stylist_id, booking_date, booking_time, service["duration_minutes"])

    cursor.execute("""
        INSERT INTO bookings (client_id, stylist_id, service_id, booking_date, booking_time, status, price)
        VALUES (%s, %s, %s, %s, %s, 'pending', %s) RETURNING *
    """, (client_id, stylist_id, service_id, booking_date, booking_time, price))

    new_booking = cursor.fetchone()
    conn.commit()
    conn.close()
    return dict(new_booking)


@router.patch("/{booking_id}/status")
def update_booking_status(booking_id: int, status: str):
    valid_statuses = ["pending", "confirmed", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE bookings SET status = %s WHERE id = %s RETURNING *",
        (status, booking_id)
    )
    updated = cursor.fetchone()
    conn.commit()
    conn.close()

    if not updated:
        raise HTTPException(status_code=404, detail="Booking not found")
    return dict(updated)


@router.patch("/{booking_id}/cancel")
def cancel_booking(booking_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT status FROM bookings WHERE id = %s", (booking_id,))
    booking = cursor.fetchone()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking["status"] == "cancelled":
        raise HTTPException(status_code=400, detail="Booking is already cancelled")

    cursor.execute(
        "UPDATE bookings SET status = 'cancelled' WHERE id = %s RETURNING *",
        (booking_id,)
    )
    updated = cursor.fetchone()
    conn.commit()
    conn.close()
    return dict(updated)


@router.delete("/{booking_id}", status_code=204)
def delete_booking(booking_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM bookings WHERE id = %s RETURNING id", (booking_id,))
    deleted = cursor.fetchone()
    conn.commit()
    conn.close()

    if not deleted:
        raise HTTPException(status_code=404, detail="Booking not found")


@router.post("/quick", status_code=201)
def quick_booking(
    name: str,
    phone: str,
    stylist_id: int,
    service_id: int,
    booking_date: str,
    booking_time: str,
    price: float,
    email: Optional[str] = None,
):
    conn = get_connection()
    cursor = conn.cursor()

    # Find or create client
    client_id = None

    if email:
        cursor.execute("SELECT id FROM clients WHERE email = %s", (email,))
        client = cursor.fetchone()
        if client:
            client_id = client["id"]

    if not client_id:
        cursor.execute(
            "INSERT INTO clients (name, phone, email) VALUES (%s, %s, %s) RETURNING id",
            (name, phone or "", email if email else None)
        )
        client_id = cursor.fetchone()["id"]

    # Validate stylist and service
    _, service = _validate_booking_refs(cursor, stylist_id, service_id)

    # Check conflicts
    _check_conflict(cursor, stylist_id, booking_date, booking_time, service["duration_minutes"])

    # Create booking
    cursor.execute("""
        INSERT INTO bookings (client_id, stylist_id, service_id, booking_date, booking_time, status, price)
        VALUES (%s, %s, %s, %s, %s, 'pending', %s) RETURNING id
    """, (client_id, stylist_id, service_id, booking_date, booking_time, price))

    booking_id = cursor.fetchone()["id"]

    # Return full booking with joined names
    cursor.execute("""
        SELECT 
            bookings.id,
            clients.name AS client,
            stylists.name AS stylist,
            services.name AS service,
            bookings.booking_date,
            bookings.booking_time,
            bookings.status,
            bookings.price
        FROM bookings
        JOIN clients ON bookings.client_id = clients.id
        JOIN stylists ON bookings.stylist_id = stylists.id
        JOIN services ON bookings.service_id = services.id
        WHERE bookings.id = %s
    """, (booking_id,))

    result = cursor.fetchone()
    conn.commit()
    conn.close()
    return dict(result)