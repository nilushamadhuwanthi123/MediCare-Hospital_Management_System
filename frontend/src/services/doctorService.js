import api from "./api";

export const doctorService = {
  getAll: (params) => api.get("/doctors", { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getSlots: (id, date) => api.get(`/doctors/${id}/slots`, { params: { date } }),
  create: (data) => api.post("/doctors", data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  remove: (id) => api.delete(`/doctors/${id}`),
};
