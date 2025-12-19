/**
 * API Configuration
 * Tất cả các endpoint API được định nghĩa tại đây
 */

// Get API configuration from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const AUTH_REFRESH_URL = process.env.REACT_APP_AUTH_REFRESH_URL;


// Auth endpoints
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",
        LOGOUT: "/auth/logout",
        PROFILE: "/auth/profile",
        UPDATE_PROFILE: "/auth/update/profile",
        UPDATE_AVATAR: "/auth/profile/avatar",
        CHANGE_PASSWORD: "/auth/change-password",
        GOOGLE_LOGIN: "/auth/google-login",
        FACEBOOK_LOGIN: "/auth/facebook-login",
        VERIFY_EMAIL: "/auth/verify-email",
        FORGOT_PASSWORD: "/auth/forgot-password",
        VERIFY_OTP: "/auth/verify-otp",
        RESET_PASSWORD: "/auth/set-new-password",
        REFRESH_TOKEN: AUTH_REFRESH_URL, // Full URL vì có thể khác base URL
    },
    // Courses
    COURSES: {
        GET_SYSTEM_COURSES: "/user/courses/system-courses",
        GET_BY_ID: (courseId) => `/user/courses/${courseId}`,
        SEARCH: "/user/courses/search",
    },
    // Enrollments
    ENROLLMENTS: {
        ENROLL: "/user/enrollments/course",
        UNENROLL: (courseId) => `/user/enrollments/course/${courseId}`,
        MY_COURSES: "/user/enrollments/my-courses",
        JOIN_BY_CLASS_CODE: "/user/enrollments/join-by-class-code",
    },
    // Payments
    PAYMENTS: {
        PROCESS: "/user/payments/process",
        CONFIRM: "/user/payments/confirm",
        HISTORY: "/user/payments/history",
        HISTORY_ALL: "/user/payments/history/all",
        TRANSACTION_DETAIL: (paymentId) => `/user/payments/transaction/${paymentId}`,
        PAYOS_CREATE_LINK: (paymentId) => `/user/payments/payos/create-link/${paymentId}`,
        PAYOS_CONFIRM: (paymentId) => `/user/payments/payos/confirm/${paymentId}`,
    },
    // Teacher Packages
    TEACHER_PACKAGES: {
        GET_ALL: "/user/teacher-packages/teacher-packages",
        GET_BY_ID: (id) => `/user/teacher-packages/teacher-packages/${id}`,
    },
    // Modules
    MODULES: {
        GET_BY_COURSE: (courseId) => `/user/modules/course/${courseId}`,
        GET_BY_LESSON: (lessonId) => `/user/modules/lesson/${lessonId}`,
        GET_BY_ID: (moduleId) => `/user/modules/${moduleId}`,
    },
    // Lectures
    LECTURES: {
        GET_BY_MODULE: (moduleId) => `/user/lectures/module/${moduleId}`,
        GET_BY_ID: (lectureId) => `/user/lectures/${lectureId}`,
    },
    // Lessons
    LESSONS: {
        GET_BY_COURSE: (courseId) => `/user/lessons/course/${courseId}`,
        GET_BY_LECTURE: (lectureId) => `/user/lessons/lecture/${lectureId}`,
        GET_BY_ID: (lessonId) => `/user/lessons/${lessonId}`,
    },
    // Quizzes
    QUIZZES: {
        GET_BY_LESSON: (lessonId) => `/user/quizzes/lesson/${lessonId}`,
        GET_BY_ID: (quizId) => `/user/quizzes/${quizId}`,
    },
    // Quiz Attempts
    QUIZ_ATTEMPTS: {
        START: "/user/quiz-attempts/start",
        SUBMIT_ANSWER: "/user/quiz-attempts/submit-answer",
        SUBMIT: (attemptId) => `/user/quiz-attempts/${attemptId}/submit`,
        GET_BY_ID: (attemptId) => `/user/quiz-attempts/${attemptId}`,
        MY_ATTEMPTS: "/user/quiz-attempts/my-attempts",
    },
    // Flashcards
    FLASHCARDS: {
        GET_BY_LESSON: (lessonId) => `/user/flashcards/lesson/${lessonId}`,
        GET_BY_MODULE: (moduleId) => `/user/flashcards/module/${moduleId}`,
        GET_BY_ID: (flashcardId) => `/user/flashcards/${flashcardId}`,
    },
    // Flashcard Review
    FLASHCARD_REVIEW: {
        GET_DUE: "/user/flashcard-review/due",
        REVIEW: "/user/flashcard-review/review",
        STATISTICS: "/user/flashcard-review/statistics",
        GET_REVIEW_LIST: "/user/flashcard-review/review-list",
        UPDATE_REVIEW: "/user/flashcard-review/update-review",
        START_MODULE: (moduleId) => `/user/flashcard-review/start-module/${moduleId}`,
    },
    // Essays
    ESSAYS: {
        GET_BY_LESSON: (lessonId) => `/user/essays/lesson/${lessonId}`,
        GET_BY_ID: (essayId) => `/user/essays/${essayId}`,
    },
    // Essay Submissions
    ESSAY_SUBMISSIONS: {
        SUBMIT: "/user/essay-submissions/submit",
        GET_BY_ESSAY: (essayId) => `/user/essay-submissions/essay/${essayId}`,
        GET_BY_ID: (submissionId) => `/user/essay-submissions/${submissionId}`,
        MY_SUBMISSIONS: "/user/essay-submissions/my-submissions",
    },
    // Pronunciation Assessments
    PRONUNCIATION_ASSESSMENTS: {
        ASSESS: "/user/pronunciation-assessments/assess",
    },
    // Assessments
    ASSESSMENTS: {
        GET_BY_LESSON: (lessonId) => `/user/assessments/lesson/${lessonId}`,
        GET_BY_ID: (assessmentId) => `/user/assessments/${assessmentId}`,
    },
    // Notifications
    NOTIFICATIONS: {
        GET_ALL: "/user/notifications",
        MARK_READ: (notificationId) => `/user/notifications/${notificationId}/read`,
        MARK_ALL_READ: "/user/notifications/mark-all-read",
    },
    // Streaks
    STREAKS: {
        GET_MY_STREAK: "/user/streaks",
        CHECKIN: "/user/streaks/checkin",
    },
};

export { API_BASE_URL, AUTH_REFRESH_URL };

