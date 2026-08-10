import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  Receipt,
  Pill,
  LogOut,
  Activity,
  ClipboardList,
  UserCog,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getInitials } from "../../utils/formatters";
import NotificationBell from "../dashboard/NotificationBell";

const NAV_CONFIG = {
  admin: [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/admin/doctors", label: "Doctors", icon: Stethoscope },
    { to: "/admin/patients", label: "Patients", icon: Users },
    { to: "/admin/appointments", label: "Appointments", icon: Calendar },
    { to: "/admin/billing", label: "Billing", icon: Receipt },
    { to: "/admin/pharmacy", label: "Pharmacy", icon: Pill },
    { to: "/admin/staff", label: "Staff Accounts", icon: UserCog },
  ],
  doctor: [
    { to: "/doctor", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/doctor/appointments", label: "My Appointments", icon: Calendar },
    { to: "/doctor/patients", label: "My Patients", icon: Users },
  ],
  patient: [
    { to: "/patient", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/patient/appointments", label: "My Appointments", icon: Calendar },
    { to: "/patient/records", label: "Medical Records", icon: ClipboardList },
    { to: "/patient/billing", label: "My Bills", icon: Receipt },
  ],
  receptionist: [
    { to: "/receptionist", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/receptionist/appointments", label: "Appointments", icon: Calendar },
    { to: "/receptionist/patients", label: "Patients", icon: Users },
    { to: "/receptionist/billing", label: "Billing", icon: Receipt },
  ],
};

const ROLE_LABEL = {
  admin: "Administrator",
  doctor: "Doctor",
  patient: "Patient",
  receptionist: "Receptionist",
};

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = NAV_CONFIG[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-cream)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 248,
          background: "var(--color-teal-900)",
          color: "var(--color-white)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "26px 22px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Activity size={22} color="var(--color-coral)" />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "19px", fontWeight: 600 }}>
              MediCare
            </span>
          </div>
        </div>
        <div className="vitals-strip" style={{ opacity: 0.3 }} />

        <nav style={{ flex: 1, padding: "20px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "11px 14px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--color-teal-900)" : "rgba(255,255,255,0.85)",
                background: isActive ? "var(--color-white)" : "transparent",
                transition: "background 0.15s ease",
              })}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: "16px 18px", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--color-coral)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {getInitials(user?.name)}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name}
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>{ROLE_LABEL[user?.role]}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-block btn-sm"
            style={{ color: "rgba(255,255,255,0.85)", justifyContent: "flex-start" }}
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "16px 40px",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-white)",
            flexShrink: 0,
          }}
        >
          <NotificationBell />
        </header>
        <div style={{ padding: "32px 40px", flex: 1 }}>{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
