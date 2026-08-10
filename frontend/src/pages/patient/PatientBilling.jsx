import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FileText } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import { billingService } from "../../services/billingService";
import { downloadInvoicePdf } from "../../services/reportService";
import { formatDate, formatCurrency, statusColorMap } from "../../utils/formatters";

const PatientBilling = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    billingService
      .getAll({ limit: 100 })
      .then((res) => setBills(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadPdf = async (bill) => {
    setDownloadingId(bill._id);
    try {
      await downloadInvoicePdf(bill._id, bill.invoiceNumber);
    } catch {
      toast.error("Could not download invoice PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = [
    { key: "invoiceNumber", header: "Invoice #" },
    { key: "date", header: "Date", render: (row) => formatDate(row.createdAt) },
    { key: "grandTotal", header: "Amount", render: (row) => formatCurrency(row.grandTotal) },
    { key: "amountPaid", header: "Paid", render: (row) => formatCurrency(row.amountPaid) },
    {
      key: "paymentStatus",
      header: "Status",
      render: (row) => <span className={`badge ${statusColorMap[row.paymentStatus]}`}>{row.paymentStatus}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <button className="btn btn-ghost btn-sm" onClick={() => handleDownloadPdf(row)} disabled={downloadingId === row._id}>
          <FileText size={14} /> {downloadingId === row._id ? "..." : "Download PDF"}
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="My bills" subtitle="View your invoices and payment status" />
      <DataTable columns={columns} data={bills} loading={loading} emptyMessage="You have no invoices yet." />
    </DashboardLayout>
  );
};

export default PatientBilling;
