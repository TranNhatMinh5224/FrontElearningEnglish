import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const quizAttemptService = {
    // Get quiz attempts with pagination
    getQuizAttemptsPaged: (quizId, page = 1, pageSize = 10) => {
        return axiosClient.get(API_ENDPOINTS.TEACHER.GET_QUIZ_ATTEMPTS_PAGED(quizId), {
            params: { page, pageSize }
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
            params: { page, pageSize }
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
};
