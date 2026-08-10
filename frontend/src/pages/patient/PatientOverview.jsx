import { useEffect, useState } from "react";
import { Calendar, ClipboardList, Receipt, Clock } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import { appointmentService } from "../../services/appointmentService";
import { reportService } from "../../services/reportService";
import { useAuth } from "../../context/AuthContext";
import { formatDate, statusColorMap } from "../../utils/formatters";

const PatientOverview = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([appointmentService.getAll({ limit: 200 }), reportService.getPatientSummary()])
      .then(([apptRes, summaryRes]) => {
        setAppointments(apptRes.data.data);
        setSummary(summaryRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(
    (a) => new Date(a.appointmentDate) >= new Date() && ["pending", "confirmed"].includes(a.status)
  );

  return (
    <DashboardLayout>
      <PageHeader
        title={`Hello, ${user?.name?.split(" ")[0]}`}
        subtitle="Here's what's coming up for your care"
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "32px" }}>
        <StatCard icon={Calendar} label="Upcoming appointments" value={summary?.upcomingAppointments ?? upcoming.length} tint="teal" />
        <StatCard icon={ClipboardList} label="Completed visits" value={summary?.totalVisits ?? 0} tint="sage" />
        <StatCard icon={Receipt} label="Unpaid invoices" value={summary?.unpaidInvoices ?? 0} tint="amber" />
      </div>

      <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Upcoming appointments</h3>

      {loading ? (
        <div className="card" style={{ display: "flex", justifyContent: "center", padding: "50px" }}>
          <Spinner />
        </div>
      ) : upcoming.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Clock}
            title="No upcoming appointments"
            description="When you book an appointment, it'll show up here."
          />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {upcoming.slice(0, 5).map((appt) => (
            <div
              key={appt._id}
              className="card"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px" }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: "15px" }}>Dr. {appt.doctor?.user?.name}</div>
                <div style={{ fontSize: "13.5px", color: "var(--color-slate-600)", marginTop: "2px" }}>
                  {formatDate(appt.appointmentDate)} · {appt.timeSlot}
                </div>
              </div>
              <span className={`badge ${statusColorMap[appt.status]}`}>{appt.status}</span>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientOverview;
