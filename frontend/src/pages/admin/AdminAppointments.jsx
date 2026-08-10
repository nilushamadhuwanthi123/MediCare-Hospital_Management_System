import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Download } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import { appointmentService } from "../../services/appointmentService";
import { reportService } from "../../services/reportService";
import { formatDate, statusColorMap } from "../../utils/formatters";

const STATUS_OPTIONS = ["", "pending", "confirmed", "completed", "cancelled", "no-show"];

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [exporting, setExporting] = useState(false);

  const loadData = () => {
    setLoading(true);
    appointmentService
      .getAll({ page, limit: 12, status: status || undefined })
      .then((res) => {
        setAppointments(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      })
      .catch(() => toast.error("Failed to load appointments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [page, status]);

  const handleCancel = async (id) => {
    try {
      await appointmentService.cancel(id);
      toast.success("Appointment cancelled");
      loadData();
    } catch {
      toast.error("Could not cancel appointment");
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await reportService.exportAppointments();
    } catch {
      toast.error("Could not export appointments");
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    { key: "patient", header: "Patient", render: (row) => row.patient?.user?.name || "—" },
    { key: "doctor", header: "Doctor", render: (row) => `Dr. ${row.doctor?.user?.name || "—"}` },
    { key: "appointmentDate", header: "Date", render: (row) => formatDate(row.appointmentDate) },
    { key: "timeSlot", header: "Time" },
    { key: "status", header: "Status", render: (row) => <span className={`badge ${statusColorMap[row.status]}`}>{row.status}</span> },
    {
      key: "actions", header: "",
      render: (row) => row.status !== "cancelled" && row.status !== "completed" ? (
        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(row._id)}>Cancel</button>
      ) : null,
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Appointments"
        subtitle="Hospital-wide appointment oversight"
        action={
          <button className="btn btn-secondary" onClick={handleExport} disabled={exporting}>
            <Download size={16} /> {exporting ? "Exporting..." : "Export CSV"}
          </button>
        }
      />
      <div style={{ marginBottom: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s || "all"}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`btn btn-sm ${status === s ? "btn-primary" : "btn-secondary"}`}
            style={{ textTransform: "capitalize" }}
          >
            {s || "All"}
          </button>
        ))}
      </div>
      <DataTable
        columns={columns}
        data={appointments}
        loading={loading}
        emptyMessage="No appointments in the system yet."
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />
    </DashboardLayout>
  );
};

export default AdminAppointments;
