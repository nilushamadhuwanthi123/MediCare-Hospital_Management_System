import { useEffect, useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import { doctorService } from "../../services/doctorService";

/**
 * Given a doctorId + date, fetches that doctor's real remaining slots for
 * the day (their working hours minus whatever's already booked) and lets
 * the user pick one. Replaces the old approach of showing a fixed list of
 * time slots regardless of who's actually free — this is what makes
 * double-booking basically impossible from the UI side, not just the API side.
 */
const DoctorSlotPicker = ({ doctorId, date, value, onChange, disabled }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dayLabel, setDayLabel] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!doctorId || !date) {
      setSlots([]);
      return;
    }

    setLoading(true);
    setError("");
    doctorService
      .getSlots(doctorId, date)
      .then((res) => {
        setSlots(res.data.data.slots || []);
        setDayLabel(res.data.data.day || "");
        if (!res.data.data.slots?.length) {
          setError(`This doctor has no availability on ${res.data.data.day || "that day"}. Try another date.`);
        }
      })
      .catch(() => setError("Could not load available time slots. Please try a different date."))
      .finally(() => setLoading(false));
  }, [doctorId, date]);

  if (!doctorId || !date) {
    return (
      <p style={{ fontSize: "13px", color: "var(--color-slate-600)" }}>
        Select a doctor and a date to see available time slots.
      </p>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px", color: "var(--color-slate-600)" }}>
        <Loader2 size={16} className="spin" /> Checking {dayLabel || "the doctor's"} availability...
      </div>
    );
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", fontSize: "12.5px", color: "var(--color-slate-600)" }}>
        <CalendarClock size={14} /> {slots.length} slot{slots.length === 1 ? "" : "s"} open on {dayLabel}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {slots.map((slot) => {
          const isSelected = value === slot;
          return (
            <button
              key={slot}
              type="button"
              disabled={disabled}
              onClick={() => onChange(slot)}
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 600,
                border: `1.5px solid ${isSelected ? "var(--color-teal-700)" : "var(--color-border)"}`,
                background: isSelected ? "var(--color-teal-700)" : "var(--color-white)",
                color: isSelected ? "var(--color-white)" : "var(--color-slate-900)",
                transition: "all 0.12s ease",
              }}
            >
              {slot}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DoctorSlotPicker;
