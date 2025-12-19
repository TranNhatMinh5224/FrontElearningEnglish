import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const courseService = {
    getSystemCourses: () => axiosClient.get(API_ENDPOINTS.COURSES.GET_SYSTEM_COURSES),
    
    getCourseById: (courseId) => axiosClient.get(API_ENDPOINTS.COURSES.GET_BY_ID(courseId)),
    
    searchCourses: (keyword) => axiosClient.get(API_ENDPOINTS.COURSES.SEARCH, { params: { keyword } }),
};

