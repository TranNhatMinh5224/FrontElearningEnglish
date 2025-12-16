import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const teacherPackageService = {
    getAll: () => axiosClient.get(API_ENDPOINTS.TEACHER_PACKAGES.GET_ALL),

    getById: (id) => axiosClient.get(API_ENDPOINTS.TEACHER_PACKAGES.GET_BY_ID(id)),
};
