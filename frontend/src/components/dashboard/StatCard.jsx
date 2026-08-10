const StatCard = ({ icon: Icon, label, value, tint = "teal" }) => {
  const tintMap = {
    teal: { bg: "var(--color-teal-100)", color: "var(--color-teal-700)" },
    coral: { bg: "var(--color-coral-light)", color: "var(--color-coral)" },
    sage: { bg: "var(--color-sage-light)", color: "var(--color-sage)" },
    amber: { bg: "var(--color-amber-light)", color: "var(--color-amber)" },
  };
  const t = tintMap[tint] || tintMap.teal;

  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "12px",
          background: t.bg,
          color: t.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} />
      </div>
      <div>
        <div style={{ fontSize: "26px", fontWeight: 700, color: "var(--color-slate-900)", lineHeight: 1.1, fontFamily: "var(--font-display)" }}>
          {value}
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-slate-600)", marginTop: "2px" }}>{label}</div>
      </div>
    </div>
  );
};

export default StatCard;
