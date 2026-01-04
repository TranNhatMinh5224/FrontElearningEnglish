import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const teacherPackageService = {
    getAll: () => axiosClient.get(API_ENDPOINTS.TEACHER_PACKAGES.GET_ALL),

    getById: (id) => axiosClient.get(API_ENDPOINTS.TEACHER_PACKAGES.GET_BY_ID(id)),

    // Admin methods
    getAllAdmin: () => axiosClient.get(API_ENDPOINTS.ADMIN.PACKAGES.GET_ALL),
    getByIdAdmin: (id) => axiosClient.get(API_ENDPOINTS.ADMIN.PACKAGES.GET_BY_ID(id)),
    create: (data) => axiosClient.post(API_ENDPOINTS.ADMIN.PACKAGES.CREATE, data),
    update: (id, data) => axiosClient.put(API_ENDPOINTS.ADMIN.PACKAGES.UPDATE(id), data),
    delete: (id) => axiosClient.delete(API_ENDPOINTS.ADMIN.PACKAGES.DELETE(id)),
};
