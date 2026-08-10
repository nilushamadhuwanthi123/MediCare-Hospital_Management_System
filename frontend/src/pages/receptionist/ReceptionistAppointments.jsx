import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import Modal from "../../components/common/Modal";
import DoctorSlotPicker from "../../components/appointments/DoctorSlotPicker";
import { appointmentService } from "../../services/appointmentService";
import { doctorService } from "../../services/doctorService";
import { patientService } from "../../services/patientService";
import { formatDate, statusColorMap } from "../../utils/formatters";

const ReceptionistAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm({
    defaultValues: { patient: "", doctor: "", appointmentDate: "", timeSlot: "" },
  });
  const selectedDoctor = watch("doctor");
  const selectedDate = watch("appointmentDate");

  const loadData = () => {
    setLoading(true);
    Promise.all([
      appointmentService.getAll({ limit: 100 }),
      doctorService.getAll({ limit: 100 }),
      patientService.getAll({ limit: 200 }),
    ])
      .then(([a, d, p]) => {
        setAppointments(a.data.data);
        setDoctors(d.data.data);
        setPatients(p.data.data);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await appointmentService.create(formData);
      toast.success("Appointment booked");
      setModalOpen(false);
      reset({ patient: "", doctor: "", appointmentDate: "", timeSlot: "" });
      loadData();
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors?.length) apiErrors.forEach((e) => toast.error(e.message));
      else toast.error(err.response?.data?.message || "Could not book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await appointmentService.cancel(id);
      toast.success("Appointment cancelled");
      loadData();
    } catch {
      toast.error("Could not cancel appointment");
    }
  };

  const columns = [
    { key: "patient", header: "Patient", render: (row) => row.patient?.user?.name || "—" },
    { key: "doctor", header: "Doctor", render: (row) => `Dr. ${row.doctor?.user?.name || "—"}` },
    { key: "appointmentDate", header: "Date", render: (row) => formatDate(row.appointmentDate) },
    { key: "timeSlot", header: "Time" },
    { key: "status", header: "Status", render: (row) => <span className={`badge ${statusColorMap[row.status]}`}>{row.status}</span> },
    {
      key: "actions", header: "",
      render: (row) => row.status !== "cancelled" && row.status !== "completed" ? (
        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(row._id)}>Cancel</button>
      ) : null,
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Appointments"
        subtitle="Manage all hospital appointments"
        action={<button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={17} /> New appointment</button>}
      />

      <DataTable columns={columns} data={appointments} loading={loading} emptyMessage="No appointments booked yet." />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Book appointment for patient">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label className="input-label">Patient</label>
            <select className={`input-field ${errors.patient ? "error" : ""}`} {...register("patient", { required: "Select a patient" })}>
              <option value="">Choose patient...</option>
              {patients.map((p) => <option key={p._id} value={p._id}>{p.user?.name} ({p.user?.email})</option>)}
            </select>
            {errors.patient && <span className="error-text">{errors.patient.message}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Doctor</label>
            <select className={`input-field ${errors.doctor ? "error" : ""}`} {...register("doctor", { required: "Select a doctor" })}>
              <option value="">Choose doctor...</option>
              {doctors.map((d) => <option key={d._id} value={d._id}>Dr. {d.user?.name} — {d.specialization}</option>)}
            </select>
            {errors.doctor && <span className="error-text">{errors.doctor.message}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Date</label>
            <input type="date" min={new Date().toISOString().split("T")[0]} className={`input-field ${errors.appointmentDate ? "error" : ""}`} {...register("appointmentDate", { required: "Select a date" })} />
            {errors.appointmentDate && <span className="error-text">{errors.appointmentDate.message}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Time slot</label>
            <Controller
              name="timeSlot"
              control={control}
              rules={{ required: "Please select a time slot" }}
              render={({ field }) => (
                <DoctorSlotPicker
                  doctorId={selectedDoctor}
                  date={selectedDate}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={submitting}
                />
              )}
            />
            {errors.timeSlot && <span className="error-text">{errors.timeSlot.message}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Reason for visit</label>
            <textarea rows={3} className={`input-field ${errors.reasonForVisit ? "error" : ""}`} {...register("reasonForVisit", { required: "Reason is required", minLength: { value: 3, message: "Too short" } })} />
            {errors.reasonForVisit && <span className="error-text">{errors.reasonForVisit.message}</span>}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>{submitting ? "Booking..." : "Confirm booking"}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default ReceptionistAppointments;
