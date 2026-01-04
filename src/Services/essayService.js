import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const essayService = {
    // User endpoints
    getByLesson: (lessonId) => axiosClient.get(API_ENDPOINTS.ESSAYS.GET_BY_LESSON(lessonId)),
    
    getById: (essayId) => axiosClient.get(API_ENDPOINTS.ESSAYS.GET_BY_ID(essayId)),
    
    getByAssessment: (assessmentId) => axiosClient.get(API_ENDPOINTS.ESSAYS.GET_BY_ASSESSMENT(assessmentId)),
    
    // Teacher endpoints
    createEssay: (data) => axiosClient.post(API_ENDPOINTS.TEACHER.CREATE_ESSAY, data),
    
    getTeacherEssayById: (essayId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_ESSAY_BY_ID(essayId)),
    
    getTeacherEssaysByAssessment: (assessmentId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_ESSAYS_BY_ASSESSMENT(assessmentId)),
    
    updateEssay: (essayId, data) => axiosClient.put(API_ENDPOINTS.TEACHER.UPDATE_ESSAY(essayId), data),
    
    deleteEssay: (essayId) => axiosClient.delete(API_ENDPOINTS.TEACHER.DELETE_ESSAY(essayId)),
    
    // Admin Essay endpoints
    createAdminEssay: (data) => axiosClient.post(API_ENDPOINTS.ADMIN.ESSAYS.CREATE, data),
    getAdminEssayById: (essayId) => axiosClient.get(API_ENDPOINTS.ADMIN.ESSAYS.GET_BY_ID(essayId)),
    getAdminEssaysByAssessment: (assessmentId) => axiosClient.get(API_ENDPOINTS.ADMIN.ESSAYS.GET_BY_ASSESSMENT(assessmentId)),
    updateAdminEssay: (essayId, data) => axiosClient.put(API_ENDPOINTS.ADMIN.ESSAYS.UPDATE(essayId), data),
    deleteAdminEssay: (essayId) => axiosClient.delete(API_ENDPOINTS.ADMIN.ESSAYS.DELETE(essayId)),
};

