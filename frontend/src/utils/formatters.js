export const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "Rs. 0.00";
  return `Rs. ${Number(amount).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
};

export const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

export const statusColorMap = {
  pending: "badge-warning",
  confirmed: "badge-neutral",
  completed: "badge-success",
  cancelled: "badge-danger",
  "no-show": "badge-danger",
  paid: "badge-success",
  unpaid: "badge-danger",
  partial: "badge-warning",
  refunded: "badge-neutral",
};
