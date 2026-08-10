import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { PlusCircle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import Modal from "../../components/common/Modal";
import { patientService } from "../../services/patientService";
import { appointmentService } from "../../services/appointmentService";

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    // Doctors derive their patient list from their appointments (no direct getAllPatients access for doctors)
    appointmentService
      .getAll({ limit: 200 })
      .then((res) => {
        const seen = new Map();
        res.data.data.forEach((appt) => {
          if (appt.patient?._id) seen.set(appt.patient._id, appt.patient);
        });
        setPatients(Array.from(seen.values()));
      })
      .catch(() => toast.error("Failed to load patients"))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await patientService.addMedicalHistory(selected._id, formData);
      toast.success("Medical history added");
      setSelected(null);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save entry");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "name", header: "Patient", render: (row) => row.user?.name || "—" },
    { key: "email", header: "Email", render: (row) => row.user?.email || "—" },
    { key: "bloodGroup", header: "Blood group", render: (row) => row.bloodGroup || "Unknown" },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <button className="btn btn-secondary btn-sm" onClick={() => setSelected(row)}>
          <PlusCircle size={14} /> Add history
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="My patients" subtitle="Patients you've seen through appointments" />

      <DataTable columns={columns} data={patients} loading={loading} emptyMessage="No patients yet — they'll appear after their first appointment with you." />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Add medical history — ${selected?.user?.name || ""}`}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label className="input-label">Condition / diagnosis</label>
            <input
              placeholder="e.g. Type 2 Diabetes"
              className={`input-field ${errors.condition ? "error" : ""}`}
              {...register("condition", { required: "Condition is required", minLength: { value: 2, message: "Too short" } })}
            />
            {errors.condition && <span className="error-text">{errors.condition.message}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Diagnosed date</label>
            <input
              type="date"
              max={new Date().toISOString().split("T")[0]}
              className="input-field"
              {...register("diagnosedDate")}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Notes</label>
            <textarea rows={3} placeholder="Additional notes..." className="input-field" {...register("notes")} />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button type="button" className="btn btn-ghost" onClick={() => setSelected(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? "Saving..." : "Save entry"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default DoctorPatients;
