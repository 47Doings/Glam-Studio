from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import uuid

from models.booking import Booking, BookingCreate, BookingUpdate, BookingStatus
from storage import load_data, save_data

router = APIRouter(prefix="/bookings", tags=["Bookings"])

DATA_FILE = "bookings"


def _validate_booking_refs(stylist_id: str, service_id: str):
    """Validate that stylist exists, is active, and offers the service."""
    stylists = load_data("stylists")
    stylist = next((s for s in stylists if s["id"] == stylist_id), None)
    if not stylist:
        raise HTTPException(status_code=404, detail=f"Stylist '{stylist_id}' not found")
    if not stylist.get("active", True):
        raise HTTPException(status_code=400, detail="Stylist is not currently active")
    if service_id not in stylist.get("service_ids", []):
        raise HTTPException(
            status_code=400,
            detail=f"Stylist '{stylist_id}' does not offer service '{service_id}'"
        )

    services = load_data("services")
    service = next((s for s in services if s["id"] == service_id), None)
    if not service:
        raise HTTPException(status_code=404, detail=f"Service '{service_id}' not found")

    return stylist, service


def _check_conflict(stylist_id: str, appointment_time: datetime, duration_minutes: int, exclude_id: Optional[str] = None):
    """Raise 409 if the stylist has a conflicting confirmed/pending booking."""
    from datetime import timedelta

    bookings = load_data(DATA_FILE)
    new_start = appointment_time
    new_end = appointment_time + timedelta(minutes=duration_minutes)

    for b in bookings:
        if b.get("id") == exclude_id:
            continue
        if b.get("stylist_id") != stylist_id:
            continue
        if b.get("status") in ("cancelled",):
            continue

        services = load_data("services")
        svc = next((s for s in services if s["id"] == b.get("service_id")), None)
        dur = svc["duration_minutes"] if svc else 60
        b_start = datetime.fromisoformat(b["appointment_time"])
        b_end = b_start + timedelta(minutes=dur)

        if not (new_end <= b_start or new_start >= b_end):
            raise HTTPException(
                status_code=409,
                detail=f"Time slot conflicts with existing booking '{b['id']}'"
            )


@router.get("/", response_model=List[Booking])
def list_bookings(
    stylist_id: Optional[str] = Query(None),
    client_email: Optional[str] = Query(None),
    status: Optional[BookingStatus] = Query(None),
    date: Optional[str] = Query(None, description="Filter by date YYYY-MM-DD", pattern=r"^\d{4}-\d{2}-\d{2}$"),
):
    """List bookings with optional filters."""
    bookings = load_data(DATA_FILE)

    if stylist_id:
        bookings = [b for b in bookings if b.get("stylist_id") == stylist_id]
    if client_email:
        bookings = [b for b in bookings if b.get("client_email", "").lower() == client_email.lower()]
    if status:
        bookings = [b for b in bookings if b.get("status") == status.value]
    if date:
        bookings = [b for b in bookings if b.get("appointment_time", "").startswith(date)]

    bookings.sort(key=lambda b: b.get("appointment_time", ""))
    return bookings


@router.get("/{booking_id}", response_model=Booking)
def get_booking(booking_id: str):
    """Get a single booking by ID."""
    bookings = load_data(DATA_FILE)
    for booking in bookings:
        if booking["id"] == booking_id:
            return booking
    raise HTTPException(status_code=404, detail=f"Booking '{booking_id}' not found")


@router.post("/", response_model=Booking, status_code=201)
def create_booking(payload: BookingCreate):
    """Create a new booking after validating stylist, service, and time conflicts."""
    stylist, service = _validate_booking_refs(payload.stylist_id, payload.service_id)
    _check_conflict(payload.stylist_id, payload.appointment_time, service["duration_minutes"])

    now = datetime.now().isoformat()
    new_booking = {
        "id": f"bkg-{uuid.uuid4().hex[:8]}",
        **payload.model_dump(),
        "appointment_time": payload.appointment_time.isoformat(),
        "status": BookingStatus.confirmed.value,
        "created_at": now,
        "updated_at": now,
    }

    bookings = load_data(DATA_FILE)
    bookings.append(new_booking)
    save_data(DATA_FILE, bookings)
    return new_booking


@router.patch("/{booking_id}", response_model=Booking)
def update_booking(booking_id: str, payload: BookingUpdate):
    """Partially update a booking."""
    bookings = load_data(DATA_FILE)
    for i, booking in enumerate(bookings):
        if booking["id"] != booking_id:
            continue

        updates = payload.model_dump(exclude_none=True)

        # Re-validate refs and conflicts if stylist/service/time changes
        new_stylist_id = updates.get("stylist_id", booking["stylist_id"])
        new_service_id = updates.get("service_id", booking["service_id"])
        _, service = _validate_booking_refs(new_stylist_id, new_service_id)

        new_time_raw = updates.get("appointment_time", booking["appointment_time"])
        if isinstance(new_time_raw, datetime):
            new_time = new_time_raw
            updates["appointment_time"] = new_time.isoformat()
        else:
            new_time = datetime.fromisoformat(str(new_time_raw))

        _check_conflict(new_stylist_id, new_time, service["duration_minutes"], exclude_id=booking_id)

        if "status" in updates and isinstance(updates["status"], BookingStatus):
            updates["status"] = updates["status"].value

        updates["updated_at"] = datetime.now().isoformat()
        bookings[i] = {**booking, **updates}
        save_data(DATA_FILE, bookings)
        return bookings[i]

    raise HTTPException(status_code=404, detail=f"Booking '{booking_id}' not found")


@router.patch("/{booking_id}/cancel", response_model=Booking)
def cancel_booking(booking_id: str):
    """Cancel a booking."""
    bookings = load_data(DATA_FILE)
    for i, booking in enumerate(bookings):
        if booking["id"] == booking_id:
            if booking.get("status") == BookingStatus.cancelled.value:
                raise HTTPException(status_code=400, detail="Booking is already cancelled")
            bookings[i] = {
                **booking,
                "status": BookingStatus.cancelled.value,
                "updated_at": datetime.now().isoformat(),
            }
            save_data(DATA_FILE, bookings)
            return bookings[i]
    raise HTTPException(status_code=404, detail=f"Booking '{booking_id}' not found")


@router.delete("/{booking_id}", status_code=204)
def delete_booking(booking_id: str):
    """Hard delete a booking record."""
    bookings = load_data(DATA_FILE)
    filtered = [b for b in bookings if b["id"] != booking_id]
    if len(filtered) == len(bookings):
        raise HTTPException(status_code=404, detail=f"Booking '{booking_id}' not found")
    save_data(DATA_FILE, filtered)
