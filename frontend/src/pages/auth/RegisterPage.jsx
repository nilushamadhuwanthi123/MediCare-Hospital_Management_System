import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { Activity, Mail, Lock, User, Phone } from "lucide-react";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const ROLE_HOME = {
  admin: "/admin",
  doctor: "/doctor",
  patient: "/patient",
  receptionist: "/receptionist",
};

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { role: "patient" } });

  const password = watch("password");

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const res = await authService.register(formData);
      const { user, token } = res.data.data;
      login(user, token);
      toast.success("Account created successfully!");
      navigate(ROLE_HOME[user.role] || "/");
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors?.length) {
        apiErrors.forEach((e) => toast.error(e.message));
      } else {
        toast.error(err.response?.data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-teal-900)",
        padding: "20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <Activity size={26} color="var(--color-coral)" />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "24px", color: "var(--color-white)", fontWeight: 600 }}>
              MediCare
            </span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px" }}>Hospital Management System</p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Create your account</h2>
          <p style={{ color: "var(--color-slate-600)", fontSize: "14px", marginBottom: "22px" }}>
            Fill in your details to get started
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-group">
              <label className="input-label">Full name</label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: 13, top: 13, color: "var(--color-slate-600)" }} />
                <input
                  type="text"
                  placeholder="Nilusha Perera"
                  className={`input-field ${errors.name ? "error" : ""}`}
                  style={{ paddingLeft: "38px" }}
                  {...register("name", {
                    required: "Name is required",
                    minLength: { value: 2, message: "Name must be at least 2 characters" },
                  })}
                />
              </div>
              {errors.name && <span className="error-text">{errors.name.message}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Email address</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 13, top: 13, color: "var(--color-slate-600)" }} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={`input-field ${errors.email ? "error" : ""}`}
                  style={{ paddingLeft: "38px" }}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
                  })}
                />
              </div>
              {errors.email && <span className="error-text">{errors.email.message}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Phone number</label>
              <div style={{ position: "relative" }}>
                <Phone size={16} style={{ position: "absolute", left: 13, top: 13, color: "var(--color-slate-600)" }} />
                <input
                  type="tel"
                  placeholder="+94 77 123 4567"
                  className={`input-field ${errors.phone ? "error" : ""}`}
                  style={{ paddingLeft: "38px" }}
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: { value: /^[0-9+\-\s]{7,15}$/, message: "Enter a valid phone number" },
                  })}
                />
              </div>
              {errors.phone && <span className="error-text">{errors.phone.message}</span>}
            </div>

            <div className="input-group" style={{ background: "var(--color-teal-100)", borderRadius: "10px", padding: "12px 14px", fontSize: "12.5px", color: "var(--color-teal-900)" }}>
              This creates a <strong>patient</strong> account. Doctor, receptionist, and admin accounts are provisioned by hospital administration for security reasons.
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 13, top: 13, color: "var(--color-slate-600)" }} />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  className={`input-field ${errors.password ? "error" : ""}`}
                  style={{ paddingLeft: "38px" }}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                    pattern: {
                      value: /^(?=.*[a-zA-Z])(?=.*[0-9]).+$/,
                      message: "Password must contain at least one letter and one number",
                    },
                  })}
                />
              </div>
              {errors.password && <span className="error-text">{errors.password.message}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Confirm password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 13, top: 13, color: "var(--color-slate-600)" }} />
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  className={`input-field ${errors.confirmPassword ? "error" : ""}`}
                  style={{ paddingLeft: "38px" }}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) => value === password || "Passwords do not match",
                  })}
                />
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting} style={{ marginTop: "8px" }}>
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13.5px", color: "var(--color-slate-600)", marginTop: "20px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--color-teal-700)", fontWeight: 600 }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
