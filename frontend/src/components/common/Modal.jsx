import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, width = 480 }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 76, 76, 0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          width: "100%",
          maxWidth: width,
          maxHeight: "85vh",
          overflowY: "auto",
          padding: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <h3 style={{ fontSize: "18px" }}>{title}</h3>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: "6px", borderRadius: "8px", display: "flex" }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
