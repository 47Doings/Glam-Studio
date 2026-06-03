from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.services import router as services_router
from routes.stylists import router as stylists_router
from routes.bookings import router as bookings_router

app = FastAPI(
    title="Salon Booking API",
    description="Backend for managing salon services, stylists, and bookings.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(services_router)
app.include_router(stylists_router)
app.include_router(bookings_router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Salon Booking API is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
