from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import uuid

from models.stylist import Stylist, StylistCreate, StylistUpdate
from storage import load_data, save_data

router = APIRouter(prefix="/stylists", tags=["Stylists"])

DATA_FILE = "stylists"
DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


@router.get("/", response_model=List[Stylist])
def list_stylists(
    active_only: bool = Query(True, description="Return only active stylists"),
    service_id: Optional[str] = Query(None, description="Filter by offered service"),
):
    """List all stylists with optional filters."""
    stylists = load_data(DATA_FILE)

    if active_only:
        stylists = [s for s in stylists if s.get("active", True)]
    if service_id:
        stylists = [s for s in stylists if service_id in s.get("service_ids", [])]

    return stylists


@router.get("/{stylist_id}", response_model=Stylist)
def get_stylist(stylist_id: str):
    """Get a single stylist by ID."""
    stylists = load_data(DATA_FILE)
    for stylist in stylists:
        if stylist["id"] == stylist_id:
            return stylist
    raise HTTPException(status_code=404, detail=f"Stylist '{stylist_id}' not found")


@router.get("/{stylist_id}/availability")
def get_stylist_availability(
    stylist_id: str,
    date: str = Query(..., description="Date in YYYY-MM-DD format", pattern=r"^\d{4}-\d{2}-\d{2}$"),
    service_id: Optional[str] = Query(None, description="Include service duration in slot calculation"),
):
    """
    Return available time slots for a stylist on a given date.
    Slots are 30-minute intervals within working hours, minus confirmed bookings.
    """
    from datetime import datetime, timedelta

    stylists = load_data(DATA_FILE)
    stylist = next((s for s in stylists if s["id"] == stylist_id), None)
    if not stylist:
        raise HTTPException(status_code=404, detail=f"Stylist '{stylist_id}' not found")
    if not stylist.get("active", True):
        raise HTTPException(status_code=400, detail="Stylist is not currently active")

    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid date format. Use YYYY-MM-DD")

    day_name = DAYS_OF_WEEK[target_date.weekday()]
    hours = stylist.get("working_hours", {}).get(day_name)
    if not hours:
        return {"date": date, "stylist_id": stylist_id, "available_slots": [], "reason": "Day off"}

    # Determine service duration for slot blocking
    slot_duration = 30  # default granularity
    if service_id:
        services = load_data("services")
        svc = next((s for s in services if s["id"] == service_id), None)
        if svc:
            slot_duration = svc["duration_minutes"]

    # Build all slots
    start_dt = datetime.strptime(f"{date} {hours['start']}", "%Y-%m-%d %H:%M")
    end_dt = datetime.strptime(f"{date} {hours['end']}", "%Y-%m-%d %H:%M")
    all_slots = []
    cursor = start_dt
    while cursor + timedelta(minutes=slot_duration) <= end_dt:
        all_slots.append(cursor)
        cursor += timedelta(minutes=30)

    # Remove booked slots
    bookings = load_data("bookings")
    booked_ranges = []
    for b in bookings:
        if b.get("stylist_id") == stylist_id and b.get("status") not in ("cancelled",):
            apt = datetime.fromisoformat(b["appointment_time"])
            if apt.date() == target_date:
                svc_list = load_data("services")
                svc = next((s for s in svc_list if s["id"] == b.get("service_id")), None)
                dur = svc["duration_minutes"] if svc else 60
                booked_ranges.append((apt, apt + timedelta(minutes=dur)))

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


@router.post("/", response_model=Stylist, status_code=201)
def create_stylist(payload: StylistCreate):
    """Create a new stylist."""
    stylists = load_data(DATA_FILE)
    new_stylist = {"id": f"sty-{uuid.uuid4().hex[:8]}", **payload.model_dump()}
    stylists.append(new_stylist)
    save_data(DATA_FILE, stylists)
    return new_stylist


@router.patch("/{stylist_id}", response_model=Stylist)
def update_stylist(stylist_id: str, payload: StylistUpdate):
    """Partially update a stylist."""
    stylists = load_data(DATA_FILE)
    for i, stylist in enumerate(stylists):
        if stylist["id"] == stylist_id:
            updates = payload.model_dump(exclude_none=True)
            stylists[i] = {**stylist, **updates}
            save_data(DATA_FILE, stylists)
            return stylists[i]
    raise HTTPException(status_code=404, detail=f"Stylist '{stylist_id}' not found")


@router.delete("/{stylist_id}", status_code=204)
def delete_stylist(stylist_id: str):
    """Delete a stylist (hard delete)."""
    stylists = load_data(DATA_FILE)
    filtered = [s for s in stylists if s["id"] != stylist_id]
    if len(filtered) == len(stylists):
        raise HTTPException(status_code=404, detail=f"Stylist '{stylist_id}' not found")
    save_data(DATA_FILE, filtered)
