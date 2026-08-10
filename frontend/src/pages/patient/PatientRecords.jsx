import { useEffect, useState } from "react";
import { HeartPulse, AlertTriangle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import { patientService } from "../../services/patientService";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/formatters";

const PatientRecords = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientService
      .getAll({ limit: 200 })
      .then((res) => {
        const mine = res.data.data.find((p) => p.user?._id === user._id || p.user === user._id);
        setProfile(mine || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="card" style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
          <Spinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="Medical records" subtitle="Your health information on file" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
        <div className="card">
          <h4 style={{ fontSize: "14px", color: "var(--color-slate-600)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Blood group
          </h4>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", color: "var(--color-teal-700)" }}>
            {profile?.bloodGroup || "Unknown"}
          </div>
        </div>
        <div className="card">
          <h4 style={{ fontSize: "14px", color: "var(--color-slate-600)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Allergies
          </h4>
          {profile?.allergies?.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {profile.allergies.map((a) => (
                <span key={a} className="badge badge-danger">
                  <AlertTriangle size={12} /> {a}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "14px", color: "var(--color-slate-600)" }}>No known allergies on file</p>
          )}
        </div>
      </div>

      <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Medical history</h3>

      {!profile?.medicalHistory?.length ? (
        <div className="card">
          <EmptyState
            icon={HeartPulse}
            title="No medical history recorded"
            description="Your doctor will add diagnoses and notes here after your visits."
          />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {profile.medicalHistory.map((entry, i) => (
            <div key={i} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <h4 style={{ fontSize: "15.5px" }}>{entry.condition}</h4>
                <span style={{ fontSize: "13px", color: "var(--color-slate-600)" }}>
                  {formatDate(entry.diagnosedDate)}
                </span>
              </div>
              {entry.notes && <p style={{ fontSize: "14px", color: "var(--color-slate-600)" }}>{entry.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientRecords;
