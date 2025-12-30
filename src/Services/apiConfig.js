/**
 * API Configuration
 * Tất cả các endpoint API được định nghĩa tại đây
 */

import { API_BASE_URL, AUTH_REFRESH_URL } from "./BaseURL";


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
        GOOGLE_AUTH_URL: "/auth/google-auth-url",
        FACEBOOK_AUTH_URL: "/auth/facebook-auth-url",
        GOOGLE_LOGIN: "/auth/google-login",
        FACEBOOK_LOGIN: "/auth/facebook-login",
        VERIFY_EMAIL: "/auth/verify-email",
        FORGOT_PASSWORD: "/auth/forgot-password",
        VERIFY_OTP: "/auth/verify-otp",
        RESET_PASSWORD: "/auth/set-new-password",
        REFRESH_TOKEN: AUTH_REFRESH_URL, // Full URL vì có thể khác base URL
    },
    // ADMIN APIs
    ADMIN: {
        STATISTICS: {
            DASHBOARD_STATS: "/admin/statistics/overview",
            REVENUE_CHART: "/admin/statistics/revenue/chart",
        },
        COURSES: {
            GET_ALL: "/admin/courses", // GET with query params
            CREATE: "/admin/courses",
            UPDATE: (id) => `/admin/courses/${id}`,
            DELETE: (id) => `/admin/courses/${id}`,
        },
        USERS: {
            GET_ALL: "/admin/users", 
            GET_TEACHERS: "/admin/users/teachers",
            GET_BLOCKED: "/admin/users/blocked",
            USER_STATS: "/admin/statistics/users", // Thêm endpoint thống kê user
            BLOCK: (id) => `/admin/users/block/${id}`, 
            UNBLOCK: (id) => `/admin/users/unblock/${id}`,
            UPGRADE_TEACHER: "/admin/users/upgrade-to-teacher"
        }
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
        GET_ALL: "/user/teacher-packages",
        GET_BY_ID: (id) => `/user/teacher-packages/${id}`,
    },
    // Modules
    MODULES: {
        GET_BY_COURSE: (courseId) => `/user/modules/course/${courseId}`,
        GET_BY_LESSON: (lessonId) => `/user/modules/lesson/${lessonId}`,
        GET_BY_ID: (moduleId) => `/user/modules/${moduleId}`,
        START: (moduleId) => `/user/modules/${moduleId}/start`,
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
        GET_BY_ID: (quizId) => `/user/quizzes/quiz/${quizId}`, // Fixed: backend uses /quiz/{quizId}
        GET_BY_ASSESSMENT: (assessmentId) => `/user/quizzes/Quizz/${assessmentId}`,
    },
    // Quiz Attempts
    QUIZ_ATTEMPTS: {
        START: (quizId) => `/user/quiz-attempts/start/${quizId}`,
        SUBMIT_ANSWER: "/user/quiz-attempts/submit-answer",
        UPDATE_ANSWER: (attemptId) => `/user/quiz-attempts/update-answer/${attemptId}`,
        SUBMIT: (attemptId) => `/user/quiz-attempts/submit/${attemptId}`, // Backend: POST /api/user/quiz-attempts/submit/{attemptId}
        GET_BY_ID: (attemptId) => `/user/quiz-attempts/${attemptId}`,
        RESUME: (attemptId) => `/user/quiz-attempts/resume/${attemptId}`,
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
        GET_MASTERED: "/user/flashcard-review/mastered",
        GET_REVIEW_LIST: "/user/flashcard-review/review-list",
        UPDATE_REVIEW: "/user/flashcard-review/update-review",
        START_MODULE: (moduleId) => `/user/flashcard-review/start-module/${moduleId}`,
    },
    // Essays
    ESSAYS: {
        GET_BY_LESSON: (lessonId) => `/user/essays/lesson/${lessonId}`,
        GET_BY_ID: (essayId) => `/user/essays/${essayId}`,
        GET_BY_ASSESSMENT: (assessmentId) => `/user/essays/assessment/${assessmentId}`,
    },
    // Essay Submissions
    ESSAY_SUBMISSIONS: {
        SUBMIT: "/user/essay-submissions/submit",
        GET_BY_ESSAY: (essayId) => `/user/essay-submissions/essay/${essayId}`,
        GET_BY_ID: (submissionId) => `/user/essay-submissions/${submissionId}`,
        MY_SUBMISSIONS: "/user/essay-submissions/my-submissions",
        GET_SUBMISSION_STATUS: (essayId) => `/user/essay-submissions/submission-status/essay/${essayId}`,
        UPDATE: (submissionId) => `/user/essay-submissions/update/${submissionId}`,
        DELETE: (submissionId) => `/user/essay-submissions/delete/${submissionId}`,
    },
    // Pronunciation Assessments
    PRONUNCIATION_ASSESSMENTS: {
        ASSESS: "/user/pronunciation-assessments",
        GET_BY_MODULE: (moduleId) => `/user/pronunciation-assessments/module/${moduleId}`,
        GET_BY_MODULE_PAGINATED: (moduleId) => `/user/pronunciation-assessments/module/${moduleId}/paginated`,
        GET_ALL: "/user/pronunciation-assessments",
        GET_MODULE_SUMMARY: (moduleId) => `/user/pronunciation-assessments/module/${moduleId}/summary`,
    },
    // Assessments
    ASSESSMENTS: {
        GET_BY_LESSON: (lessonId) => `/user/assessments/lesson/${lessonId}`,
        GET_BY_MODULE: (moduleId) => `/user/assessments/module/${moduleId}`,
        GET_BY_ID: (assessmentId) => `/user/assessments/${assessmentId}`,
    },
    // Notifications
    NOTIFICATIONS: {
        GET_ALL: "/user/notifications",
        GET_UNREAD_COUNT: "/user/notifications/unread-count",
        MARK_READ: (notificationId) => `/user/notifications/${notificationId}/mark-as-read`,
        MARK_ALL_READ: "/user/notifications/mark-all-read",
    },
    // Streaks
    STREAKS: {
        GET_MY_STREAK: "/user/streaks",
        CHECKIN: "/user/streaks/checkin",
    },
    // Teacher endpoints
    TEACHER: {
        // Course endpoints
        GET_MY_COURSES: "/teacher/courses/my-courses",
        GET_COURSE_DETAIL: (courseId) => `/teacher/courses/${courseId}`,
        CREATE_COURSE: "/teacher/courses",
        UPDATE_COURSE: (courseId) => `/teacher/courses/${courseId}`,
        // Student management endpoints
        GET_COURSE_STUDENTS: (courseId) => `/teacher/courses/${courseId}/students`,
        GET_STUDENT_DETAIL: (courseId, studentId) => `/teacher/courses/${courseId}/students/${studentId}`,
        ADD_STUDENT: (courseId) => `/teacher/courses/${courseId}/students`,
        REMOVE_STUDENT: (courseId, studentId) => `/teacher/courses/${courseId}/students/${studentId}`,
        // Lesson endpoints
        CREATE_LESSON: "/teacher/lessons",
        GET_LESSONS_BY_COURSE: (courseId) => `/teacher/lessons/course/${courseId}`,
        GET_LESSON_BY_ID: (lessonId) => `/teacher/lessons/${lessonId}`,
        UPDATE_LESSON: (lessonId) => `/teacher/lessons/${lessonId}`,
        // Module endpoints
        CREATE_MODULE: "/teacher/modules",
        GET_MODULES_BY_LESSON: (lessonId) => `/teacher/modules/lesson/${lessonId}`,
        GET_MODULE_BY_ID: (moduleId) => `/teacher/modules/${moduleId}`,
        UPDATE_MODULE: (moduleId) => `/teacher/modules/${moduleId}`,
        // Lecture endpoints
        CREATE_LECTURE: "/teacher/lectures",
        BULK_CREATE_LECTURES: "/teacher/lectures/bulk",
        GET_LECTURE_BY_ID: (lectureId) => `/teacher/lectures/${lectureId}`,
        GET_LECTURES_BY_MODULE: (moduleId) => `/teacher/lectures/module/${moduleId}`,
        GET_LECTURE_TREE: (moduleId) => `/teacher/lectures/module/${moduleId}/tree`,
        UPDATE_LECTURE: (lectureId) => `/teacher/lectures/${lectureId}`,
        DELETE_LECTURE: (lectureId) => `/teacher/lectures/${lectureId}`,
        REORDER_LECTURES: "/teacher/lectures/reorder",
        // FlashCard endpoints
        CREATE_FLASHCARD: "/teacher/flashcards",
        BULK_CREATE_FLASHCARDS: "/teacher/flashcards/bulk",
        GET_FLASHCARD_BY_ID: (flashcardId) => `/teacher/flashcards/${flashcardId}`,
        GET_FLASHCARDS_BY_MODULE: (moduleId) => `/teacher/flashcards/module/${moduleId}`,
        UPDATE_FLASHCARD: (flashcardId) => `/teacher/flashcards/${flashcardId}`,
        DELETE_FLASHCARD: (flashcardId) => `/teacher/flashcards/${flashcardId}`,
        // Assessment endpoints
        CREATE_ASSESSMENT: "/teacher/assessments",
        GET_ASSESSMENT_BY_ID: (assessmentId) => `/teacher/assessments/${assessmentId}`,
        GET_ASSESSMENTS_BY_MODULE: (moduleId) => `/teacher/assessments/module/${moduleId}`,
        UPDATE_ASSESSMENT: (assessmentId) => `/teacher/assessments/${assessmentId}`,
        DELETE_ASSESSMENT: (assessmentId) => `/teacher/assessments/${assessmentId}`,
        // Quiz endpoints
        CREATE_QUIZ: "/teacher/quizzes",
        GET_QUIZ_BY_ID: (quizId) => `/teacher/quizzes/${quizId}`,
        GET_QUIZZES_BY_ASSESSMENT: (assessmentId) => `/teacher/quizzes/assessment/${assessmentId}`,
        UPDATE_QUIZ: (quizId) => `/teacher/quizzes/${quizId}`,
        DELETE_QUIZ: (quizId) => `/teacher/quizzes/${quizId}`,
        // Essay endpoints
        CREATE_ESSAY: "/teacher/essays",
        GET_ESSAY_BY_ID: (essayId) => `/teacher/essays/${essayId}`,
        GET_ESSAYS_BY_ASSESSMENT: (assessmentId) => `/teacher/essays/assessment/${assessmentId}`,
        UPDATE_ESSAY: (essayId) => `/teacher/essays/${essayId}`,
        DELETE_ESSAY: (essayId) => `/teacher/essays/${essayId}`,
    },
};

export { API_BASE_URL, AUTH_REFRESH_URL };

