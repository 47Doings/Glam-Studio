from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from decimal import Decimal

from database import get_connection

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("/")
def list_services(
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
):
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM services WHERE 1=1"
    params = []

    if min_price is not None:
        query += " AND price >= %s"
        params.append(min_price)
    if max_price is not None:
        query += " AND price <= %s"
        params.append(max_price)

    cursor.execute(query, params)
    services = cursor.fetchall()
    conn.close()

    return [dict(s) for s in services]


@router.get("/{service_id}")
def get_service(service_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM services WHERE id = %s", (service_id,))
    service = cursor.fetchone()
    conn.close()

    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return dict(service)


@router.post("/", status_code=201)
def create_service(name: str, price: float, duration_minutes: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO services (name, price, duration_minutes) VALUES (%s, %s, %s) RETURNING *",
        (name, price, duration_minutes)
    )
    new_service = cursor.fetchone()
    conn.commit()
    conn.close()
    return dict(new_service)


@router.delete("/{service_id}", status_code=204)
def delete_service(service_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM services WHERE id = %s RETURNING id", (service_id,))
    deleted = cursor.fetchone()
    conn.commit()
    conn.close()

    if not deleted:
        raise HTTPException(status_code=404, detail="Service not found")