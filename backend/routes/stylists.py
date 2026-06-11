from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime, timedelta

from database import get_connection

router = APIRouter(prefix="/stylists", tags=["Stylists"])

DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


@router.get("/")
def list_stylists(
    active_only: bool = Query(True),
    service_id: Optional[int] = Query(None),
):
    conn = get_connection()
    cursor = conn.cursor()

    if service_id:
        cursor.execute("""
            SELECT stylists.* FROM stylists
            JOIN stylist_services ON stylists.id = stylist_services.stylist_id
            WHERE stylist_services.service_id = %s
            AND (%s = FALSE OR stylists.status = 'active')
        """, (service_id, active_only))
    else:
        if active_only:
            cursor.execute("SELECT * FROM stylists WHERE status = 'active'")
        else:
            cursor.execute("SELECT * FROM stylists")

    stylists = cursor.fetchall()
    conn.close()
    return [dict(s) for s in stylists]


@router.get("/{stylist_id}")
def get_stylist(stylist_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stylists WHERE id = %s", (stylist_id,))
    stylist = cursor.fetchone()
    conn.close()

    if not stylist:
        raise HTTPException(status_code=404, detail="Stylist not found")
    return dict(stylist)


@router.get("/{stylist_id}/availability")
def get_stylist_availability(
    stylist_id: int,
    date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
    service_id: Optional[int] = Query(None),
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM stylists WHERE id = %s", (stylist_id,))
    stylist = cursor.fetchone()
    if not stylist:
        raise HTTPException(status_code=404, detail="Stylist not found")
    if stylist["status"] != "active":
        raise HTTPException(status_code=400, detail="Stylist is not active")

    target_date = datetime.strptime(date, "%Y-%m-%d").date()
    day_name = DAYS_OF_WEEK[target_date.weekday()]

    if day_name not in stylist["working_days"]:
        conn.close()
        return {"date": date, "stylist_id": stylist_id, "available_slots": [], "reason": "Day off"}

    slot_duration = 30
    if service_id:
        cursor.execute("SELECT duration_minutes FROM services WHERE id = %s", (service_id,))
        service = cursor.fetchone()
        if service:
            slot_duration = service["duration_minutes"]

    start_dt = datetime.strptime(f"{date} {stylist['working_hours_start']}", "%Y-%m-%d %H:%M:%S")
    end_dt = datetime.strptime(f"{date} {stylist['working_hours_end']}", "%Y-%m-%d %H:%M:%S")

    all_slots = []
    current = start_dt
    while current + timedelta(minutes=slot_duration) <= end_dt:
        all_slots.append(current)
        current += timedelta(minutes=30)

    cursor.execute("""
        SELECT bookings.booking_time, services.duration_minutes
        FROM bookings
        JOIN services ON bookings.service_id = services.id
        WHERE bookings.stylist_id = %s
        AND bookings.booking_date = %s
        AND bookings.status != 'cancelled'
    """, (stylist_id, target_date))

    booked_ranges = []
    for row in cursor.fetchall():
        booked_start = datetime.strptime(f"{date} {row['booking_time']}", "%Y-%m-%d %H:%M:%S")
        booked_end = booked_start + timedelta(minutes=row["duration_minutes"])
        booked_ranges.append((booked_start, booked_end))

    conn.close()

    available = []
    for slot in all_slots:
        slot_end = slot + timedelta(minutes=slot_duration)
        conflict = any(
            not (slot_end <= b_start or slot >= b_end)
            for b_start, b_end in booked_ranges
        )
        if not conflict:
            available.append(slot.strftime("%H:%M"))

    return {"date": date, "stylist_id": stylist_id, "available_slots": available}


@router.post("/", status_code=201)
def create_stylist(
    name: str,
    specialty: str,
    working_hours_start: str,
    working_hours_end: str,
    working_days: list[str],
):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO stylists (name, specialty, working_hours_start, working_hours_end, working_days)
        VALUES (%s, %s, %s, %s, %s) RETURNING *
    """, (name, specialty, working_hours_start, working_hours_end, working_days))
    new_stylist = cursor.fetchone()
    conn.commit()
    conn.close()
    return dict(new_stylist)


@router.patch("/{stylist_id}")
def update_stylist(stylist_id: int, status: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE stylists SET status = %s WHERE id = %s RETURNING *",
        (status, stylist_id)
    )
    updated = cursor.fetchone()
    conn.commit()
    conn.close()

    if not updated:
        raise HTTPException(status_code=404, detail="Stylist not found")
    return dict(updated)


@router.delete("/{stylist_id}", status_code=204)
def delete_stylist(stylist_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM stylists WHERE id = %s RETURNING id", (stylist_id,))
    deleted = cursor.fetchone()
    conn.commit()
    conn.close()

    if not deleted:
        raise HTTPException(status_code=404, detail="Stylist not found")