/**
 * Route Paths Configuration
 * Tất cả các route paths được định nghĩa tại đây để dễ quản lý và tái sử dụng
 */

export const ROUTE_PATHS = {
  // Public routes
  ROOT: "/",
  WELCOME: "/welcome",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_OTP: "/reset-otp",
  RESET_PASSWORD: "/reset-password",
  OTP: "/otp",
  
  // Auth callback routes
  GOOGLE_CALLBACK: "/auth/google/callback",
  FACEBOOK_CALLBACK: "/auth/facebook/callback",
  
  // Protected routes
  HOME: "/home",
  MY_COURSES: "/my-courses",
  PROFILE: "/profile",
  PROFILE_EDIT: "/profile/edit",
  PROFILE_CHANGE_PASSWORD: "/profile/change-password",
  PAYMENT: "/payment",
  VOCABULARY_REVIEW: "/vocabulary-review",
  VOCABULARY_NOTEBOOK: "/vocabulary-notebook",
  
  // Course routes
  COURSE_DETAIL: (courseId) => `/course/${courseId}`,
  COURSE_LEARN: (courseId) => `/course/${courseId}/learn`,
  LESSON_DETAIL: (courseId, lessonId) => `/course/${courseId}/lesson/${lessonId}`,
  
  // Module routes
  LECTURE_DETAIL: (courseId, lessonId, moduleId, lectureId) => 
    `/course/${courseId}/lesson/${lessonId}/module/${moduleId}/lecture/${lectureId}`,
  MODULE_DETAIL: (courseId, lessonId, moduleId) => 
    `/course/${courseId}/lesson/${lessonId}/module/${moduleId}`,
  FLASHCARD_DETAIL: (courseId, lessonId, moduleId) => 
    `/course/${courseId}/lesson/${lessonId}/module/${moduleId}/flashcards`,
  PRONUNCIATION_DETAIL: (courseId, lessonId, moduleId) => 
    `/course/${courseId}/lesson/${lessonId}/module/${moduleId}/pronunciation`,
  ASSIGNMENT_DETAIL: (courseId, lessonId, moduleId) => 
    `/course/${courseId}/lesson/${lessonId}/module/${moduleId}/assignment`,
  
  // Quiz routes
  QUIZ_DETAIL: (courseId, lessonId, moduleId, quizId, attemptId) => 
    `/course/${courseId}/lesson/${lessonId}/module/${moduleId}/quiz/${quizId}/attempt/${attemptId}`,
  QUIZ_RESULTS: (courseId, lessonId, moduleId, quizId, attemptId) => 
    `/course/${courseId}/lesson/${lessonId}/module/${moduleId}/quiz/${quizId}/attempt/${attemptId}/results`,
  
  // Essay routes
  ESSAY_DETAIL: (courseId, lessonId, moduleId, essayId) => 
    `/course/${courseId}/lesson/${lessonId}/module/${moduleId}/essay/${essayId}`,
};

