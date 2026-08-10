const PageHeader = ({ title, subtitle, action }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "var(--space-6)",
      gap: "16px",
      flexWrap: "wrap",
    }}
  >
    <div>
      <h1 style={{ fontSize: "26px", marginBottom: "4px" }}>{title}</h1>
      {subtitle && <p style={{ color: "var(--color-slate-600)", fontSize: "14.5px" }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default PageHeader;
