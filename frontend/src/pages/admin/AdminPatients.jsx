import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Download } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import SearchInput from "../../components/dashboard/SearchInput";
import { patientService } from "../../services/patientService";
import { reportService } from "../../services/reportService";
import { formatDate } from "../../utils/formatters";

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    patientService
      .getAll({ page, limit: 12, search: search || undefined })
      .then((res) => {
        setPatients(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      })
      .catch(() => toast.error("Failed to load patients"))
      .finally(() => setLoading(false));
  }, [page, search]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await reportService.exportPatients();
    } catch {
      toast.error("Could not export patients");
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    { key: "name", header: "Name", render: (row) => row.user?.name || "—" },
    { key: "email", header: "Email", render: (row) => row.user?.email || "—" },
    { key: "phone", header: "Phone", render: (row) => row.user?.phone || "—" },
    { key: "bloodGroup", header: "Blood group", render: (row) => row.bloodGroup || "Unknown" },
    { key: "registered", header: "Registered", render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Patients"
        subtitle="All registered patients in the system"
        action={
          <button className="btn btn-secondary" onClick={handleExport} disabled={exporting}>
            <Download size={16} /> {exporting ? "Exporting..." : "Export CSV"}
          </button>
        }
      />
      <div style={{ marginBottom: "16px" }}>
        <SearchInput placeholder="Search by name or email..." onSearch={(v) => { setSearch(v); setPage(1); }} />
      </div>
      <DataTable
        columns={columns}
        data={patients}
        loading={loading}
        emptyMessage="No patients registered yet."
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />
    </DashboardLayout>
  );
};

export default AdminPatients;
