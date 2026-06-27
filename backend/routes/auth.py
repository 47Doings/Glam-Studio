import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from database import get_connection
from utils.jwt import create_access_token

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class RegisterRequest(BaseModel):
    name: str
    phone: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(data: RegisterRequest):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM clients WHERE email = %s", (data.email,))
    existing = cursor.fetchone()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = pwd_context.hash(data.password)
    cursor.execute(
        "INSERT INTO clients (name, phone, email, password_hash) VALUES (%s, %s, %s, %s) RETURNING id",
        (data.name, data.phone, data.email, hashed)
    )
    client = cursor.fetchone()
    conn.commit()
    conn.close()

    token = create_access_token({"sub": str(client["id"]), "email": data.email})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login")
def login(data: LoginRequest):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, email, password_hash FROM clients WHERE email = %s", (data.email,))
    client = cursor.fetchone()
    conn.close()

    if not client or not pwd_context.verify(data.password, client["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(client["id"]), "email": client["email"]})
    return {"access_token": token, "token_type": "bearer"}


class AdminLoginRequest(BaseModel):
    email: str
    password: str

@router.post("/admin/login")
def admin_login(data: AdminLoginRequest):
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if data.email != admin_email or data.password != admin_password:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    token = create_access_token({"sub": "admin", "email": data.email, "is_admin": True})
    return {"access_token": token, "token_type": "bearer"}