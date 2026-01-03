import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const assessmentService = {
    // User endpoints
    getByLesson: (lessonId) => axiosClient.get(API_ENDPOINTS.ASSESSMENTS.GET_BY_LESSON(lessonId)),
    
    getByModule: (moduleId) => axiosClient.get(API_ENDPOINTS.ASSESSMENTS.GET_BY_MODULE(moduleId)),
    
    getById: (assessmentId) => axiosClient.get(API_ENDPOINTS.ASSESSMENTS.GET_BY_ID(assessmentId)),
    
    // Teacher endpoints
    createAssessment: (data) => axiosClient.post(API_ENDPOINTS.TEACHER.CREATE_ASSESSMENT, data),
    
    getTeacherAssessmentById: (assessmentId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_ASSESSMENT_BY_ID(assessmentId)),
    
    getTeacherAssessmentsByModule: (moduleId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_ASSESSMENTS_BY_MODULE(moduleId)),
    
    updateAssessment: (assessmentId, data) => axiosClient.put(API_ENDPOINTS.TEACHER.UPDATE_ASSESSMENT(assessmentId), data),
    
    deleteAssessment: (assessmentId) => axiosClient.delete(API_ENDPOINTS.TEACHER.DELETE_ASSESSMENT(assessmentId)),

    // Admin endpoints
    createAdminAssessment: (data) => axiosClient.post(API_ENDPOINTS.ADMIN.ASSESSMENTS.CREATE, data),
    
    getAdminAssessmentById: (assessmentId) => axiosClient.get(API_ENDPOINTS.ADMIN.ASSESSMENTS.GET_BY_ID(assessmentId)),
    
    getAdminAssessmentsByModule: (moduleId) => axiosClient.get(API_ENDPOINTS.ADMIN.ASSESSMENTS.GET_BY_MODULE(moduleId)),
    
    updateAdminAssessment: (assessmentId, data) => axiosClient.put(API_ENDPOINTS.ADMIN.ASSESSMENTS.UPDATE(assessmentId), data),
    
    deleteAdminAssessment: (assessmentId) => axiosClient.delete(API_ENDPOINTS.ADMIN.ASSESSMENTS.DELETE(assessmentId)),
};

