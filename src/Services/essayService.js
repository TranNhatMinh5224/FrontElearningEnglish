import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const essayService = {
    getByLesson: (lessonId) => axiosClient.get(API_ENDPOINTS.ESSAYS.GET_BY_LESSON(lessonId)),
    
    getById: (essayId) => axiosClient.get(API_ENDPOINTS.ESSAYS.GET_BY_ID(essayId)),
    
    getByAssessment: (assessmentId) => axiosClient.get(API_ENDPOINTS.ESSAYS.GET_BY_ASSESSMENT(assessmentId)),
};

