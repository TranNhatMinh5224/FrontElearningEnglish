import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const quizAttemptService = {
    // Student methods (from remote branch)
    start: (quizId) => axiosClient.post(API_ENDPOINTS.QUIZ_ATTEMPTS.START(quizId)),
    
    checkActiveAttempt: (quizId) => axiosClient.get(API_ENDPOINTS.QUIZ_ATTEMPTS.CHECK_ACTIVE(quizId)),
    
    submit: (attemptId) => axiosClient.post(API_ENDPOINTS.QUIZ_ATTEMPTS.SUBMIT(attemptId)),
    
    updateAnswer: (attemptId, data) => axiosClient.post(API_ENDPOINTS.QUIZ_ATTEMPTS.UPDATE_ANSWER(attemptId), data),
    
    resume: (attemptId) => axiosClient.get(API_ENDPOINTS.QUIZ_ATTEMPTS.RESUME(attemptId)),
    
    getById: (attemptId) => axiosClient.get(API_ENDPOINTS.QUIZ_ATTEMPTS.GET_BY_ID(attemptId)),
    
    myAttempts: () => axiosClient.get(API_ENDPOINTS.QUIZ_ATTEMPTS.MY_ATTEMPTS),

    // Teacher methods
    // Get quiz attempts with pagination
    getQuizAttemptsPaged: (quizId, page = 1, pageSize = 10) => {
        return axiosClient.get(API_ENDPOINTS.TEACHER.GET_QUIZ_ATTEMPTS_PAGED(quizId), {
            params: { 
                pageNumber: page,  // Backend uses PageNumber
                pageSize: pageSize  // Backend uses PageSize
            }
        });
    },

    // Get quiz attempts without pagination
    getQuizAttempts: (quizId) => {
        return axiosClient.get(API_ENDPOINTS.TEACHER.GET_QUIZ_ATTEMPTS(quizId));
    },

    // Get quiz attempt statistics
    getQuizAttemptStats: (quizId) => {
        return axiosClient.get(API_ENDPOINTS.TEACHER.GET_QUIZ_ATTEMPT_STATS(quizId));
    },

    // Get quiz scores with pagination
    getQuizScoresPaged: (quizId, page = 1, pageSize = 10) => {
        return axiosClient.get(API_ENDPOINTS.TEACHER.GET_QUIZ_SCORES_PAGED(quizId), {
            params: { 
                pageNumber: page,  // Backend uses PageNumber
                pageSize: pageSize  // Backend uses PageSize
            }
        });
    },

    // Get quiz scores without pagination
    getQuizScores: (quizId) => {
        return axiosClient.get(API_ENDPOINTS.TEACHER.GET_QUIZ_SCORES(quizId));
    },

    // Get user quiz attempts
    getUserQuizAttempts: (userId, quizId) => {
        return axiosClient.get(API_ENDPOINTS.TEACHER.GET_USER_QUIZ_ATTEMPTS(userId, quizId));
    },

    // Get attempt detail for review
    getAttemptDetailForReview: (attemptId) => {
        return axiosClient.get(API_ENDPOINTS.TEACHER.GET_QUIZ_ATTEMPT_DETAIL(attemptId));
    },

    // Force submit attempt
    forceSubmitAttempt: (attemptId) => {
        return axiosClient.post(API_ENDPOINTS.TEACHER.FORCE_SUBMIT_QUIZ_ATTEMPT(attemptId));
    },

    // Admin methods
    getAdminQuizAttemptsPaged: (quizId, page = 1, pageSize = 10) => {
        return axiosClient.get(API_ENDPOINTS.ADMIN.QUIZ_ATTEMPTS.GET_BY_QUIZ_PAGED(quizId), {
            params: { 
                pageNumber: page,
                pageSize: pageSize
            }
        });
    },

    getAdminQuizAttempts: (quizId) => {
        return axiosClient.get(API_ENDPOINTS.ADMIN.QUIZ_ATTEMPTS.GET_BY_QUIZ(quizId));
    },

    getAdminAttemptDetailForReview: (attemptId) => {
        return axiosClient.get(API_ENDPOINTS.ADMIN.QUIZ_ATTEMPTS.GET_REVIEW(attemptId));
    },

    forceSubmitAdminAttempt: (attemptId) => {
        return axiosClient.post(API_ENDPOINTS.ADMIN.QUIZ_ATTEMPTS.FORCE_SUBMIT(attemptId));
    },

    getAdminQuizScoresPaged: (quizId, page = 1, pageSize = 10) => {
        return axiosClient.get(API_ENDPOINTS.ADMIN.QUIZ_ATTEMPTS.GET_SCORES_PAGED(quizId), {
            params: { 
                pageNumber: page,
                pageSize: pageSize
            }
        });
    },
};
