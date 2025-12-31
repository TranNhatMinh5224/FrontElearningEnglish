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
};

