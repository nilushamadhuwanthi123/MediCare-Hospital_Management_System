import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2, FileText } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import SearchInput from "../../components/dashboard/SearchInput";
import Modal from "../../components/common/Modal";
import { billingService } from "../../services/billingService";
import { patientService } from "../../services/patientService";
import { downloadInvoicePdf } from "../../services/reportService";
import { formatDate, formatCurrency, statusColorMap } from "../../utils/formatters";

const ReceptionistBilling = () => {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
    defaultValues: { items: [{ description: "", quantity: 1, unitPrice: 0 }], discount: 0, tax: 0 },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const subTotal = items?.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0) || 0;

  const loadData = () => {
    setLoading(true);
    Promise.all([
      billingService.getAll({ page, limit: 12, search: search || undefined }),
      patientService.getAll({ limit: 200 }),
    ])
      .then(([b, p]) => {
        setBills(b.data.data);
        setTotalPages(b.data.totalPages);
        setTotal(b.data.total);
        setPatients(p.data.data);
      })
      .catch(() => toast.error("Failed to load billing data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [page, search]);

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const items = formData.items.map((i) => ({
        ...i,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        total: Number(i.quantity) * Number(i.unitPrice),
      }));
      await billingService.create({ ...formData, items, discount: Number(formData.discount), tax: Number(formData.tax) });
      toast.success("Invoice created");
      setModalOpen(false);
      reset({ items: [{ description: "", quantity: 1, unitPrice: 0 }], discount: 0, tax: 0 });
      loadData();
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors?.length) apiErrors.forEach((e) => toast.error(e.message));
      else toast.error(err.response?.data?.message || "Could not create invoice");
    } finally {
      setSubmitting(false);
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
    { key: "status", header: "Status", render: (row) => <span className={`badge ${statusColorMap[row.paymentStatus]}`}>{row.paymentStatus}</span> },
    {
      key: "actions", header: "",
      render: (row) => (
        <button className="btn btn-ghost btn-sm" onClick={() => handleDownloadPdf(row)} disabled={downloadingId === row._id}>
          <FileText size={14} /> {downloadingId === row._id ? "..." : "PDF"}
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Billing"
        subtitle="Create and manage patient invoices"
        action={<button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={17} /> New invoice</button>}
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create invoice" width={620}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label className="input-label">Patient</label>
            <select className={`input-field ${errors.patient ? "error" : ""}`} {...register("patient", { required: "Select a patient" })}>
              <option value="">Choose patient...</option>
              {patients.map((p) => <option key={p._id} value={p._id}>{p.user?.name}</option>)}
            </select>
            {errors.patient && <span className="error-text">{errors.patient.message}</span>}
          </div>

          <label className="input-label" style={{ display: "block", marginBottom: "8px" }}>Bill items</label>
          {fields.map((field, index) => (
            <div key={field.id} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <input placeholder="Description" className="input-field" {...register(`items.${index}.description`, { required: true })} />
              <input type="number" min="1" placeholder="Qty" className="input-field" style={{ maxWidth: 80 }} {...register(`items.${index}.quantity`, { required: true, min: 1 })} />
              <input type="number" min="0" step="0.01" placeholder="Unit price" className="input-field" style={{ maxWidth: 120 }} {...register(`items.${index}.unitPrice`, { required: true, min: 0 })} />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(index)} aria-label="Remove item">
                <Trash2 size={16} color="var(--color-coral)" />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })} style={{ marginBottom: "16px" }}>
            <Plus size={15} /> Add item
          </button>

          <div style={{ display: "flex", gap: "12px" }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Discount</label>
              <input type="number" min="0" step="0.01" className="input-field" {...register("discount")} />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Tax</label>
              <input type="number" min="0" step="0.01" className="input-field" {...register("tax")} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Payment method</label>
            <select className="input-field" {...register("paymentMethod")}>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="insurance">Insurance</option>
              <option value="bank-transfer">Bank transfer</option>
              <option value="online">Online</option>
            </select>
          </div>

          <div style={{ background: "var(--color-teal-100)", borderRadius: "10px", padding: "14px", marginBottom: "16px", textAlign: "right" }}>
            <span style={{ fontSize: "13px", color: "var(--color-slate-600)" }}>Subtotal: </span>
            <span style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>{formatCurrency(subTotal)}</span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>{submitting ? "Creating..." : "Create invoice"}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default ReceptionistBilling;
