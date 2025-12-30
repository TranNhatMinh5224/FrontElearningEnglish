import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const adminService = {
  // --- STATISTICS ---
  getDashboardStats: () => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.STATISTICS.DASHBOARD_STATS);
  },
  getRevenueChart: (days = 30) => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.STATISTICS.REVENUE_CHART, { params: { days } });
  },

  // --- COURSE MANAGEMENT ---
  getAllCourses: (params) => {
    // params: { pageNumber, pageSize, searchTerm, status, type }
    return axiosClient.get(API_ENDPOINTS.ADMIN.COURSES.GET_ALL, { params });
  },
  createCourse: (data) => {
    return axiosClient.post(API_ENDPOINTS.ADMIN.COURSES.CREATE, data);
  },
  updateCourse: (id, data) => {
    return axiosClient.put(API_ENDPOINTS.ADMIN.COURSES.UPDATE(id), data);
  },
  deleteCourse: (id) => {
    return axiosClient.delete(API_ENDPOINTS.ADMIN.COURSES.DELETE(id));
  },

  // --- USER MANAGEMENT ---
  getAllUsers: (params) => {
    // params: { searchTerm, pageNumber, pageSize, sortBy, sortDescending }
    return axiosClient.get(API_ENDPOINTS.ADMIN.USERS.GET_ALL, { params });
  },
  getUserStats: () => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.USERS.USER_STATS);
  },
  getTeachers: (params) => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.USERS.GET_TEACHERS, { params });
  },
  getBlockedUsers: (params) => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.USERS.GET_BLOCKED, { params });
  },
  blockUser: (userId) => {
    return axiosClient.put(API_ENDPOINTS.ADMIN.USERS.BLOCK(userId));
  },
  unblockUser: (userId) => {
    return axiosClient.put(API_ENDPOINTS.ADMIN.USERS.UNBLOCK(userId));
  },
  upgradeUserToTeacher: (data) => {
      return axiosClient.post(API_ENDPOINTS.ADMIN.USERS.UPGRADE_TEACHER, data);
  }
};
