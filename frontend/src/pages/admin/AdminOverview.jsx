import { useEffect, useState } from "react";
import { Calendar, Users, Stethoscope, AlertTriangle, DollarSign, Clock } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import Spinner from "../../components/common/Spinner";
import { reportService } from "../../services/reportService";
import { formatCurrency } from "../../utils/formatters";

const STATUS_COLORS = {
  pending: "#d99a3d",
  confirmed: "#1a6b6b",
  completed: "#7fa876",
  cancelled: "#e8745a",
  "no-show": "#c7cdd1",
};

const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService
      .getDashboardSummary()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error("Failed to load dashboard analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="card" style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
          <Spinner />
        </div>
      </DashboardLayout>
    );
  }

  const pieData = (data?.appointmentsByStatus || []).map((s) => ({ name: s.status, value: s.count }));

  return (
    <DashboardLayout>
      <PageHeader title="Admin overview" subtitle="Hospital-wide snapshot, live from the database" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "20px" }}>
        <StatCard icon={DollarSign} label="Total revenue collected" value={formatCurrency(data?.totalRevenue)} tint="sage" />
        <StatCard icon={Calendar} label="Today's appointments" value={data?.todayAppointments ?? 0} tint="teal" />
        <StatCard icon={Clock} label="Pending confirmations" value={data?.pendingAppointments ?? 0} tint="amber" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "28px" }}>
        <StatCard icon={Users} label="Registered patients" value={data?.totalPatients ?? 0} tint="teal" />
        <StatCard icon={Stethoscope} label="Active doctors" value={data?.totalDoctors ?? 0} tint="amber" />
        <StatCard icon={AlertTriangle} label="Low-stock medicines" value={data?.lowStockCount ?? 0} tint="coral" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <div className="card">
          <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>Revenue trend</h3>
          <p style={{ fontSize: "13px", color: "var(--color-slate-600)", marginBottom: "16px" }}>Last 6 months of collected payments</p>
          {data?.revenueTrend?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.revenueTrend}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a6b6b" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#1a6b6b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3ddd3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#5c6670" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#5c6670" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: 10, border: "1px solid #e3ddd3" }} />
                <Area type="monotone" dataKey="revenue" stroke="#0f4c4c" strokeWidth={2.5} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ fontSize: "13.5px", color: "var(--color-slate-600)", padding: "40px 0", textAlign: "center" }}>
              No billing data yet — revenue will appear here once invoices are recorded.
            </p>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>Appointments by status</h3>
          <p style={{ fontSize: "13px", color: "var(--color-slate-600)", marginBottom: "16px" }}>All-time breakdown</p>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#c7cdd1"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e3ddd3" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ fontSize: "13.5px", color: "var(--color-slate-600)", padding: "40px 0", textAlign: "center" }}>
              No appointments yet.
            </p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "8px" }}>
            {pieData.map((entry) => (
              <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "var(--color-slate-600)" }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: STATUS_COLORS[entry.name] || "#c7cdd1", display: "inline-block" }} />
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>Appointments by department</h3>
        <p style={{ fontSize: "13px", color: "var(--color-slate-600)", marginBottom: "16px" }}>Where patient demand is concentrated</p>
        {data?.appointmentsByDepartment?.length ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.appointmentsByDepartment}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3ddd3" vertical={false} />
              <XAxis dataKey="department" tick={{ fontSize: 12, fill: "#5c6670" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#5c6670" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e3ddd3" }} />
              <Bar dataKey="count" fill="#e8745a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ fontSize: "13.5px", color: "var(--color-slate-600)", padding: "40px 0", textAlign: "center" }}>
            No department data yet.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminOverview;
