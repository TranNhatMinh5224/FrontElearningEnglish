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
            // Student management in course
            GET_COURSE_STUDENTS: (courseId) => `/admin/courses/${courseId}/students`,
            GET_STUDENT_DETAIL: (courseId, studentId) => `/admin/courses/${courseId}/students/${studentId}`,
            ADD_STUDENT: (courseId) => `/admin/courses/${courseId}/students`,
            REMOVE_STUDENT: (courseId, studentId) => `/admin/courses/${courseId}/students/${studentId}`,
        },
        USERS: {
            GET_ALL: "/admin/users",
            GET_TEACHERS: "/admin/users/teachers",
            GET_BLOCKED: "/admin/users/blocked",
            USER_STATS: "/admin/statistics/users", // Thêm endpoint thống kê user
            BLOCK: (id) => `/admin/users/block/${id}`,
            UNBLOCK: (id) => `/admin/users/unblock/${id}`,
            UPGRADE_TEACHER: "/admin/users/upgrade-to-teacher"
        },
        PACKAGES: {
            GET_ALL: "/admin/teacher-packages",
            GET_BY_ID: (id) => `/admin/teacher-packages/${id}`,
            CREATE: "/admin/teacher-packages",
            UPDATE: (id) => `/admin/teacher-packages/${id}`,
            DELETE: (id) => `/admin/teacher-packages/${id}`,
        },
        ASSESSMENTS: {
            CREATE: "/admin/assessments",
            GET_BY_MODULE: (moduleId) => `/admin/assessments/module/${moduleId}`,
            GET_BY_ID: (assessmentId) => `/admin/assessments/${assessmentId}`,
            UPDATE: (assessmentId) => `/admin/assessments/${assessmentId}`,
            DELETE: (assessmentId) => `/admin/assessments/${assessmentId}`,
        },
        LECTURES: {
            CREATE: "/admin/lectures",
            BULK_CREATE: "/admin/lectures/bulk",
            GET_BY_ID: (lectureId) => `/admin/lectures/${lectureId}`,
            GET_BY_MODULE: (moduleId) => `/admin/lectures/module/${moduleId}`,
            GET_TREE: (moduleId) => `/admin/lectures/module/${moduleId}/tree`,
            UPDATE: (lectureId) => `/admin/lectures/${lectureId}`,
            DELETE: (lectureId) => `/admin/lectures/${lectureId}`,
            REORDER: "/admin/lectures/reorder",
        },
        FLASHCARDS: {
            CREATE: "/admin/flashcards",
            BULK_CREATE: "/admin/flashcards/bulk",
            GET_BY_ID: (flashcardId) => `/admin/flashcards/${flashcardId}`,
            GET_BY_MODULE: (moduleId) => `/admin/flashcards/module/${moduleId}`,
            UPDATE: (flashcardId) => `/admin/flashcards/${flashcardId}`,
            DELETE: (flashcardId) => `/admin/flashcards/${flashcardId}`,
        },
        QUIZZES: {
            CREATE: "/admin/quizzes",
            GET_BY_ID: (quizId) => `/admin/quizzes/${quizId}`,
            GET_BY_ASSESSMENT: (assessmentId) => `/admin/quizzes/assessment/${assessmentId}`,
            UPDATE: (quizId) => `/admin/quizzes/${quizId}`,
            DELETE: (quizId) => `/admin/quizzes/${quizId}`,
        },
        QUIZ_SECTIONS: {
            CREATE: "/admin/quiz-sections",
            BULK_CREATE: "/admin/quiz-sections/bulk",
            GET_BY_ID: (sectionId) => `/admin/quiz-sections/${sectionId}`,
            GET_BY_QUIZ: (quizId) => `/admin/quiz-sections/by-quiz/${quizId}`,
            UPDATE: (sectionId) => `/admin/quiz-sections/${sectionId}`,
            DELETE: (sectionId) => `/admin/quiz-sections/${sectionId}`,
        },
        QUIZ_GROUPS: {
            CREATE: "/admin/quiz-groups",
            GET_BY_ID: (groupId) => `/admin/quiz-groups/${groupId}`,
            GET_BY_SECTION: (sectionId) => `/admin/quiz-groups/by-quiz-section/${sectionId}`,
            UPDATE: (groupId) => `/admin/quiz-groups/${groupId}`,
            DELETE: (groupId) => `/admin/quiz-groups/${groupId}`,
        },
        QUESTIONS: {
            CREATE: "/admin/questions",
            BULK_CREATE: "/admin/questions/bulk",
            GET_BY_ID: (questionId) => `/admin/questions/${questionId}`,
            GET_BY_GROUP: (groupId) => `/admin/questions/quiz-group/${groupId}`,
            GET_BY_SECTION: (sectionId) => `/admin/questions/quiz-section/${sectionId}`,
            UPDATE: (questionId) => `/admin/questions/${questionId}`,
            DELETE: (questionId) => `/admin/questions/${questionId}`,
        },
        ESSAYS: {
            CREATE: "/admin/essays",
            GET_BY_ID: (essayId) => `/admin/essays/${essayId}`,
            GET_BY_ASSESSMENT: (assessmentId) => `/admin/essays/assessment/${assessmentId}`,
            UPDATE: (essayId) => `/admin/essays/${essayId}`,
            DELETE: (essayId) => `/admin/essays/${essayId}`,
        },
        ESSAY_SUBMISSIONS: {
            GET_BY_ESSAY: (essayId) => `/admin/essay-submissions/essay/${essayId}`,
            GET_BY_ID: (submissionId) => `/admin/essay-submissions/${submissionId}`,
            DOWNLOAD: (submissionId) => `/admin/essay-submissions/${submissionId}/download`,
            DELETE: (submissionId) => `/admin/essay-submissions/${submissionId}`,
            GRADE_AI: (submissionId) => `/admin/essay-submissions/${submissionId}/grade-ai`,
            GRADE: (submissionId) => `/admin/essay-submissions/${submissionId}/grade`,
        },
        QUIZ_ATTEMPTS: {
            GET_BY_QUIZ_PAGED: (quizId) => `/admin/quiz-attempts/quiz/${quizId}/paged`,
            GET_BY_QUIZ: (quizId) => `/admin/quiz-attempts/quiz/${quizId}`,
            GET_REVIEW: (attemptId) => `/admin/quiz-attempts/${attemptId}/review`,
            FORCE_SUBMIT: (attemptId) => `/admin/quiz-attempts/force-submit/${attemptId}`,
            GET_STATS: (quizId) => `/admin/quiz-attempts/stats/${quizId}`,
            GET_SCORES_PAGED: (quizId) => `/admin/quiz-attempts/scores/${quizId}/paged`,
            GET_SCORES: (quizId) => `/admin/quiz-attempts/scores/${quizId}`,
            GET_USER_ATTEMPTS: (userId, quizId) => `/admin/quiz-attempts/user/${userId}/quiz/${quizId}`,
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
        GET_BY_ASSESSMENT: (assessmentId) => `/user/quizzes/assessment/${assessmentId}`,
    },
    // Quiz Attempts
    QUIZ_ATTEMPTS: {
        START: (quizId) => `/user/quiz-attempts/start/${quizId}`,
        CHECK_ACTIVE: (quizId) => `/user/quiz-attempts/check-active/${quizId}`,
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
        REQUEST_AI_GRADING: (submissionId) => `/user/essay-submissions/${submissionId}/request-ai-grading`,
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
        DELETE_LESSON: (lessonId) => `/teacher/lessons/${lessonId}`,
        // Module endpoints
        CREATE_MODULE: "/teacher/modules",
        GET_MODULES_BY_LESSON: (lessonId) => `/teacher/modules/lesson/${lessonId}`,
        GET_MODULE_BY_ID: (moduleId) => `/teacher/modules/${moduleId}`,
        UPDATE_MODULE: (moduleId) => `/teacher/modules/${moduleId}`,
        DELETE_MODULE: (moduleId) => `/teacher/modules/${moduleId}`,
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
        // Quiz Section endpoints
        CREATE_QUIZ_SECTION: "/teacher/quiz-sections",
        GET_QUIZ_SECTION_BY_ID: (sectionId) => `/teacher/quiz-sections/${sectionId}`,
        GET_QUIZ_SECTIONS_BY_QUIZ: (quizId) => `/teacher/quiz-sections/by-quiz/${quizId}`,
        UPDATE_QUIZ_SECTION: (sectionId) => `/teacher/quiz-sections/${sectionId}`,
        DELETE_QUIZ_SECTION: (sectionId) => `/teacher/quiz-sections/${sectionId}`,
        // Quiz Group endpoints
        CREATE_QUIZ_GROUP: "/teacher/quiz-groups",
        GET_QUIZ_GROUP_BY_ID: (groupId) => `/teacher/quiz-groups/${groupId}`,
        GET_QUIZ_GROUPS_BY_SECTION: (sectionId) => `/teacher/quiz-groups/by-quiz-section/${sectionId}`,
        UPDATE_QUIZ_GROUP: (groupId) => `/teacher/quiz-groups/${groupId}`,
        DELETE_QUIZ_GROUP: (groupId) => `/teacher/quiz-groups/${groupId}`,
        // Question endpoints
        GET_QUESTION_BY_ID: (questionId) => `/teacher/questions/${questionId}`,
        GET_QUESTIONS_BY_GROUP: (groupId) => `/teacher/questions/quiz-group/${groupId}`,
        GET_QUESTIONS_BY_SECTION: (sectionId) => `/teacher/questions/quiz-section/${sectionId}`,
        CREATE_QUESTION: "/teacher/questions",
        UPDATE_QUESTION: (questionId) => `/teacher/questions/${questionId}`,
        DELETE_QUESTION: (questionId) => `/teacher/questions/${questionId}`,
        BULK_CREATE_QUESTIONS: "/teacher/questions/bulk",
        // Essay endpoints
        CREATE_ESSAY: "/teacher/essays",
        GET_ESSAY_BY_ID: (essayId) => `/teacher/essays/${essayId}`,
        GET_ESSAYS_BY_ASSESSMENT: (assessmentId) => `/teacher/essays/assessment/${assessmentId}`,
        UPDATE_ESSAY: (essayId) => `/teacher/essays/${essayId}`,
        DELETE_ESSAY: (essayId) => `/teacher/essays/${essayId}`,
        // Essay Submission endpoints
        GET_ESSAY_SUBMISSIONS_BY_ESSAY: (essayId) => `/teacher/essay-submissions/essay/${essayId}`,
        GET_ESSAY_SUBMISSION_DETAIL: (submissionId) => `/teacher/essay-submissions/${submissionId}`,
        DOWNLOAD_ESSAY_SUBMISSION: (submissionId) => `/teacher/essay-submissions/${submissionId}/download`,
        GRADE_ESSAY_WITH_AI: (submissionId) => `/teacher/essay-submissions/${submissionId}/grade-ai`,
        GRADE_ESSAY_MANUALLY: (submissionId) => `/teacher/essay-submissions/${submissionId}/grade`,
        UPDATE_ESSAY_GRADE: (submissionId) => `/teacher/essay-submissions/${submissionId}/grade`,
        BATCH_GRADE_ESSAY_AI: (essayId) => `/teacher/essay-submissions/essay/${essayId}/batch-grade-ai`,
        GET_ESSAY_STATISTICS: (essayId) => `/teacher/essay-submissions/essay/${essayId}/statistics`,
        // Quiz Attempt endpoints
        GET_QUIZ_ATTEMPTS_PAGED: (quizId) => `/teacher/quiz-attempts/quiz/${quizId}/paged`,
        GET_QUIZ_ATTEMPTS: (quizId) => `/teacher/quiz-attempts/quiz/${quizId}`,
        GET_QUIZ_ATTEMPT_STATS: (quizId) => `/teacher/quiz-attempts/stats/${quizId}`,
        GET_QUIZ_SCORES_PAGED: (quizId) => `/teacher/quiz-attempts/scores/${quizId}/paged`,
        GET_QUIZ_SCORES: (quizId) => `/teacher/quiz-attempts/scores/${quizId}`,
        GET_USER_QUIZ_ATTEMPTS: (userId, quizId) => `/teacher/quiz-attempts/user/${userId}/quiz/${quizId}`,
        GET_QUIZ_ATTEMPT_DETAIL: (attemptId) => `/teacher/quiz-attempts/${attemptId}/review`,
        FORCE_SUBMIT_QUIZ_ATTEMPT: (attemptId) => `/teacher/quiz-attempts/force-submit/${attemptId}`,
    },
    // Public Dictionary endpoints
    PUBLIC: {
        DICTIONARY: {
            GENERATE_FLASHCARD: "/public/dictionary/generate-flashcard",
            LOOKUP: (word, targetLanguage = "vi") => `/public/dictionary/lookup/${word}?targetLanguage=${targetLanguage}`,
        },
    },
};

export { API_BASE_URL, AUTH_REFRESH_URL };

