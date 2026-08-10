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
import { useAuth } from "../../context/AuthContext";
import { formatDate, statusColorMap } from "../../utils/formatters";

const PatientAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientProfileId, setPatientProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { doctor: "", appointmentDate: "", timeSlot: "" } });

  const selectedDoctor = watch("doctor");
  const selectedDate = watch("appointmentDate");

  const loadData = () => {
    setLoading(true);
    Promise.all([appointmentService.getAll({ limit: 100 }), doctorService.getAll({ limit: 100 })])
      .then(([apptRes, docRes]) => {
        setAppointments(apptRes.data.data);
        setDoctors(docRes.data.data);
      })
      .catch(() => toast.error("Failed to load appointments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // Find this patient's own Patient document ID (needed to create appointments)
    patientService
      .getAll({ limit: 200 })
      .then((res) => {
        const mine = res.data.data.find((p) => p.user?._id === user._id || p.user === user._id);
        if (mine) setPatientProfileId(mine._id);
      })
      .catch(() => {
        // Non-admin roles may not have access to getAll patients — fallback handled in onSubmit
      });
  }, []);

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const payload = { ...formData, patient: patientProfileId };
      await appointmentService.create(payload);
      toast.success("Appointment booked successfully");
      setModalOpen(false);
      reset({ doctor: "", appointmentDate: "", timeSlot: "" });
      loadData();
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors?.length) {
        apiErrors.forEach((e) => toast.error(e.message));
      } else {
        toast.error(err.response?.data?.message || "Could not book appointment");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "doctor", header: "Doctor", render: (row) => `Dr. ${row.doctor?.user?.name || "—"}` },
    { key: "department", header: "Department", render: (row) => row.doctor?.department || "—" },
    { key: "appointmentDate", header: "Date", render: (row) => formatDate(row.appointmentDate) },
    { key: "timeSlot", header: "Time" },
    { key: "reasonForVisit", header: "Reason" },
    {
      key: "status",
      header: "Status",
      render: (row) => <span className={`badge ${statusColorMap[row.status]}`}>{row.status}</span>,
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="My appointments"
        subtitle="View and book your appointments"
        action={
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={17} /> Book appointment
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={appointments}
        loading={loading}
        emptyMessage="You haven't booked any appointments yet. Click 'Book appointment' to get started."
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Book an appointment">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label className="input-label">Select doctor</label>
            <select
              className={`input-field ${errors.doctor ? "error" : ""}`}
              {...register("doctor", { required: "Please select a doctor" })}
            >
              <option value="">Choose a doctor...</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  Dr. {d.user?.name} — {d.specialization}
                </option>
              ))}
            </select>
            {errors.doctor && <span className="error-text">{errors.doctor.message}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Appointment date</label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className={`input-field ${errors.appointmentDate ? "error" : ""}`}
              {...register("appointmentDate", { required: "Please select a date" })}
            />
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
            <textarea
              rows={3}
              placeholder="Briefly describe your symptoms or reason for the visit"
              className={`input-field ${errors.reasonForVisit ? "error" : ""}`}
              {...register("reasonForVisit", {
                required: "Please provide a reason for your visit",
                minLength: { value: 3, message: "Please provide a bit more detail" },
              })}
            />
            {errors.reasonForVisit && <span className="error-text">{errors.reasonForVisit.message}</span>}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting || !patientProfileId}>
              {submitting ? "Booking..." : "Confirm booking"}
            </button>
          </div>
          {!patientProfileId && (
            <p style={{ fontSize: "12.5px", color: "var(--color-coral)", marginTop: "8px" }}>
              Loading your patient profile... please wait a moment before booking.
            </p>
          )}
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default PatientAppointments;
