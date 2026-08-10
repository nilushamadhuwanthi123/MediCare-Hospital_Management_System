import { useEffect, useState } from "react";
import { Calendar, Users, Receipt, Clock, DollarSign, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import Spinner from "../../components/common/Spinner";
import { reportService } from "../../services/reportService";
import { formatCurrency } from "../../utils/formatters";

const ReceptionistOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService
      .getDashboardSummary()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error("Failed to load overview"))
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

  return (
    <DashboardLayout>
      <PageHeader title="Front desk overview" subtitle="Today's activity at a glance" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "20px" }}>
        <StatCard icon={Calendar} label="Today's appointments" value={data?.todayAppointments ?? 0} tint="teal" />
        <StatCard icon={Clock} label="Pending confirmations" value={data?.pendingAppointments ?? 0} tint="amber" />
        <StatCard icon={Users} label="Registered patients" value={data?.totalPatients ?? 0} tint="sage" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
        <StatCard icon={DollarSign} label="Total revenue collected" value={formatCurrency(data?.totalRevenue)} tint="sage" />
        <StatCard icon={AlertTriangle} label="Low-stock medicines" value={data?.lowStockCount ?? 0} tint="coral" />
      </div>
    </DashboardLayout>
  );
};

export default ReceptionistOverview;
