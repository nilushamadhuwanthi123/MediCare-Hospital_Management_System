import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";

import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import PatientOverview from "./pages/patient/PatientOverview";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientRecords from "./pages/patient/PatientRecords";
import PatientBilling from "./pages/patient/PatientBilling";

import DoctorOverview from "./pages/doctor/DoctorOverview";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPatients from "./pages/doctor/DoctorPatients";

import ReceptionistOverview from "./pages/receptionist/ReceptionistOverview";
import ReceptionistAppointments from "./pages/receptionist/ReceptionistAppointments";
import ReceptionistPatients from "./pages/receptionist/ReceptionistPatients";
import ReceptionistBilling from "./pages/receptionist/ReceptionistBilling";

import AdminOverview from "./pages/admin/AdminOverview";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminPatients from "./pages/admin/AdminPatients";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminBilling from "./pages/admin/AdminBilling";
import AdminPharmacy from "./pages/admin/AdminPharmacy";
import AdminStaff from "./pages/admin/AdminStaff";

const Unauthorized = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: "12px" }}>
    <h2>403 — Not authorized</h2>
    <p style={{ color: "var(--color-slate-600)" }}>You don't have permission to view this page.</p>
  </div>
);

const NotFound = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: "12px" }}>
    <h2>404 — Page not found</h2>
  </div>
);

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Patient */}
      <Route path="/patient" element={<ProtectedRoute allowedRoles={["patient"]}><PatientOverview /></ProtectedRoute>} />
      <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={["patient"]}><PatientAppointments /></ProtectedRoute>} />
      <Route path="/patient/records" element={<ProtectedRoute allowedRoles={["patient"]}><PatientRecords /></ProtectedRoute>} />
      <Route path="/patient/billing" element={<ProtectedRoute allowedRoles={["patient"]}><PatientBilling /></ProtectedRoute>} />

      {/* Doctor */}
      <Route path="/doctor" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorOverview /></ProtectedRoute>} />
      <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorAppointments /></ProtectedRoute>} />
      <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorPatients /></ProtectedRoute>} />

      {/* Receptionist */}
      <Route path="/receptionist" element={<ProtectedRoute allowedRoles={["receptionist"]}><ReceptionistOverview /></ProtectedRoute>} />
      <Route path="/receptionist/appointments" element={<ProtectedRoute allowedRoles={["receptionist"]}><ReceptionistAppointments /></ProtectedRoute>} />
      <Route path="/receptionist/patients" element={<ProtectedRoute allowedRoles={["receptionist"]}><ReceptionistPatients /></ProtectedRoute>} />
      <Route path="/receptionist/billing" element={<ProtectedRoute allowedRoles={["receptionist"]}><ReceptionistBilling /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminOverview /></ProtectedRoute>} />
      <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDoctors /></ProtectedRoute>} />
      <Route path="/admin/patients" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPatients /></ProtectedRoute>} />
      <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAppointments /></ProtectedRoute>} />
      <Route path="/admin/billing" element={<ProtectedRoute allowedRoles={["admin"]}><AdminBilling /></ProtectedRoute>} />
      <Route path="/admin/pharmacy" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPharmacy /></ProtectedRoute>} />
      <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={["admin"]}><AdminStaff /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
