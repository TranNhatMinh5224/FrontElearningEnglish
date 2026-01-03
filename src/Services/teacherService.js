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
    
    // Create new lesson
    createLesson: (data) => axiosClient.post(API_ENDPOINTS.TEACHER.CREATE_LESSON, data),
    
    // Get lessons by course
    getLessonsByCourse: (courseId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_LESSONS_BY_COURSE(courseId)),
    
    // Get lesson by id
    getLessonById: (lessonId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_LESSON_BY_ID(lessonId)),
    
    // Update lesson
    updateLesson: (lessonId, data) => axiosClient.put(API_ENDPOINTS.TEACHER.UPDATE_LESSON(lessonId), data),
    
    // Delete lesson
    deleteLesson: (lessonId) => axiosClient.delete(API_ENDPOINTS.TEACHER.DELETE_LESSON(lessonId)),
    
    // Create new module
    createModule: (data) => axiosClient.post(API_ENDPOINTS.TEACHER.CREATE_MODULE, data),
    
    // Get modules by lesson
    getModulesByLesson: (lessonId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_MODULES_BY_LESSON(lessonId)),
    
    // Get module by id
    getModuleById: (moduleId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_MODULE_BY_ID(moduleId)),
    
    // Update module
    updateModule: (moduleId, data) => axiosClient.put(API_ENDPOINTS.TEACHER.UPDATE_MODULE(moduleId), data),
    
    // Delete module
    deleteModule: (moduleId) => axiosClient.delete(API_ENDPOINTS.TEACHER.DELETE_MODULE(moduleId)),
};

