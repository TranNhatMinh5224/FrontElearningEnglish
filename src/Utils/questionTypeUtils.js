/**
 * Question Type Constants and Utilities
 */

export const QUESTION_TYPES = {
    MULTIPLE_CHOICE: 0,
    MULTIPLE_ANSWERS: 1,
    TRUE_FALSE: 2,
    FILL_BLANK: 3,
    MATCHING: 4,
    ORDERING: 5,
};

export const QUESTION_TYPE_LABELS = {
    [QUESTION_TYPES.MULTIPLE_CHOICE]: "Multiple Choice",
    [QUESTION_TYPES.MULTIPLE_ANSWERS]: "Multiple Answers",
    [QUESTION_TYPES.TRUE_FALSE]: "True/False",
    [QUESTION_TYPES.FILL_BLANK]: "Fill in the Blank",
    [QUESTION_TYPES.MATCHING]: "Matching",
    [QUESTION_TYPES.ORDERING]: "Ordering",
};

export const QUESTION_TYPE_LABELS_VI = {
    [QUESTION_TYPES.MULTIPLE_CHOICE]: "Chọn một đáp án",
    [QUESTION_TYPES.MULTIPLE_ANSWERS]: "Chọn nhiều đáp án",
    [QUESTION_TYPES.TRUE_FALSE]: "Đúng/Sai",
    [QUESTION_TYPES.FILL_BLANK]: "Điền vào chỗ trống",
    [QUESTION_TYPES.MATCHING]: "Nối câu",
    [QUESTION_TYPES.ORDERING]: "Sắp xếp",
};

/**
 * Get question type label
 */
export const getQuestionTypeLabel = (type, locale = 'vi') => {
    if (locale === 'vi') {
        return QUESTION_TYPE_LABELS_VI[type] || QUESTION_TYPE_LABELS[type] || "Unknown";
    }
    return QUESTION_TYPE_LABELS[type] || "Unknown";
};

/**
 * Check if question type requires multiple correct answers
 */
export const requiresMultipleAnswers = (type) => {
    return type === QUESTION_TYPES.MULTIPLE_ANSWERS;
};

/**
 * Check if question type is matching
 */
export const isMatchingType = (type) => {
    return type === QUESTION_TYPES.MATCHING;
};

/**
 * Check if question type is ordering
 */
export const isOrderingType = (type) => {
    return type === QUESTION_TYPES.ORDERING;
};

