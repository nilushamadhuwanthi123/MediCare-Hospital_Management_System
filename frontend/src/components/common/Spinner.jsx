const Spinner = ({ size = 24 }) => (
  <div
    style={{
      width: size,
      height: size,
      border: "3px solid var(--color-teal-100)",
      borderTopColor: "var(--color-teal-700)",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }}
  >
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default Spinner;
