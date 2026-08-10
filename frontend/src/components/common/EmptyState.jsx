const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      padding: "var(--space-8) var(--space-5)",
      color: "var(--color-slate-600)",
    }}
  >
    {Icon && (
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--color-teal-100)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--space-4)",
          color: "var(--color-teal-700)",
        }}
      >
        <Icon size={26} />
      </div>
    )}
    <h4 style={{ fontSize: "16px", marginBottom: "6px", color: "var(--color-slate-900)" }}>{title}</h4>
    <p style={{ fontSize: "14px", maxWidth: 320, marginBottom: action ? "var(--space-4)" : 0 }}>{description}</p>
    {action}
  </div>
);

export default EmptyState;
