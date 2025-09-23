import { apiFetch } from "../../utils/commonApi.js";

export const adminApi = {
  // Users
  getUsers: () => apiFetch("/users"),
  updateUser: (id, data) =>
    apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUser: (id) => apiFetch(`/users/${id}`, { method: "DELETE" }),
  resetPassword: (id) =>
    apiFetch(`/users/${id}/reset-password`, { method: "POST" }),

  // Roles
  getRoles: async () => {
    const res = await apiFetch("/roles");
    return res.roles || []; // handle backend object
  },
  updateRole: (id, data) =>
    apiFetch(`/roles/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // Logs
  getLogs: async (params) => {
    const res = await apiFetch(`/logs?${new URLSearchParams(params)}`);
    return res.logs || []; // handle backend object
  },

  // Backup
  triggerBackup: () => apiFetch("/backup", { method: "POST" }),
  restoreBackup: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch("/backup/restore", { method: "POST", body: formData });
  },

  // Export
  exportData: (type, filters) =>
    apiFetch(`/export/${type}`, {
      method: "POST",
      body: JSON.stringify(filters),
    }),
};
