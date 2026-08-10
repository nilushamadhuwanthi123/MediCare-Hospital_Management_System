import api from "./api";

// Triggers a browser download for a blob response (CSV/PDF exports)
const triggerDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const reportService = {
  getDashboardSummary: () => api.get("/reports/dashboard-summary"),
  getPatientSummary: () => api.get("/reports/patient-summary"),

  exportPatients: async () => {
    const res = await api.get("/reports/export/patients", { responseType: "blob" });
    triggerDownload(res.data, `patients-export-${Date.now()}.csv`);
  },
  exportBilling: async () => {
    const res = await api.get("/reports/export/billing", { responseType: "blob" });
    triggerDownload(res.data, `billing-export-${Date.now()}.csv`);
  },
  exportAppointments: async () => {
    const res = await api.get("/reports/export/appointments", { responseType: "blob" });
    triggerDownload(res.data, `appointments-export-${Date.now()}.csv`);
  },
};

export const downloadInvoicePdf = async (billId, invoiceNumber) => {
  const res = await api.get(`/billing/${billId}/pdf`, { responseType: "blob" });
  triggerDownload(res.data, `${invoiceNumber || "invoice"}.pdf`);
};
