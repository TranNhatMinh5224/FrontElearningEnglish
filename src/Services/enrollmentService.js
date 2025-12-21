import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const enrollmentService = {
    enroll: (data) => axiosClient.post(API_ENDPOINTS.ENROLLMENTS.ENROLL, data),

    getMyCourses: () => axiosClient.get(API_ENDPOINTS.ENROLLMENTS.MY_COURSES),

    joinByClassCode: (data) => axiosClient.post(API_ENDPOINTS.ENROLLMENTS.JOIN_BY_CLASS_CODE, data),
};
