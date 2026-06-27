# Glam Studio — Salon Booking System

A full-stack salon booking and management platform built with **React** (frontend) and **Python FastAPI** (backend).

---

## What it does

**Customer side:**
- Browse available services with prices and durations
- Choose a stylist filtered by service
- Register and log in with JWT auth
- Pick an available date and time slot
- Confirm booking in one tap when logged in — no re-entering details
- View and cancel upcoming appointments in My Bookings

**Admin side:**
- Separate admin panel at `/admin` — hidden from the main nav
- Secure login with admin credentials stored in `.env`
- View all bookings — confirm or cancel pending ones
- Track stylist performance and monthly revenue
- See top clients and booking history
- Manage stylists — add, toggle active/inactive

---

## File structure

```
salon-app/
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # React Router setup + nav
│   │   ├── main.jsx              # React entry point
│   │   ├── theme.js              # Dark/light theme tokens
│   │   ├── pages/
│   │   │   ├── booking.jsx       # Full customer booking flow
│   │   │   ├── Admin.jsx         # Admin dashboard — bookings, stylists, revenue, clients
│   │   │   ├── MyBookings.jsx    # Client booking history (JWT protected)
│   │   │   ├── Login.jsx         # Client login
│   │   │   ├── Register.jsx      # Client registration
│   │   │   └── Settings.jsx      # Theme toggle
│   │   └── components/
│   │       ├── ServiceCard.jsx
│   │       ├── StylistPicker.jsx
│   │       ├── DateStrip.jsx
│   │       ├── DatePicker.jsx
│   │       ├── BookingSummary.jsx
│   │       └── Avatar.jsx
│   ├── index.html
│   └── package.json
│
├── backend/
│   ├── main.py                   # FastAPI app entry point + CORS
│   ├── database.py               # PostgreSQL connection (psycopg2)
│   ├── routes/
│   │   ├── auth.py               # Register, login, admin login
│   │   ├── bookings.py           # CRUD for bookings (protected)
│   │   ├── services.py           # CRUD for services
│   │   └── stylists.py           # CRUD for stylists + availability
│   ├── models/
│   │   ├── booking.py
│   │   ├── service.py
│   │   └── stylist.py
│   ├── utils/
│   │   ├── jwt.py                # Token creation and verification
│   │   └── deps.py               # Auth dependencies (client + admin)
│   └── requirements.txt
│
└── README.md
```

---

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React + Vite + React Router |
| Backend | Python 3.11+ + FastAPI |
| Database | PostgreSQL (psycopg2, raw SQL) |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Styling | Inline styles + DM Sans, Playfair Display |

---

## Getting started

### 1. Clone the project

```bash
git clone https://github.com/47Doings/Glam-Studio.git
cd salon-app
```

---

### 2. Set up environment variables

Create a `.env` file in the `backend/` folder:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=glam_studio
DB_USER=postgres
DB_PASSWORD=yourpassword
SECRET_KEY=your-secret-key
ADMIN_EMAIL=admin@glamstudio.com
ADMIN_PASSWORD=youradminpassword
```

---

### 3. Run the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`

API docs available at: `http://localhost:8000/docs`

---

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Routes

| Path | Description |
|---|---|
| `/` | Booking page (public) |
| `/login` | Client login |
| `/register` | Client registration |
| `/mybookings` | Client booking history (JWT protected) |
| `/settings` | Theme toggle |
| `/admin` | Admin dashboard (separate login, hidden from nav) |

---

## API endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new client |
| POST | `/auth/login` | Client login, returns JWT |
| POST | `/auth/admin/login` | Admin login, returns JWT |

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
| PATCH | `/stylists/{id}` | Update a stylist |
| DELETE | `/stylists/{id}` | Delete a stylist |
| GET | `/stylists/{id}/availability` | Get available slots for a date |

### Bookings
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/bookings/` | Get all bookings | Admin |
| GET | `/bookings/client` | Get logged-in client's bookings | Client |
| POST | `/bookings/` | Create a booking | Client |
| POST | `/bookings/quick` | Guest booking (no auth) | Admin |
| PATCH | `/bookings/{id}/status` | Update booking status | Admin |
| PATCH | `/bookings/{id}/cancel` | Cancel a booking | Client |
| DELETE | `/bookings/{id}` | Delete a booking | Admin |

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
vercel
```

### Backend → Render
1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port 10000`
5. Add all `.env` variables in the Render dashboard

---

## Roadmap

- [x] JWT auth — client register/login
- [x] Admin login with protected dashboard
- [x] Price pulled server-side (no client manipulation)
- [x] My Bookings auto-loads after login
- [x] React Router — proper URL routing
- [ ] WhatsApp booking confirmations (Twilio)
- [ ] Online payments (Paystack)
- [ ] Email confirmations
- [ ] Mobile app (React Native)
- [ ] Multi-location support
