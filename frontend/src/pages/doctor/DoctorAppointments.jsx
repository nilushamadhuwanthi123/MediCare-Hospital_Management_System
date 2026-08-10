import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import Modal from "../../components/common/Modal";
import { appointmentService } from "../../services/appointmentService";
import { formatDate, statusColorMap } from "../../utils/formatters";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm();

  const { fields, append, remove } = useFieldArray({ control, name: "prescribedMedicines" });

  const loadData = () => {
    setLoading(true);
    appointmentService
      .getAll({ limit: 200 })
      .then((res) => setAppointments(res.data.data))
      .catch(() => toast.error("Failed to load appointments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openConsultation = (appt) => {
    setSelected(appt);
    reset({
      status: appt.status,
      notes: appt.notes || "",
      prescribedMedicines: appt.prescribedMedicines?.length ? appt.prescribedMedicines : [],
    });
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await appointmentService.update(selected._id, formData);
      toast.success("Appointment updated");
      setSelected(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "patient", header: "Patient", render: (row) => row.patient?.user?.name || "—" },
    { key: "appointmentDate", header: "Date", render: (row) => formatDate(row.appointmentDate) },
    { key: "timeSlot", header: "Time" },
    { key: "reasonForVisit", header: "Reason" },
    {
      key: "status",
      header: "Status",
      render: (row) => <span className={`badge ${statusColorMap[row.status]}`}>{row.status}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <button className="btn btn-secondary btn-sm" onClick={() => openConsultation(row)}>
          Manage
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="My appointments" subtitle="Review and update patient consultations" />

      <DataTable columns={columns} data={appointments} loading={loading} emptyMessage="No appointments assigned to you yet." />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Manage appointment" width={560}>
        {selected && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ background: "var(--color-cream-dim)", borderRadius: "10px", padding: "14px", marginBottom: "18px" }}>
              <div style={{ fontWeight: 600, fontSize: "15px" }}>{selected.patient?.user?.name}</div>
              <div style={{ fontSize: "13.5px", color: "var(--color-slate-600)" }}>
                {formatDate(selected.appointmentDate)} · {selected.timeSlot}
              </div>
              <div style={{ fontSize: "13.5px", color: "var(--color-slate-600)", marginTop: "4px" }}>
                Reason: {selected.reasonForVisit}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Status</label>
              <select className="input-field" {...register("status", { required: true })}>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No-show</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Consultation notes</label>
              <textarea
                rows={3}
                placeholder="Diagnosis, observations, follow-up instructions..."
                className="input-field"
                {...register("notes")}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Prescribed medicines</label>
              {fields.map((field, index) => (
                <div key={field.id} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input
                    placeholder="Medicine name"
                    className="input-field"
                    {...register(`prescribedMedicines.${index}.medicineName`, { required: true })}
                  />
                  <input
                    placeholder="Dosage"
                    className="input-field"
                    style={{ maxWidth: 110 }}
                    {...register(`prescribedMedicines.${index}.dosage`, { required: true })}
                  />
                  <input
                    placeholder="Duration"
                    className="input-field"
                    style={{ maxWidth: 110 }}
                    {...register(`prescribedMedicines.${index}.duration`, { required: true })}
                  />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(index)} aria-label="Remove medicine">
                    <Trash2 size={16} color="var(--color-coral)" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => append({ medicineName: "", dosage: "", duration: "" })}
              >
                <Plus size={15} /> Add medicine
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button type="button" className="btn btn-ghost" onClick={() => setSelected(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                {submitting ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default DoctorAppointments;
