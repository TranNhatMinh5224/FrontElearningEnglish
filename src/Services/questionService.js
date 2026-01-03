import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const questionService = {
    // Get question by ID
    getQuestionById: (questionId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_QUESTION_BY_ID(questionId)),
    
    // Get questions by quiz group
    getQuestionsByGroup: (groupId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_QUESTIONS_BY_GROUP(groupId)),
    
    // Get questions by quiz section
    getQuestionsBySection: (sectionId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_QUESTIONS_BY_SECTION(sectionId)),
    
    // Create question
    createQuestion: (data) => axiosClient.post(API_ENDPOINTS.TEACHER.CREATE_QUESTION, data),
    
    // Update question
    updateQuestion: (questionId, data) => axiosClient.put(API_ENDPOINTS.TEACHER.UPDATE_QUESTION(questionId), data),
    
    // Delete question
    deleteQuestion: (questionId) => axiosClient.delete(API_ENDPOINTS.TEACHER.DELETE_QUESTION(questionId)),
    
    // Bulk create questions
    bulkCreateQuestions: (data) => axiosClient.post(API_ENDPOINTS.TEACHER.BULK_CREATE_QUESTIONS, data),
    
    // Admin Question endpoints
    createAdminQuestion: (data) => axiosClient.post(API_ENDPOINTS.ADMIN.QUESTIONS.CREATE, data),
    bulkCreateAdminQuestions: (data) => axiosClient.post(API_ENDPOINTS.ADMIN.QUESTIONS.BULK_CREATE, data),
    getAdminQuestionById: (questionId) => axiosClient.get(API_ENDPOINTS.ADMIN.QUESTIONS.GET_BY_ID(questionId)),
    getAdminQuestionsByGroup: (groupId) => axiosClient.get(API_ENDPOINTS.ADMIN.QUESTIONS.GET_BY_GROUP(groupId)),
    getAdminQuestionsBySection: (sectionId) => axiosClient.get(API_ENDPOINTS.ADMIN.QUESTIONS.GET_BY_SECTION(sectionId)),
    updateAdminQuestion: (questionId, data) => axiosClient.put(API_ENDPOINTS.ADMIN.QUESTIONS.UPDATE(questionId), data),
    deleteAdminQuestion: (questionId) => axiosClient.delete(API_ENDPOINTS.ADMIN.QUESTIONS.DELETE(questionId)),
};

