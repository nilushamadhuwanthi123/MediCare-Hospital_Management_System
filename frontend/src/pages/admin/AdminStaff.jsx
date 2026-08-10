import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { UserPlus, ShieldCheck } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import { authService } from "../../services/authService";

/**
 * Staff accounts (receptionist / admin) can't be self-registered — see the
 * public RegisterPage, which only ever creates patients. This is the one
 * legitimate path to provision them, gated behind the admin-only
 * /auth/create-staff endpoint.
 */
const AdminStaff = () => {
  const [submitting, setSubmitting] = useState(false);
  const [createdAccounts, setCreatedAccounts] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { role: "receptionist" },
  });

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const res = await authService.createStaff(formData);
      toast.success(`${formData.role} account created`);
      setCreatedAccounts((prev) => [{ ...res.data.data.user, tempPassword: formData.password }, ...prev]);
      reset({ role: formData.role });
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors?.length) apiErrors.forEach((e) => toast.error(e.message));
      else toast.error(err.response?.data?.message || "Could not create staff account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Staff accounts" subtitle="Provision receptionist and admin logins" />

      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: "24px", alignItems: "start" }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <ShieldCheck size={18} color="var(--color-teal-700)" />
            <h3 style={{ fontSize: "16px" }}>Create staff account</h3>
          </div>
          <p style={{ fontSize: "13px", color: "var(--color-slate-600)", marginBottom: "18px" }}>
            Only administrators can create doctor, receptionist, or admin logins. Patients always self-register.
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-group">
              <label className="input-label">Full name</label>
              <input className={`input-field ${errors.name ? "error" : ""}`} {...register("name", { required: "Required", minLength: { value: 2, message: "Too short" } })} />
              {errors.name && <span className="error-text">{errors.name.message}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Email</label>
              <input type="email" className={`input-field ${errors.email ? "error" : ""}`} {...register("email", { required: "Required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" } })} />
              {errors.email && <span className="error-text">{errors.email.message}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Phone</label>
              <input className={`input-field ${errors.phone ? "error" : ""}`} {...register("phone", { required: "Required", pattern: { value: /^[0-9+\-\s]{7,15}$/, message: "Invalid phone" } })} />
              {errors.phone && <span className="error-text">{errors.phone.message}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Role</label>
              <select className="input-field" {...register("role", { required: true })}>
                <option value="receptionist">Receptionist</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Temporary password</label>
              <input
                type="password"
                placeholder="At least 6 characters, letters + numbers"
                className={`input-field ${errors.password ? "error" : ""}`}
                {...register("password", {
                  required: "Required",
                  minLength: { value: 6, message: "Min 6 characters" },
                  pattern: { value: /^(?=.*[a-zA-Z])(?=.*[0-9]).+$/, message: "Needs a letter and a number" },
                })}
              />
              {errors.password && <span className="error-text">{errors.password.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              <UserPlus size={16} /> {submitting ? "Creating..." : "Create account"}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Created this session</h3>
          {createdAccounts.length === 0 ? (
            <p style={{ fontSize: "13.5px", color: "var(--color-slate-600)" }}>
              Accounts you create will be listed here so you can hand off the login details.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {createdAccounts.map((acc) => (
                <div key={acc._id} style={{ background: "var(--color-cream-dim)", borderRadius: "10px", padding: "12px 14px" }}>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>{acc.name} <span className="badge badge-neutral" style={{ textTransform: "capitalize", marginLeft: "6px" }}>{acc.role}</span></div>
                  <div style={{ fontSize: "13px", color: "var(--color-slate-600)" }}>{acc.email}</div>
                  <div style={{ fontSize: "12px", color: "var(--color-slate-300)", marginTop: "4px" }}>
                    Temporary password: <code>{acc.tempPassword}</code> — share securely and ask them to change it after first login.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminStaff;
