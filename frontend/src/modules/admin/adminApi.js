// src/modules/admin/adminApi.js
import axios from "axios";
import { getToken } from "../auth/authApi.js";

const api = axios.create({
  baseURL: "/api/admin",
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const adminApi = {
  // Users
  getUsers: () => api.get("/users"),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  resetPassword: (id) => api.post(`/users/${id}/reset-password`),

  // Roles
  getRoles: () => api.get("/roles"),
  updateRole: (id, data) => api.put(`/roles/${id}`, data),

  // Backup
  triggerBackup: () => api.post("/backup"),
  restoreBackup: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/backup/restore", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Export
  exportData: (type, filters) =>
    api.post(`/export/${type}`, filters, { responseType: "blob" }),

  // Logs
  getLogs: (params) => api.get("/logs", { params }),
};
