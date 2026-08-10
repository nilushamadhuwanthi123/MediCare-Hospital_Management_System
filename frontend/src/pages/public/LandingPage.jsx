import { Link } from "react-router-dom";
import {
  Activity,
  Calendar,
  Stethoscope,
  ClipboardList,
  Receipt,
  Pill,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: Calendar,
    title: "Appointment booking",
    desc: "Patients book directly into a doctor's open slots. The system blocks double-bookings before they happen.",
  },
  {
    icon: ClipboardList,
    title: "Medical records",
    desc: "Every diagnosis, allergy, and visit lives in one place — accessible to the care team that needs it.",
  },
  {
    icon: Stethoscope,
    title: "Doctor schedules",
    desc: "Set weekly availability once. Patients only ever see slots that are actually open.",
  },
  {
    icon: Receipt,
    title: "Billing & invoices",
    desc: "Itemized invoices generate automatically, with running totals and payment status at a glance.",
  },
  {
    icon: Pill,
    title: "Pharmacy inventory",
    desc: "Track stock by batch and expiry date. Low-stock items surface themselves — no spreadsheet required.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    desc: "Admins, doctors, receptionists, and patients each see exactly what their role needs — nothing more.",
  },
];

const LandingPage = () => {
  return (
    <div style={{ background: "var(--color-cream)" }}>
      {/* Nav */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "22px 48px",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Activity size={24} color="var(--color-coral)" />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--color-teal-900)" }}>
            MediCare
          </span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link to="/login" className="btn btn-ghost">
            Log in
          </Link>
          <Link to="/register" className="btn btn-primary">
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 48px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "56px", alignItems: "center" }}>
          <div>
            <div
              className="badge badge-neutral"
              style={{ marginBottom: "20px" }}
            >
              <Activity size={13} /> Built for everyday hospital operations
            </div>
            <h1 style={{ fontSize: "48px", lineHeight: 1.08, marginBottom: "20px" }}>
              One system, every <span style={{ color: "var(--color-coral)" }}>ward</span> of your hospital.
            </h1>
            <p style={{ fontSize: "17px", color: "var(--color-slate-600)", marginBottom: "32px", maxWidth: 480 }}>
              MediCare brings appointments, patient records, billing, and pharmacy stock into one place —
              so your staff spend less time switching tabs and more time with patients.
            </p>
            <div style={{ display: "flex", gap: "14px" }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: "13px 26px", fontSize: "15px" }}>
                Create an account <ArrowRight size={17} />
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: "13px 26px", fontSize: "15px" }}>
                Log in
              </Link>
            </div>
          </div>

          {/* Visual: schematic "vitals" panel — signature element */}
          <div className="card" style={{ padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-slate-600)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Today at a glance
              </span>
              <span className="badge badge-success">Live</span>
            </div>
            <div className="vitals-strip" style={{ marginBottom: "22px" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {[
                { label: "Appointments today", value: "32", tint: "teal" },
                { label: "Doctors on duty", value: "8", tint: "sage" },
                { label: "Pending invoices", value: "5", tint: "amber" },
                { label: "Low-stock items", value: "2", tint: "coral" },
              ].map((s) => (
                <div key={s.label} style={{ background: "var(--color-cream-dim)", borderRadius: "12px", padding: "16px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, color: "var(--color-teal-900)" }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: "12.5px", color: "var(--color-slate-600)", marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: "var(--color-white)", padding: "72px 48px", borderTop: "1px solid var(--color-border)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 48px" }}>
            <h2 style={{ fontSize: "32px", marginBottom: "12px" }}>Everything the front desk to the pharmacy needs</h2>
            <p style={{ color: "var(--color-slate-600)", fontSize: "15.5px" }}>
              Four roles, one shared source of truth. No more calling across departments to check a status.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="card">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "10px",
                    background: "var(--color-teal-100)",
                    color: "var(--color-teal-700)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <f.icon size={21} />
                </div>
                <h3 style={{ fontSize: "16.5px", marginBottom: "8px" }}>{f.title}</h3>
                <p style={{ fontSize: "14px", color: "var(--color-slate-600)", lineHeight: 1.55 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "72px 48px" }}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            background: "var(--color-teal-900)",
            borderRadius: "20px",
            padding: "56px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "28px", color: "var(--color-white)", marginBottom: "12px" }}>
            Ready to bring your hospital online?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "28px", fontSize: "15px" }}>
            Set up takes minutes. Your team can be booking appointments today.
          </p>
          <Link to="/register" className="btn btn-primary" style={{ padding: "13px 28px", fontSize: "15px", display: "inline-flex" }}>
            Get started for free <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer style={{ textAlign: "center", padding: "28px", color: "var(--color-slate-600)", fontSize: "13px" }}>
        © 2026 MediCare Hospital Management System. Built by Nilusha.
      </footer>
    </div>
  );
};

export default LandingPage;
