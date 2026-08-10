import api from "./api";

export const pharmacyService = {
  getAll: (params) => api.get("/pharmacy", { params }),
  getById: (id) => api.get(`/pharmacy/${id}`),
  create: (data) => api.post("/pharmacy", data),
  update: (id, data) => api.put(`/pharmacy/${id}`, data),
  remove: (id) => api.delete(`/pharmacy/${id}`),
};
