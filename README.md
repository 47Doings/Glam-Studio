# Glam Studio — Salon Booking System

A full-stack salon booking and management platform built with **React** (frontend) and **Python FastAPI** (backend).

---

## What it does

**Customer side:**
- Browse available services with prices and durations
- Choose a stylist filtered by service
- Pick an available date and time slot
- Enter personal details and confirm booking
- Receive a booking reference on success

**Admin side:**
- View all bookings for the day — confirm or cancel pending ones
- Track stylist performance and monthly revenue
- See top clients and booking history
- Manage services — add, edit, delete, update prices
- Manage stylists — add, edit, delete, toggle active status

---

## File structure

```
salon-app/
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Routing (Booking / Admin / Settings)
│   │   ├── main.jsx              # React entry point
│   │   ├── pages/
│   │   │   ├── Booking.jsx       # Full customer booking flow (5 steps)
│   │   │   ├── Admin.jsx         # Admin dashboard — bookings, stylists, revenue, clients
│   │   │   └── Settings.jsx      # Add/edit/delete services and stylists
│   │   ├── components/
│   │   │   ├── ServiceCard.jsx   # Service selection card
│   │   │   ├── StylistCard.jsx   # Stylist selection card
│   │   │   ├── TimeSlotGrid.jsx  # Available time slots grid
│   │   │   └── BookingSummary.jsx# Booking review summary
│   │   └── api/
│   │       └── index.js          # All API calls to backend in one place
│   ├── index.html
│   └── package.json
│
├── backend/
│   ├── main.py                   # FastAPI app entry point + CORS
│   ├── routes/
│   │   ├── bookings.py           # CRUD for bookings
│   │   ├── services.py           # CRUD for services
│   │   └── stylists.py           # CRUD for stylists + availability
│   ├── models/
│   │   ├── booking.py            # Booking data model
│   │   ├── service.py            # Service data model
│   │   └── stylist.py            # Stylist data model
│   ├── data/
│   │   ├── bookings.json         # Bookings storage
│   │   ├── services.json         # Services storage
│   │   └── stylists.json         # Stylists storage
│   └── requirements.txt
│
└── README.md
```

---

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Python 3.11+ + FastAPI |
| Storage | JSON files (swap for PostgreSQL/Supabase later) |
| Styling | Inline styles + Google Fonts (DM Sans, Playfair Display) |
| Fonts | DM Sans, Playfair Display |

---

## Getting started

### 1. Clone the project

```bash
git clone https://github.com/yourusername/salon-app.git
cd salon-app
```

---

### 2. Run the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`

API docs available at: `http://localhost:8000/docs`

---

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## API endpoints

### Services
| Method | Endpoint | Description |
|---|---|---|
| GET | `/services/` | Get all services |
| POST | `/services/` | Create a service |
| PUT | `/services/{id}` | Update a service |
| DELETE | `/services/{id}` | Delete a service |

### Stylists
| Method | Endpoint | Description |
|---|---|---|
| GET | `/stylists/` | Get all stylists |
| POST | `/stylists/` | Create a stylist |
| PUT | `/stylists/{id}` | Update a stylist |
| DELETE | `/stylists/{id}` | Delete a stylist |
| GET | `/stylists/{id}/availability` | Get available slots for a date |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| GET | `/bookings/` | Get all bookings |
| POST | `/bookings/` | Create a booking |
| PATCH | `/bookings/{id}/status` | Update booking status |
| DELETE | `/bookings/{id}` | Delete a booking |

---

## Deployment

### Frontend → Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend folder
cd frontend
vercel
```

### Backend → Render
1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port 10000`

### Update API URL
After deploying backend, update the API base URL in `frontend/src/api/index.js`:
```js
const API = "https://your-backend.onrender.com"
```

---

## Upgrading from JSON to a real database

When you're ready to move from JSON file storage to a real database:

1. Sign up at [supabase.com](https://supabase.com) — free tier
2. Create tables: `bookings`, `services`, `stylists`
3. Replace JSON read/write logic in each route file with Supabase queries
4. The API endpoints and frontend stay exactly the same — only the backend storage changes

---

## Roadmap (future features)

- [ ] Admin login / authentication
- [ ] WhatsApp booking confirmations (Twilio or WhatsApp Business API)
- [ ] Mobile app (React Native)
- [ ] Online payments (Paystack — popular in Ghana)
- [ ] Customer accounts and booking history
- [ ] Email confirmations
- [ ] Multi-location support

---
