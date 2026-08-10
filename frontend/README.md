# MediCare HMS — Frontend

React (Vite) frontend for the Hospital Management System. Four role-based dashboards (Admin, Doctor, Patient, Receptionist) consuming the Express/MongoDB backend.

## Tech Stack
- React 18 + Vite
- React Router v6
- React Hook Form (validation)
- Axios (API calls, with JWT interceptor)
- React Hot Toast (notifications)
- Lucide React (icons)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and point it at your backend:
   ```bash
   cp .env.example .env
   ```

3. Make sure the backend server is running (see backend README).

4. Run the dev server:
   ```bash
   npm run dev
   ```

App runs at `http://localhost:5173`.

## Structure

```
src/
├── components/
│   ├── common/        # Spinner, Modal, EmptyState, ProtectedRoute
│   ├── layout/         # DashboardLayout (sidebar nav)
│   └── dashboard/      # StatCard, PageHeader, DataTable
├── context/
│   └── AuthContext.jsx # Global auth state
├── pages/
│   ├── public/          # Landing page
│   ├── auth/             # Login, Register
│   ├── admin/
│   ├── doctor/
│   ├── patient/
│   └── receptionist/
├── services/            # Axios calls per module
├── utils/               # Formatters
└── styles/
    └── globals.css      # Design system (CSS variables, utility classes)
```

## Test accounts

Register through the `/register` page and choose a role. To test the full system:

1. Register an **admin** account
2. Log in as admin → add doctors via "Add doctor" (this creates both the user account and doctor profile)
3. Register a **patient** account separately (or as receptionist on their behalf)
4. Log in as the patient → book an appointment
5. Log in as the doctor → manage the appointment, add notes/prescriptions
6. Log in as admin/receptionist → create an invoice for the patient

## Design system

Colors, type, spacing, and component classes (`.btn`, `.card`, `.badge`, `.input-field`, etc.) are defined in `src/styles/globals.css` as CSS custom properties — adjust the `:root` block to retheme the whole app.
