import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { Activity, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const ROLE_HOME = {
  admin: "/admin",
  doctor: "/doctor",
  patient: "/patient",
  receptionist: "/receptionist",
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const res = await authService.login(formData);
      const { user, token } = res.data.data;
      login(user, token);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      navigate(ROLE_HOME[user.role] || "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
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
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <Activity size={26} color="var(--color-coral)" />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "24px", color: "var(--color-white)", fontWeight: 600 }}>
              MediCare
            </span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px" }}>Hospital Management System</p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Welcome back</h2>
          <p style={{ color: "var(--color-slate-600)", fontSize: "14px", marginBottom: "22px" }}>
            Log in to access your dashboard
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
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
              <label className="input-label">Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 13, top: 13, color: "var(--color-slate-600)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`input-field ${errors.password ? "error" : ""}`}
                  style={{ paddingLeft: "38px", paddingRight: "38px" }}
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={{ position: "absolute", right: 10, top: 9, background: "none", border: "none", color: "var(--color-slate-600)" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting} style={{ marginTop: "8px" }}>
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13.5px", color: "var(--color-slate-600)", marginTop: "20px" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--color-teal-700)", fontWeight: 600 }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
