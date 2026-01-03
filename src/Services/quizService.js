import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const quizService = {
    // User endpoints
    getByLesson: (lessonId) => axiosClient.get(API_ENDPOINTS.QUIZZES.GET_BY_LESSON(lessonId)),
    
    getById: (quizId) => axiosClient.get(API_ENDPOINTS.QUIZZES.GET_BY_ID(quizId)),
    
    getByAssessment: (assessmentId) => axiosClient.get(API_ENDPOINTS.QUIZZES.GET_BY_ASSESSMENT(assessmentId)),
    
    // Teacher endpoints
    createQuiz: (data) => axiosClient.post(API_ENDPOINTS.TEACHER.CREATE_QUIZ, data),
    
    getTeacherQuizById: (quizId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_QUIZ_BY_ID(quizId)),
    
    getTeacherQuizzesByAssessment: (assessmentId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_QUIZZES_BY_ASSESSMENT(assessmentId)),
    
    updateQuiz: (quizId, data) => axiosClient.put(API_ENDPOINTS.TEACHER.UPDATE_QUIZ(quizId), data),
    
    deleteQuiz: (quizId) => axiosClient.delete(API_ENDPOINTS.TEACHER.DELETE_QUIZ(quizId)),
    
    // Quiz Section endpoints
    createQuizSection: (data) => axiosClient.post(API_ENDPOINTS.TEACHER.CREATE_QUIZ_SECTION, data),
    getQuizSectionById: (sectionId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_QUIZ_SECTION_BY_ID(sectionId)),
    getQuizSectionsByQuiz: (quizId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_QUIZ_SECTIONS_BY_QUIZ(quizId)),
    updateQuizSection: (sectionId, data) => axiosClient.put(API_ENDPOINTS.TEACHER.UPDATE_QUIZ_SECTION(sectionId), data),
    deleteQuizSection: (sectionId) => axiosClient.delete(API_ENDPOINTS.TEACHER.DELETE_QUIZ_SECTION(sectionId)),
    
    // Quiz Group endpoints
    createQuizGroup: (data) => axiosClient.post(API_ENDPOINTS.TEACHER.CREATE_QUIZ_GROUP, data),
    getQuizGroupById: (groupId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_QUIZ_GROUP_BY_ID(groupId)),
    getQuizGroupsBySection: (sectionId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_QUIZ_GROUPS_BY_SECTION(sectionId)),
    updateQuizGroup: (groupId, data) => axiosClient.put(API_ENDPOINTS.TEACHER.UPDATE_QUIZ_GROUP(groupId), data),
    deleteQuizGroup: (groupId) => axiosClient.delete(API_ENDPOINTS.TEACHER.DELETE_QUIZ_GROUP(groupId)),
    
    // Admin Quiz endpoints
    createAdminQuiz: (data) => axiosClient.post(API_ENDPOINTS.ADMIN.QUIZZES.CREATE, data),
    getAdminQuizById: (quizId) => axiosClient.get(API_ENDPOINTS.ADMIN.QUIZZES.GET_BY_ID(quizId)),
    getAdminQuizzesByAssessment: (assessmentId) => axiosClient.get(API_ENDPOINTS.ADMIN.QUIZZES.GET_BY_ASSESSMENT(assessmentId)),
    updateAdminQuiz: (quizId, data) => axiosClient.put(API_ENDPOINTS.ADMIN.QUIZZES.UPDATE(quizId), data),
    deleteAdminQuiz: (quizId) => axiosClient.delete(API_ENDPOINTS.ADMIN.QUIZZES.DELETE(quizId)),
    
    // Admin Quiz Section endpoints
    createAdminQuizSection: (data) => axiosClient.post(API_ENDPOINTS.ADMIN.QUIZ_SECTIONS.CREATE, data),
    bulkCreateAdminQuizSection: (data) => axiosClient.post(API_ENDPOINTS.ADMIN.QUIZ_SECTIONS.BULK_CREATE, data),
    getAdminQuizSectionById: (sectionId) => axiosClient.get(API_ENDPOINTS.ADMIN.QUIZ_SECTIONS.GET_BY_ID(sectionId)),
    getAdminQuizSectionsByQuiz: (quizId) => axiosClient.get(API_ENDPOINTS.ADMIN.QUIZ_SECTIONS.GET_BY_QUIZ(quizId)),
    updateAdminQuizSection: (sectionId, data) => axiosClient.put(API_ENDPOINTS.ADMIN.QUIZ_SECTIONS.UPDATE(sectionId), data),
    deleteAdminQuizSection: (sectionId) => axiosClient.delete(API_ENDPOINTS.ADMIN.QUIZ_SECTIONS.DELETE(sectionId)),
    
    // Admin Quiz Group endpoints
    createAdminQuizGroup: (data) => axiosClient.post(API_ENDPOINTS.ADMIN.QUIZ_GROUPS.CREATE, data),
    getAdminQuizGroupById: (groupId) => axiosClient.get(API_ENDPOINTS.ADMIN.QUIZ_GROUPS.GET_BY_ID(groupId)),
    getAdminQuizGroupsBySection: (sectionId) => axiosClient.get(API_ENDPOINTS.ADMIN.QUIZ_GROUPS.GET_BY_SECTION(sectionId)),
    updateAdminQuizGroup: (groupId, data) => axiosClient.put(API_ENDPOINTS.ADMIN.QUIZ_GROUPS.UPDATE(groupId), data),
    deleteAdminQuizGroup: (groupId) => axiosClient.delete(API_ENDPOINTS.ADMIN.QUIZ_GROUPS.DELETE(groupId)),
};

