import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const adminService = {
  // --- STATISTICS ---
  getDashboardStats: () => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.STATISTICS.DASHBOARD_STATS);
  },
  getRevenueChart: (days = 30) => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.STATISTICS.REVENUE_CHART, { params: { days } });
  },

  // --- COURSE MANAGEMENT ---
  getAllCourses: (params) => {
    // params: { pageNumber, pageSize, searchTerm, status, type }
    return axiosClient.get(API_ENDPOINTS.ADMIN.COURSES.GET_ALL, { params });
  },
  createCourse: (data) => {
    return axiosClient.post(API_ENDPOINTS.ADMIN.COURSES.CREATE, data);
  },
  updateCourse: (id, data) => {
    return axiosClient.put(API_ENDPOINTS.ADMIN.COURSES.UPDATE(id), data);
  },
  deleteCourse: (id) => {
    return axiosClient.delete(API_ENDPOINTS.ADMIN.COURSES.DELETE(id));
  },
  getCourseContent: (courseId) => {
      // Sử dụng endpoint public để lấy cấu trúc bài học
      return axiosClient.get(`/user/courses/${courseId}`); 
  },

  // --- LESSON MANAGEMENT ---
  getLessonsByCourse: (courseId) => {
    return axiosClient.get(`/admin/lessons/course/${courseId}`);
  },
  createLesson: (data) => {
    return axiosClient.post('/admin/lessons', data);
  },
  getLessonDetail: (lessonId) => {
    return axiosClient.get(`/admin/lessons/${lessonId}`);
  },
  updateLesson: (lessonId, data) => {
    return axiosClient.put(`/admin/lessons/${lessonId}`, data);
  },
  deleteLesson: (lessonId) => {
    return axiosClient.delete(`/admin/lessons/${lessonId}`);
  },

  // --- MODULE MANAGEMENT ---
  getModulesByLesson: (lessonId) => {
    return axiosClient.get(`/admin/modules/lesson/${lessonId}`);
  },
  getModuleById: (moduleId) => {
    return axiosClient.get(`/admin/modules/${moduleId}`);
  },
  createModule: (data) => {
    return axiosClient.post('/admin/modules', data);
  },
  updateModule: (moduleId, data) => {
    return axiosClient.put(`/admin/modules/${moduleId}`, data);
  },
  deleteModule: (moduleId) => {
    return axiosClient.delete(`/admin/modules/${moduleId}`);
  },

  // --- STUDENT MANAGEMENT IN COURSE ---
  getCourseStudents: (courseId, params) => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.COURSES.GET_COURSE_STUDENTS(courseId), { params });
  },
  getStudentDetail: (courseId, studentId) => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.COURSES.GET_STUDENT_DETAIL(courseId, studentId));
  },
  addStudentToCourse: (courseId, email) => {
    return axiosClient.post(API_ENDPOINTS.ADMIN.COURSES.ADD_STUDENT(courseId), { email });
  },
  removeStudentFromCourse: (courseId, studentId) => {
    return axiosClient.delete(API_ENDPOINTS.ADMIN.COURSES.REMOVE_STUDENT(courseId, studentId));
  },

  // --- USER MANAGEMENT ---
  getAllUsers: (params) => {
    // params: { searchTerm, pageNumber, pageSize, sortBy, sortDescending }
    return axiosClient.get(API_ENDPOINTS.ADMIN.USERS.GET_ALL, { params });
  },
  getUserStats: () => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.USERS.USER_STATS);
  },
  getTeachers: (params) => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.USERS.GET_TEACHERS, { params });
  },
  getBlockedUsers: (params) => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.USERS.GET_BLOCKED, { params });
  },
  blockUser: (userId) => {
    return axiosClient.put(API_ENDPOINTS.ADMIN.USERS.BLOCK(userId));
  },
  unblockUser: (userId) => {
    return axiosClient.put(API_ENDPOINTS.ADMIN.USERS.UNBLOCK(userId));
  },
  upgradeUserToTeacher: (data) => {
      return axiosClient.post(API_ENDPOINTS.ADMIN.USERS.UPGRADE_TEACHER, data);
  },

  // --- ESSAY SUBMISSIONS ---
  getEssaySubmissionsByEssay: (essayId, params) => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.ESSAY_SUBMISSIONS.GET_BY_ESSAY(essayId), { params });
  },
  getEssaySubmissionDetail: (submissionId) => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.ESSAY_SUBMISSIONS.GET_BY_ID(submissionId));
  },
  downloadEssaySubmission: (submissionId) => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.ESSAY_SUBMISSIONS.DOWNLOAD(submissionId), { responseType: 'blob' });
  },
  deleteEssaySubmission: (submissionId) => {
    return axiosClient.delete(API_ENDPOINTS.ADMIN.ESSAY_SUBMISSIONS.DELETE(submissionId));
  },
  gradeEssayWithAI: (submissionId) => {
    return axiosClient.post(API_ENDPOINTS.ADMIN.ESSAY_SUBMISSIONS.GRADE_AI(submissionId));
  },
  gradeEssay: (submissionId, data) => {
    return axiosClient.post(API_ENDPOINTS.ADMIN.ESSAY_SUBMISSIONS.GRADE(submissionId), data);
  },

  // --- QUIZ ATTEMPTS ---
  getQuizAttemptsPaged: (quizId, params) => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.QUIZ_ATTEMPTS.GET_BY_QUIZ_PAGED(quizId), { params });
  },
  getQuizAttempts: (quizId) => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.QUIZ_ATTEMPTS.GET_BY_QUIZ(quizId));
  },
  getQuizAttemptReview: (attemptId) => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.QUIZ_ATTEMPTS.GET_REVIEW(attemptId));
  },
  forceSubmitQuizAttempt: (attemptId) => {
    return axiosClient.post(API_ENDPOINTS.ADMIN.QUIZ_ATTEMPTS.FORCE_SUBMIT(attemptId));
  },
  getQuizAttemptStats: (quizId) => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.QUIZ_ATTEMPTS.GET_STATS(quizId));
  },
  getQuizScoresPaged: (quizId, params) => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.QUIZ_ATTEMPTS.GET_SCORES_PAGED(quizId), { params });
  },
  getQuizScores: (quizId) => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.QUIZ_ATTEMPTS.GET_SCORES(quizId));
  },
  getUserQuizAttempts: (userId, quizId) => {
    return axiosClient.get(API_ENDPOINTS.ADMIN.QUIZ_ATTEMPTS.GET_USER_ATTEMPTS(userId, quizId));
  },
};
