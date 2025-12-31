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
  PAYMENT_HISTORY: "/payment-history",
  PAYMENT_SUCCESS: "/payment-success",
  PAYMENT_FAILED: "/payment-failed",
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

  // Teacher routes
  TEACHER: "/teacher",
  TEACHER_ACCOUNT_MANAGEMENT: "/teacher/account-management",
  TEACHER_COURSE_MANAGEMENT: "/teacher/course-management",
  TEACHER_STUDENT_MANAGEMENT: (courseId) => `/teacher/course/${courseId}/students`,
  TEACHER_LESSON_DETAIL: (courseId, lessonId) => `/teacher/course/${courseId}/lesson/${lessonId}`,
  TEACHER_CREATE_LECTURE: (courseId, lessonId, moduleId) => `/teacher/course/${courseId}/lesson/${lessonId}/module/${moduleId}/create-lecture`,
  TEACHER_EDIT_LECTURE: (courseId, lessonId, moduleId, lectureId) => `/teacher/course/${courseId}/lesson/${lessonId}/module/${moduleId}/lecture/${lectureId}/edit`,
  TEACHER_CREATE_FLASHCARD: (courseId, lessonId, moduleId) => `/teacher/course/${courseId}/lesson/${lessonId}/module/${moduleId}/create-flashcard`,
  TEACHER_EDIT_FLASHCARD: (courseId, lessonId, moduleId, flashcardId) => `/teacher/course/${courseId}/lesson/${lessonId}/module/${moduleId}/edit-flashcard/${flashcardId}`,
  TEACHER_CREATE_ASSESSMENT: (courseId, lessonId, moduleId) => `/teacher/course/${courseId}/lesson/${lessonId}/module/${moduleId}/create-assessment`,
  TEACHER_EDIT_ASSESSMENT: (courseId, lessonId, moduleId, assessmentId) => `/teacher/course/${courseId}/lesson/${lessonId}/module/${moduleId}/edit-assessment/${assessmentId}`,
  TEACHER_ASSESSMENT_TYPE_SELECTION: (courseId, lessonId, moduleId, assessmentId) => `/teacher/course/${courseId}/lesson/${lessonId}/module/${moduleId}/assessment/${assessmentId}/select-type`,
  TEACHER_CREATE_ESSAY: (courseId, lessonId, moduleId, assessmentId) => `/teacher/course/${courseId}/lesson/${lessonId}/module/${moduleId}/assessment/${assessmentId}/create-essay`,
  TEACHER_CREATE_QUIZ: (courseId, lessonId, moduleId, assessmentId) => `/teacher/course/${courseId}/lesson/${lessonId}/module/${moduleId}/assessment/${assessmentId}/create-quiz`,
  TEACHER_EDIT_QUIZ: (courseId, lessonId, moduleId, assessmentId, quizId) => `/teacher/course/${courseId}/lesson/${lessonId}/module/${moduleId}/assessment/${assessmentId}/edit-quiz/${quizId}`,
};

