import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const teacherService = {
    // Get teacher's courses with pagination
    getMyCourses: (params) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_MY_COURSES, { params }),
    
    // Get teacher's course detail
    getCourseDetail: (courseId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_COURSE_DETAIL(courseId)),
    
    // Create new course
    createCourse: (data) => axiosClient.post(API_ENDPOINTS.TEACHER.CREATE_COURSE, data),
    
    // Update course
    updateCourse: (courseId, data) => axiosClient.put(API_ENDPOINTS.TEACHER.UPDATE_COURSE(courseId), data),
    
    // Get students in a course
    getCourseStudents: (courseId, params) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_COURSE_STUDENTS(courseId), { params }),
    
    // Get student detail in course
    getStudentDetail: (courseId, studentId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_STUDENT_DETAIL(courseId, studentId)),
    
    // Add student to course by email
    addStudentToCourse: (courseId, email) => axiosClient.post(API_ENDPOINTS.TEACHER.ADD_STUDENT(courseId), { email }),
    
    // Remove student from course
    removeStudentFromCourse: (courseId, studentId) => axiosClient.delete(API_ENDPOINTS.TEACHER.REMOVE_STUDENT(courseId, studentId)),
};

