from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from enum import Enum


class TimeSlot(BaseModel):
    start: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    end: str = Field(..., pattern=r"^\d{2}:\d{2}$")


class StylistBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    bio: Optional[str] = Field(None, max_length=1000)
    specialties: List[str] = Field(default_factory=list)
    service_ids: List[str] = Field(default_factory=list)
    working_hours: Dict[str, Optional[TimeSlot]] = Field(
        default_factory=lambda: {
            "monday": None, "tuesday": None, "wednesday": None,
            "thursday": None, "friday": None, "saturday": None, "sunday": None
        }
    )
    active: bool = True


class StylistCreate(StylistBase):
    pass


class StylistUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    bio: Optional[str] = Field(None, max_length=1000)
    specialties: Optional[List[str]] = None
    service_ids: Optional[List[str]] = None
    working_hours: Optional[Dict[str, Optional[TimeSlot]]] = None
    active: Optional[bool] = None


class Stylist(StylistBase):
    id: str

    class Config:
        from_attributes = True
