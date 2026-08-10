# MediCare HMS — Hospital Management System

A full-stack (MERN) hospital management platform: patient portal, doctor
scheduling, front-desk operations, billing/invoicing, pharmacy inventory,
and an admin analytics dashboard — built as a real, demoable product rather
than a CRUD skeleton.

**Live demo data, in under a minute:** run the seed script (see below) and
log in as an admin, doctor, receptionist, or patient to see the whole system
populated with realistic Sri Lankan hospital data.

---

## What's in this version

This started from a solid MERN CRUD base and was hardened and extended into
something closer to how a real hospital system behaves and fails:

**Security fixes**
- Public registration could previously create an `admin` account by sending
  `role: "admin"` in the request body — a privilege-escalation bug. Public
  `/api/auth/register` now always creates a `patient` account; doctor,
  receptionist, and admin accounts can only be provisioned by an existing
  admin through a dedicated `/api/auth/create-staff` endpoint (**Admin →
  Staff Accounts** in the UI).
- Patients previously had no way to view their own invoices — `GET
  /api/billing` was admin/receptionist-only with no patient-scoped route.
  Fixed: the same endpoint now scopes results to "my invoices only" when
  called by a patient.
- Hand-rolled NoSQL-injection sanitizer, rate limiting (stricter on
  `/auth`), Helmet security headers, and a per-request ID for log
  correlation.

**Real-world features added**
- **Doctor-slot booking** — appointment booking now checks a doctor's actual
  weekly availability minus already-booked slots (`GET
  /doctors/:id/slots?date=`), instead of showing a fixed list of times
  regardless of who's free. Booking a taken slot is now rejected before the
  user even sees it as an option, not just caught after submit.
- **PDF invoices** — every invoice can be downloaded as a branded PDF
  (patients, receptionists, and admins all have a "Download PDF" button).
- **CSV exports** — patients, appointments, and billing records can be
  exported for admins/receptionists.
- **Admin analytics dashboard** — revenue trend, appointment status
  breakdown, and appointments-by-department, computed with MongoDB
  aggregation and rendered with Recharts.
- **In-app notifications** — a notification bell (with unread badge) fires
  on new appointments, status changes, invoice updates, and low pharmacy
  stock, polling every 30s.
- **Pagination + search** on every admin list (patients, appointments,
  billing, pharmacy) instead of loading the entire collection at once.
- **Atomic invoice numbering** — replaced a `countDocuments()`-based
  invoice number (unsafe under concurrent requests) with an atomic counter
  collection.
- Centralized error handling with machine-readable error codes, graceful
  shutdown, and structured logging.

---

## Tech stack

- **Frontend:** React 18 + Vite, React Router, React Hook Form, Recharts,
  Axios, react-hot-toast, lucide-react icons
- **Backend:** Node.js + Express, MongoDB + Mongoose, JWT auth, Joi
  validation, PDFKit, Helmet, express-rate-limit
- **Database:** MongoDB (local or Atlas)

---

## Project structure

```
medicare-hms/
├── backend/        Express API (see backend/README.md)
└── frontend/        React app (see frontend/README.md)
```

---

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env      # then edit MONGO_URI, JWT_SECRET
npm install
npm run seed               # populates demo data — safe to re-run
npm run dev                 # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env       # VITE_API_URL should match your backend
npm install
npm run dev                  # starts on http://localhost:5173
```

Open `http://localhost:5173`.

### Demo accounts (created by `npm run seed`)

All demo accounts use the password: **`Demo@1234`**

| Role | Email |
|---|---|
| Admin | admin@medicare.health |
| Receptionist | reception@medicare.health |
| Doctor | ruwan.jayasinghe@medicare.health |
| Doctor | nadeesha.w@medicare.health |
| Patient | tharindu@example.com |
| Patient | dilani@example.com |

(Full list is printed to the console when the seed script runs.)

---

## Health check

Once the backend is running:

```bash
curl http://localhost:5000/api/health
```

Should return `{"success":true,"database":"connected",...}`.

---

## Pushing this to your own GitHub repo

```bash
cd medicare-hms          # the folder this README is in
git init
git add .
git commit -m "MediCare HMS — full-stack hospital management system"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

`node_modules/`, `.env`, and build output are already excluded via
`.gitignore` in both `backend/` and `frontend/`.

---

## Testing it actually runs

Both apps were verified in a clean environment before this was handed to
you:
- `backend`: every file passes `node --check`; the full Express app
  (all routes, controllers, models, middleware) loads and mounts without
  error.
- `frontend`: `npm run build` completes cleanly with Vite — no compile
  errors across any page or component.

The one thing that couldn't be tested in this sandbox is a live MongoDB
connection (no outbound access to a Mongo instance here) — so **please run
`npm run seed` yourself once you've pointed `MONGO_URI` at a real database**
(local MongoDB or a free MongoDB Atlas cluster both work) as your own final
check before treating it as done.

---

Built by Nilusha.
