import api from "./api";

export const billingService = {
  getAll: (params) => api.get("/billing", { params }),
  getById: (id) => api.get(`/billing/${id}`),
  create: (data) => api.post("/billing", data),
  updatePayment: (id, data) => api.put(`/billing/${id}/payment`, data),
};
