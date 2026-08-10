# MediCare HMS — Backend API

A full-featured Hospital Management System backend built with the **MERN** stack (MongoDB, Express, React, Node.js — this repo covers the API). Supports four user roles (Admin, Doctor, Patient, Receptionist) with role-based access control, appointment booking with real availability checking, medical records, billing with PDF invoices, and pharmacy inventory management.

## Tech Stack

- **Node.js + Express** — REST API
- **MongoDB + Mongoose** — Database & ODM
- **JWT** — Authentication
- **Joi** — Request validation
- **bcryptjs** — Password hashing
- **PDFKit** — Branded PDF invoice generation
- **Helmet, CORS, express-rate-limit, compression** — Security & performance hardening

## Features

- 🔐 JWT authentication with role-based access control (admin / doctor / patient / receptionist). Public self-registration can only ever create a `patient` account — staff accounts are provisioned by an admin via `/api/auth/create-staff`, closing off a privilege-escalation path that existed in earlier versions of this codebase.
- 📅 Appointment booking against a doctor's **real remaining availability** (`GET /api/doctors/:id/slots?date=`), with a race-condition check on create so two people can't book the same slot.
- 🩺 Doctor profiles with specialization, schedule & weekly availability windows
- 📋 Patient profiles with medical history tracking, scoped so patients can only ever see their own records
- 💳 Billing & invoicing with atomic, race-condition-free invoice numbers and downloadable branded PDF invoices
- 💊 Pharmacy inventory management with low-stock detection that fires an in-app notification to admins
- 🔔 In-app notifications (new appointments, status changes, invoices, low stock)
- 📊 Admin analytics endpoint (revenue trend, appointment breakdowns) via MongoDB aggregation
- 📤 CSV export endpoints for patients, billing, and appointments
- 📄 Pagination + search/filtering on every list endpoint
- ✅ Full request validation on every endpoint using Joi
- 🛡️ Centralized error handling with machine-readable error codes, request-ID log correlation, rate limiting, and a NoSQL-injection sanitizer

## Project Structure

```
backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/                # Business logic per module
├── middleware/
│   ├── authMiddleware.js       # JWT verify + role authorization
│   ├── validate.js             # Generic Joi validation middleware
│   ├── errorMiddleware.js      # Global error handler
│   ├── rateLimiters.js         # Auth + general API rate limits
│   ├── sanitize.js             # NoSQL-injection guard
│   └── requestId.js            # Per-request trace ID
├── models/                     # Mongoose schemas
├── routes/                     # Express routers
├── validations/                # Joi schemas per module
├── utils/                       # AppError, PDF/CSV generation, notifications
├── scripts/seed.js              # Demo data seeder
├── server.js                   # App entry point
└── .env.example
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

3. Make sure MongoDB is running locally, or use a MongoDB Atlas connection string in `MONGO_URI`.

4. (Optional but recommended) Seed demo data:
   ```bash
   npm run seed
   ```

5. Run in development:
   ```bash
   npm run dev
   ```

   Or in production:
   ```bash
   npm start
   ```

The API will be available at `http://localhost:5000`. Check `GET /api/health` to confirm the database connected.

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new **patient** account |
| POST | `/api/auth/create-staff` | Admin | Create a doctor / receptionist / admin account |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | Private | Get current logged-in user |
| PUT | `/api/auth/me` | Private | Update own profile |
| PUT | `/api/auth/change-password` | Private | Change own password |

### Doctors
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/doctors` | Public (paginated, search/filter) |
| GET | `/api/doctors/:id` | Public |
| GET | `/api/doctors/:id/slots?date=` | Public — real remaining availability for that day |
| POST | `/api/doctors` | Admin |
| PUT | `/api/doctors/:id` | Admin, Doctor (own) |
| DELETE | `/api/doctors/:id` | Admin |

### Patients
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/patients` | Admin, Doctor, Receptionist (paginated, search) |
| GET | `/api/patients/:id` | Self, Admin, Doctor, Receptionist |
| PUT | `/api/patients/:id` | Self, Admin, Doctor |
| POST | `/api/patients/:id/medical-history` | Admin, Doctor |

### Appointments
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/appointments` | Patient, Receptionist, Admin — rejects double-booked slots |
| GET | `/api/appointments` | All roles (auto-filtered to own records; paginated, status/date filters) |
| GET | `/api/appointments/:id` | All roles |
| PUT | `/api/appointments/:id` | Admin, Receptionist, Doctor |
| DELETE | `/api/appointments/:id` | Admin, Receptionist |

### Billing
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/billing` | Admin, Receptionist |
| GET | `/api/billing` | All roles — patients see only their own invoices |
| GET | `/api/billing/:id` | All roles (own invoice for patients) |
| GET | `/api/billing/:id/pdf` | All roles — streams a branded PDF invoice |
| PUT | `/api/billing/:id/payment` | Admin, Receptionist |

### Pharmacy
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/pharmacy` | Admin |
| GET | `/api/pharmacy?lowStock=true&search=` | Admin, Doctor, Receptionist |
| GET | `/api/pharmacy/:id` | Admin, Doctor, Receptionist |
| PUT | `/api/pharmacy/:id` | Admin |
| DELETE | `/api/pharmacy/:id` | Admin |

### Notifications
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/notifications` | Private — own notifications |
| PUT | `/api/notifications/:id/read` | Private |
| PUT | `/api/notifications/read-all` | Private |
| DELETE | `/api/notifications/:id` | Private |

### Reports & analytics
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/reports/dashboard-summary` | Admin, Receptionist, Doctor |
| GET | `/api/reports/patient-summary` | Patient |
| GET | `/api/reports/export/patients` | Admin, Receptionist — CSV |
| GET | `/api/reports/export/billing` | Admin, Receptionist — CSV |
| GET | `/api/reports/export/appointments` | Admin, Receptionist — CSV |

## Sample Request

**Register (always creates a patient):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nilusha Perera",
    "email": "nilusha@example.com",
    "password": "test1234",
    "phone": "+94771234567"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "nilusha@example.com", "password": "test1234" }'
```

Use the returned `token` in the `Authorization: Bearer <token>` header for all protected routes.

## Next Steps

- Add file upload for profile images / lab reports (e.g. Multer + Cloudinary)
- Add real email/SMS delivery for appointment reminders (the notification system already models this — it just needs a transport)
- Add automated integration tests against a real MongoDB instance in CI
- Deploy backend (Render/Railway) + frontend (Vercel/Netlify) + DB (MongoDB Atlas)
