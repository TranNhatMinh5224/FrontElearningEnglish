import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const quizAttemptService = {
    start: (quizId) => axiosClient.post(API_ENDPOINTS.QUIZ_ATTEMPTS.START(quizId)),
    
    checkActiveAttempt: (quizId) => axiosClient.get(API_ENDPOINTS.QUIZ_ATTEMPTS.CHECK_ACTIVE(quizId)),
    
    submit: (attemptId) => axiosClient.post(API_ENDPOINTS.QUIZ_ATTEMPTS.SUBMIT(attemptId)),
    
    updateAnswer: (attemptId, data) => axiosClient.post(API_ENDPOINTS.QUIZ_ATTEMPTS.UPDATE_ANSWER(attemptId), data),
    
    resume: (attemptId) => axiosClient.get(API_ENDPOINTS.QUIZ_ATTEMPTS.RESUME(attemptId)),
    
    getById: (attemptId) => axiosClient.get(API_ENDPOINTS.QUIZ_ATTEMPTS.GET_BY_ID(attemptId)),
    
    myAttempts: () => axiosClient.get(API_ENDPOINTS.QUIZ_ATTEMPTS.MY_ATTEMPTS),
};

