import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Download, FileText } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import SearchInput from "../../components/dashboard/SearchInput";
import Modal from "../../components/common/Modal";
import { billingService } from "../../services/billingService";
import { reportService, downloadInvoicePdf } from "../../services/reportService";
import { formatDate, formatCurrency, statusColorMap } from "../../utils/formatters";

const AdminBilling = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadData = () => {
    setLoading(true);
    billingService
      .getAll({ page, limit: 12, search: search || undefined })
      .then((res) => {
        setBills(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      })
      .catch(() => toast.error("Failed to load invoices"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [page, search]);

  const openPayment = (bill) => {
    setSelected(bill);
    reset({ paymentStatus: bill.paymentStatus, amountPaid: bill.amountPaid, paymentMethod: bill.paymentMethod || "cash" });
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await billingService.updatePayment(selected._id, { ...formData, amountPaid: Number(formData.amountPaid) });
      toast.success("Payment updated");
      setSelected(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await reportService.exportBilling();
    } catch {
      toast.error("Could not export billing data");
    } finally {
      setExporting(false);
    }
  };

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
    { key: "patient", header: "Patient", render: (row) => row.patient?.user?.name || "—" },
    { key: "date", header: "Date", render: (row) => formatDate(row.createdAt) },
    { key: "grandTotal", header: "Total", render: (row) => formatCurrency(row.grandTotal) },
    { key: "amountPaid", header: "Paid", render: (row) => formatCurrency(row.amountPaid) },
    { key: "status", header: "Status", render: (row) => <span className={`badge ${statusColorMap[row.paymentStatus]}`}>{row.paymentStatus}</span> },
    {
      key: "actions", header: "",
      render: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => handleDownloadPdf(row)} disabled={downloadingId === row._id}>
            <FileText size={14} /> {downloadingId === row._id ? "..." : "PDF"}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => openPayment(row)}>Update payment</button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Billing"
        subtitle="All invoices and payment tracking"
        action={
          <button className="btn btn-secondary" onClick={handleExport} disabled={exporting}>
            <Download size={16} /> {exporting ? "Exporting..." : "Export CSV"}
          </button>
        }
      />
      <div style={{ marginBottom: "16px" }}>
        <SearchInput placeholder="Search invoice number..." onSearch={(v) => { setSearch(v); setPage(1); }} />
      </div>
      <DataTable
        columns={columns}
        data={bills}
        loading={loading}
        emptyMessage="No invoices created yet."
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Update payment">
        {selected && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ background: "var(--color-cream-dim)", borderRadius: "10px", padding: "14px", marginBottom: "18px" }}>
              <div style={{ fontWeight: 600 }}>{selected.invoiceNumber}</div>
              <div style={{ fontSize: "13.5px", color: "var(--color-slate-600)" }}>
                Total: {formatCurrency(selected.grandTotal)}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Payment status</label>
              <select className="input-field" {...register("paymentStatus", { required: true })}>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Amount paid</label>
              <input type="number" min="0" step="0.01" className={`input-field ${errors.amountPaid ? "error" : ""}`} {...register("amountPaid", { required: "Required", min: 0 })} />
              {errors.amountPaid && <span className="error-text">{errors.amountPaid.message}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Payment method</label>
              <select className="input-field" {...register("paymentMethod", { required: true })}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="insurance">Insurance</option>
                <option value="bank-transfer">Bank transfer</option>
                <option value="online">Online</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button type="button" className="btn btn-ghost" onClick={() => setSelected(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>{submitting ? "Saving..." : "Save"}</button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AdminBilling;
