import axiosClient from "./axiosClient";

export const superAdminService = {
  // Lấy danh sách admins với phân trang
  getAdmins: async (params = {}) => {
    return axiosClient.get("/superadmin/admins", { params });
  },

  // Tạo admin mới
  createAdmin: async (data) => {
    return axiosClient.post("/superadmin/admins", data);
  },

  // Lấy chi tiết admin
  getAdminById: async (userId) => {
    return axiosClient.get(`/superadmin/admins/${userId}`);
  },

  // Xóa admin (remove admin role)
  deleteAdmin: async (userId) => {
    return axiosClient.delete(`/superadmin/admins/${userId}`);
  },

  // Reset password admin
  resetAdminPassword: async (userId, data) => {
    return axiosClient.put(`/superadmin/admins/${userId}/reset-password`, data);
  },

  // Đổi email admin
  changeAdminEmail: async (userId, data) => {
    return axiosClient.put(`/superadmin/admins/${userId}/email`, data);
  },

  // Gán role cho user
  assignRole: async (userId, data) => {
    return axiosClient.post(`/superadmin/users/${userId}/roles`, data);
  },

  // Xóa role khỏi user
  removeRole: async (userId, data) => {
    return axiosClient.delete(`/superadmin/users/${userId}/roles`, { data });
  },

  // Lấy danh sách roles
  getAllRoles: async () => {
    return axiosClient.get("/superadmin/roles");
  },

  // Lấy danh sách permissions
  getAllPermissions: async () => {
    return axiosClient.get("/superadmin/permissions");
  },
};
