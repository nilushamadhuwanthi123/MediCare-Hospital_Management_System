import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import SearchInput from "../../components/dashboard/SearchInput";
import Modal from "../../components/common/Modal";
import { pharmacyService } from "../../services/pharmacyService";
import { formatDate, formatCurrency } from "../../utils/formatters";

const AdminPharmacy = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadData = () => {
    setLoading(true);
    pharmacyService
      .getAll({ page, limit: 12, search: search || undefined, lowStock: lowStockOnly ? "true" : undefined })
      .then((res) => {
        setMedicines(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      })
      .catch(() => toast.error("Failed to load inventory"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [page, search, lowStockOnly]);

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await pharmacyService.create({
        ...formData,
        unitPrice: Number(formData.unitPrice),
        quantityInStock: Number(formData.quantityInStock),
        reorderLevel: Number(formData.reorderLevel) || 20,
      });
      toast.success("Medicine added to inventory");
      setModalOpen(false);
      reset();
      loadData();
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors?.length) apiErrors.forEach((e) => toast.error(e.message));
      else toast.error(err.response?.data?.message || "Could not add medicine");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await pharmacyService.remove(id);
      toast.success("Medicine removed");
      loadData();
    } catch {
      toast.error("Could not remove medicine");
    }
  };

  const columns = [
    {
      key: "name", header: "Medicine",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {row.isLowStock && <AlertTriangle size={14} color="var(--color-coral)" />}
          {row.name}
        </div>
      ),
    },
    { key: "category", header: "Category" },
    { key: "quantityInStock", header: "In stock", render: (row) => (
      <span className={`badge ${row.isLowStock ? "badge-danger" : "badge-success"}`}>{row.quantityInStock}</span>
    ) },
    { key: "unitPrice", header: "Unit price", render: (row) => formatCurrency(row.unitPrice) },
    { key: "expiryDate", header: "Expiry", render: (row) => formatDate(row.expiryDate) },
    {
      key: "actions", header: "",
      render: (row) => <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row._id)}><Trash2 size={14} /></button>,
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Pharmacy inventory"
        subtitle="Track stock levels and expiry dates"
        action={<button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={17} /> Add medicine</button>}
      />

      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "center", flexWrap: "wrap" }}>
        <SearchInput placeholder="Search medicine name..." onSearch={(v) => { setSearch(v); setPage(1); }} />
        <button
          className={`btn btn-sm ${lowStockOnly ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setLowStockOnly((v) => !v); setPage(1); }}
        >
          <AlertTriangle size={14} /> Low stock only
        </button>
      </div>

      <DataTable
        columns={columns}
        data={medicines}
        loading={loading}
        emptyMessage="No medicines in inventory yet."
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add medicine to inventory" width={560}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="input-group">
              <label className="input-label">Medicine name</label>
              <input className={`input-field ${errors.name ? "error" : ""}`} {...register("name", { required: "Required" })} />
              {errors.name && <span className="error-text">{errors.name.message}</span>}
            </div>
            <div className="input-group">
              <label className="input-label">Category</label>
              <input placeholder="e.g. Antibiotic" className={`input-field ${errors.category ? "error" : ""}`} {...register("category", { required: "Required" })} />
              {errors.category && <span className="error-text">{errors.category.message}</span>}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Batch number</label>
            <input className={`input-field ${errors.batchNumber ? "error" : ""}`} {...register("batchNumber", { required: "Required" })} />
            {errors.batchNumber && <span className="error-text">{errors.batchNumber.message}</span>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div className="input-group">
              <label className="input-label">Unit price</label>
              <input type="number" min="0" step="0.01" className={`input-field ${errors.unitPrice ? "error" : ""}`} {...register("unitPrice", { required: "Required", min: 0 })} />
              {errors.unitPrice && <span className="error-text">{errors.unitPrice.message}</span>}
            </div>
            <div className="input-group">
              <label className="input-label">Quantity</label>
              <input type="number" min="0" className={`input-field ${errors.quantityInStock ? "error" : ""}`} {...register("quantityInStock", { required: "Required", min: 0 })} />
              {errors.quantityInStock && <span className="error-text">{errors.quantityInStock.message}</span>}
            </div>
            <div className="input-group">
              <label className="input-label">Reorder level</label>
              <input type="number" min="0" placeholder="20" className="input-field" {...register("reorderLevel")} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Expiry date</label>
            <input type="date" min={new Date().toISOString().split("T")[0]} className={`input-field ${errors.expiryDate ? "error" : ""}`} {...register("expiryDate", { required: "Required" })} />
            {errors.expiryDate && <span className="error-text">{errors.expiryDate.message}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Supplier (optional)</label>
            <input className="input-field" {...register("supplier")} />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>{submitting ? "Adding..." : "Add medicine"}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminPharmacy;
