from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ServiceCategory(str, Enum):
    hair = "hair"
    color = "color"
    treatment = "treatment"
    nails = "nails"
    other = "other"


class ServiceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    duration_minutes: int = Field(..., gt=0, le=480)
    price: float = Field(..., gt=0)
    category: ServiceCategory = ServiceCategory.other


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    duration_minutes: Optional[int] = Field(None, gt=0, le=480)
    price: Optional[float] = Field(None, gt=0)
    category: Optional[ServiceCategory] = None


class Service(ServiceBase):
    id: str

    class Config:
        from_attributes = True
