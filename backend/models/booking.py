from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime, timezone
from enum import Enum


class BookingStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class BookingBase(BaseModel):
    stylist_id: str
    service_id: str
    client_name: str = Field(..., min_length=1, max_length=100)
    client_email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    client_phone: Optional[str] = Field(None, max_length=20)
    appointment_time: datetime
    notes: Optional[str] = Field(None, max_length=500)

    @field_validator("appointment_time")
    @classmethod
    def appointment_must_be_future(cls, v: datetime) -> datetime:
        v_aware = v if v.tzinfo is not None else v.replace(tzinfo=timezone.utc)
        if v_aware < datetime.now(timezone.utc):
            raise ValueError("appointment_time must be in the future")
        return v_aware


class BookingCreate(BookingBase):
    pass


class BookingUpdate(BaseModel):
    stylist_id: Optional[str] = None
    service_id: Optional[str] = None
    client_name: Optional[str] = Field(None, min_length=1, max_length=100)
    client_email: Optional[str] = Field(None, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    client_phone: Optional[str] = Field(None, max_length=20)
    appointment_time: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=500)
    status: Optional[BookingStatus] = None


class Booking(BookingBase):
    id: str
    status: BookingStatus = BookingStatus.pending
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
