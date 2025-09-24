import { apiFetch } from "../../utils/commonApi.js";

export const adminApi = {
  // Users
  getUsers: () => apiFetch("/users"),
  createUser: (data) =>
    apiFetch("/users", { method: "POST", body: JSON.stringify(data) }), // <-- added
  updateUser: (id, data) =>
    apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUser: (id) => apiFetch(`/users/${id}`, { method: "DELETE" }),
  resetPassword: (id) =>
    apiFetch(`/users/${id}/reset-password`, { method: "POST" }),

  // Roles
  getRoles: async () => {
    const res = await apiFetch("/roles");
    return res || [];
  },
  updateRole: (id, data) =>
    apiFetch(`/roles/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // Logs
  getLogs: async (params) => {
    const res = await apiFetch(`/logs?${new URLSearchParams(params)}`);
    return res.logs || [];
  },

  // Backup (FIXED: point to /admin namespace)
  triggerBackup: () => apiFetch("/admin/backup", { method: "POST", raw: true }), // raw: true returns the fetch Response

  restoreBackup: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch("/admin/backup/restore", {
      method: "POST",
      body: formData,
    });
  },

  // Export paths FIXED
  exportData: (type, filters) =>
    apiFetch(`/admin/export/${type}`, {
      method: "POST",
      body: JSON.stringify(filters),
    }),
};
