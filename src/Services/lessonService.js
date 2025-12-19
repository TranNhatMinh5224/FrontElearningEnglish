import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const lessonService = {
    getLessonsByCourseId: (courseId) => axiosClient.get(API_ENDPOINTS.LESSONS.GET_BY_COURSE(courseId)),
    
    getLessonById: (lessonId) => axiosClient.get(API_ENDPOINTS.LESSONS.GET_BY_ID(lessonId)),
    
    getLessonsByLecture: (lectureId) => axiosClient.get(API_ENDPOINTS.LESSONS.GET_BY_LECTURE(lectureId)),
};

