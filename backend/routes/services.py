from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import uuid

from models.service import Service, ServiceCreate, ServiceUpdate, ServiceCategory
from storage import load_data, save_data

router = APIRouter(prefix="/services", tags=["Services"])

DATA_FILE = "services"


@router.get("/", response_model=List[Service])
def list_services(
    category: Optional[ServiceCategory] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
):
    """List all services, with optional filters."""
    services = load_data(DATA_FILE)

    if category:
        services = [s for s in services if s.get("category") == category.value]
    if min_price is not None:
        services = [s for s in services if s.get("price", 0) >= min_price]
    if max_price is not None:
        services = [s for s in services if s.get("price", 0) <= max_price]

    return services


@router.get("/{service_id}", response_model=Service)
def get_service(service_id: str):
    """Get a single service by ID."""
    services = load_data(DATA_FILE)
    for service in services:
        if service["id"] == service_id:
            return service
    raise HTTPException(status_code=404, detail=f"Service '{service_id}' not found")


@router.post("/", response_model=Service, status_code=201)
def create_service(payload: ServiceCreate):
    """Create a new service."""
    services = load_data(DATA_FILE)
    new_service = {"id": f"svc-{uuid.uuid4().hex[:8]}", **payload.model_dump()}
    services.append(new_service)
    save_data(DATA_FILE, services)
    return new_service


@router.patch("/{service_id}", response_model=Service)
def update_service(service_id: str, payload: ServiceUpdate):
    """Partially update a service."""
    services = load_data(DATA_FILE)
    for i, service in enumerate(services):
        if service["id"] == service_id:
            updates = payload.model_dump(exclude_none=True)
            services[i] = {**service, **updates}
            save_data(DATA_FILE, services)
            return services[i]
    raise HTTPException(status_code=404, detail=f"Service '{service_id}' not found")


@router.delete("/{service_id}", status_code=204)
def delete_service(service_id: str):
    """Delete a service."""
    services = load_data(DATA_FILE)
    filtered = [s for s in services if s["id"] != service_id]
    if len(filtered) == len(services):
        raise HTTPException(status_code=404, detail=f"Service '{service_id}' not found")
    save_data(DATA_FILE, filtered)
