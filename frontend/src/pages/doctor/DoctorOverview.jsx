import { useEffect, useState } from "react";
import { Calendar, Users, CheckCircle, Clock } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import { appointmentService } from "../../services/appointmentService";
import { useAuth } from "../../context/AuthContext";
import { formatDate, statusColorMap } from "../../utils/formatters";

const DoctorOverview = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentService
      .getAll({ limit: 200 })
      .then((res) => setAppointments(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toDateString();
  const todayAppts = appointments.filter((a) => new Date(a.appointmentDate).toDateString() === today);
  const pending = appointments.filter((a) => a.status === "pending");
  const completed = appointments.filter((a) => a.status === "completed");

  const uniquePatients = new Set(appointments.map((a) => a.patient?._id)).size;

  return (
    <DashboardLayout>
      <PageHeader title={`Welcome, Dr. ${user?.name?.split(" ")[0]}`} subtitle="Here's your schedule overview" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
        <StatCard icon={Calendar} label="Today's appointments" value={todayAppts.length} tint="teal" />
        <StatCard icon={Clock} label="Pending requests" value={pending.length} tint="amber" />
        <StatCard icon={CheckCircle} label="Completed visits" value={completed.length} tint="sage" />
        <StatCard icon={Users} label="Total patients seen" value={uniquePatients} tint="coral" />
      </div>

      <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Today's schedule</h3>

      {loading ? (
        <div className="card" style={{ display: "flex", justifyContent: "center", padding: "50px" }}>
          <Spinner />
        </div>
      ) : todayAppts.length === 0 ? (
        <div className="card">
          <EmptyState icon={Calendar} title="No appointments today" description="Enjoy the quiet — nothing is scheduled for today." />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {todayAppts.map((appt) => (
            <div key={appt._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "15px" }}>{appt.patient?.user?.name}</div>
                <div style={{ fontSize: "13.5px", color: "var(--color-slate-600)", marginTop: "2px" }}>
                  {appt.timeSlot} · {appt.reasonForVisit}
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

export default DoctorOverview;
