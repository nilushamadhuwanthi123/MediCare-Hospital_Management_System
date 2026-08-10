import api from "./api";

export const patientService = {
  getAll: (params) => api.get("/patients", { params }),
  getById: (id) => api.get(`/patients/${id}`),
  update: (id, data) => api.put(`/patients/${id}`, data),
  addMedicalHistory: (id, data) => api.post(`/patients/${id}/medical-history`, data),
};
