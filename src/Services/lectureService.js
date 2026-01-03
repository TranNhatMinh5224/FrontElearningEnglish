import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const lectureService = {
    // User endpoints
    getLecturesByModuleId: (moduleId) => axiosClient.get(API_ENDPOINTS.LECTURES.GET_BY_MODULE(moduleId)),
    
    getLectureTreeByModuleId: (moduleId) => axiosClient.get(`${API_ENDPOINTS.LECTURES.GET_BY_MODULE(moduleId)}/tree`),
    
    getLectureById: (lectureId) => axiosClient.get(API_ENDPOINTS.LECTURES.GET_BY_ID(lectureId)),
    
    // Teacher endpoints
    createLecture: (data) => axiosClient.post(API_ENDPOINTS.TEACHER.CREATE_LECTURE, data),
    
    bulkCreateLectures: (data) => axiosClient.post(API_ENDPOINTS.TEACHER.BULK_CREATE_LECTURES, data),
    
    getTeacherLectureById: (lectureId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_LECTURE_BY_ID(lectureId)),
    
    getTeacherLecturesByModule: (moduleId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_LECTURES_BY_MODULE(moduleId)),
    
    getTeacherLectureTree: (moduleId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_LECTURE_TREE(moduleId)),
    
    updateLecture: (lectureId, data) => axiosClient.put(API_ENDPOINTS.TEACHER.UPDATE_LECTURE(lectureId), data),
    
    deleteLecture: (lectureId) => axiosClient.delete(API_ENDPOINTS.TEACHER.DELETE_LECTURE(lectureId)),
    
    reorderLectures: (data) => axiosClient.post(API_ENDPOINTS.TEACHER.REORDER_LECTURES, data),

    // Admin endpoints
    createAdminLecture: (data) => axiosClient.post(API_ENDPOINTS.ADMIN.LECTURES.CREATE, data),
    
    bulkCreateAdminLectures: (data) => axiosClient.post(API_ENDPOINTS.ADMIN.LECTURES.BULK_CREATE, data),
    
    getAdminLectureById: (lectureId) => axiosClient.get(API_ENDPOINTS.ADMIN.LECTURES.GET_BY_ID(lectureId)),
    
    getAdminLecturesByModule: (moduleId) => axiosClient.get(API_ENDPOINTS.ADMIN.LECTURES.GET_BY_MODULE(moduleId)),
    
    getAdminLectureTree: (moduleId) => axiosClient.get(API_ENDPOINTS.ADMIN.LECTURES.GET_TREE(moduleId)),
    
    updateAdminLecture: (lectureId, data) => axiosClient.put(API_ENDPOINTS.ADMIN.LECTURES.UPDATE(lectureId), data),
    
    deleteAdminLecture: (lectureId) => axiosClient.delete(API_ENDPOINTS.ADMIN.LECTURES.DELETE(lectureId)),
    
    reorderAdminLectures: (data) => axiosClient.post(API_ENDPOINTS.ADMIN.LECTURES.REORDER, data),
};

