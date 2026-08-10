import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import Modal from "../../components/common/Modal";
import { doctorService } from "../../services/doctorService";
import { authService } from "../../services/authService";
import { formatCurrency } from "../../utils/formatters";

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadData = () => {
    setLoading(true);
    doctorService.getAll().then((res) => setDoctors(res.data.data)).catch(() => toast.error("Failed to load doctors")).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  // Creates the underlying staff user account (role=doctor) via the admin-only
  // endpoint, then the doctor profile that references it.
  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const userRes = await authService.createStaff({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: "doctor",
      });
      const newUserId = userRes.data.data.user._id;

      await doctorService.create({
        user: newUserId,
        specialization: formData.specialization,
        qualification: formData.qualification,
        experienceYears: Number(formData.experienceYears) || 0,
        department: formData.department,
        consultationFee: Number(formData.consultationFee),
      });

      toast.success("Doctor added successfully");
      setModalOpen(false);
      reset();
      loadData();
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors?.length) apiErrors.forEach((e) => toast.error(e.message));
      else toast.error(err.response?.data?.message || "Could not add doctor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await doctorService.remove(id);
      toast.success("Doctor removed");
      loadData();
    } catch {
      toast.error("Could not remove doctor");
    }
  };

  const columns = [
    { key: "name", header: "Name", render: (row) => `Dr. ${row.user?.name || "—"}` },
    { key: "specialization", header: "Specialization" },
    { key: "department", header: "Department" },
    { key: "fee", header: "Consultation fee", render: (row) => formatCurrency(row.consultationFee) },
    {
      key: "actions", header: "",
      render: (row) => <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row._id)}><Trash2 size={14} /></button>,
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Doctors"
        subtitle="Manage hospital doctors"
        action={<button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={17} /> Add doctor</button>}
      />

      <DataTable columns={columns} data={doctors} loading={loading} emptyMessage="No doctors added yet." />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add new doctor" width={560}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="input-group">
              <label className="input-label">Full name</label>
              <input className={`input-field ${errors.name ? "error" : ""}`} {...register("name", { required: "Required" })} />
              {errors.name && <span className="error-text">{errors.name.message}</span>}
            </div>
            <div className="input-group">
              <label className="input-label">Phone</label>
              <input className={`input-field ${errors.phone ? "error" : ""}`} {...register("phone", { required: "Required", pattern: { value: /^[0-9+\-\s]{7,15}$/, message: "Invalid phone" } })} />
              {errors.phone && <span className="error-text">{errors.phone.message}</span>}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <input type="email" className={`input-field ${errors.email ? "error" : ""}`} {...register("email", { required: "Required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" } })} />
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Temporary password</label>
            <input type="password" className={`input-field ${errors.password ? "error" : ""}`} {...register("password", { required: "Required", minLength: { value: 6, message: "Min 6 characters" }, pattern: { value: /^(?=.*[a-zA-Z])(?=.*[0-9]).+$/, message: "Needs a letter and a number" } })} />
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="input-group">
              <label className="input-label">Specialization</label>
              <input placeholder="e.g. Cardiology" className={`input-field ${errors.specialization ? "error" : ""}`} {...register("specialization", { required: "Required" })} />
              {errors.specialization && <span className="error-text">{errors.specialization.message}</span>}
            </div>
            <div className="input-group">
              <label className="input-label">Department</label>
              <input className={`input-field ${errors.department ? "error" : ""}`} {...register("department", { required: "Required" })} />
              {errors.department && <span className="error-text">{errors.department.message}</span>}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Qualification</label>
            <input placeholder="e.g. MBBS, MD" className={`input-field ${errors.qualification ? "error" : ""}`} {...register("qualification", { required: "Required" })} />
            {errors.qualification && <span className="error-text">{errors.qualification.message}</span>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="input-group">
              <label className="input-label">Experience (years)</label>
              <input type="number" min="0" className="input-field" {...register("experienceYears")} />
            </div>
            <div className="input-group">
              <label className="input-label">Consultation fee</label>
              <input type="number" min="0" step="0.01" className={`input-field ${errors.consultationFee ? "error" : ""}`} {...register("consultationFee", { required: "Required", min: 0 })} />
              {errors.consultationFee && <span className="error-text">{errors.consultationFee.message}</span>}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>{submitting ? "Adding..." : "Add doctor"}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminDoctors;
