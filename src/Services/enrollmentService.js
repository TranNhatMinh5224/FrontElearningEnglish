import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const enrollmentService = {
    enroll: (data) => axiosClient.post(API_ENDPOINTS.ENROLLMENTS.ENROLL, data),

    /**
     * Lấy danh sách khóa học đã đăng ký với phân trang
     * @param {number} pageNumber - Số trang (mặc định 1)
     * @param {number} pageSize - Số lượng bản ghi mỗi trang (mặc định 25 cho grid 5x5)
     */
    getMyCourses: (pageNumber = 1, pageSize = 25) => 
        axiosClient.get(API_ENDPOINTS.ENROLLMENTS.MY_COURSES, {
            params: { pageNumber, pageSize }
        }),

    joinByClassCode: (data) => axiosClient.post(API_ENDPOINTS.ENROLLMENTS.JOIN_BY_CLASS_CODE, data),
};
