import { useEnums } from '../Context/EnumContext';

/**
 * Custom hook for Submission Status utilities
 * Provides dynamic SUBMISSION_STATUS object and helper functions
 */
export const useSubmissionStatus = () => {
    const { submissionStatuses } = useEnums();

    // Tạo object SUBMISSION_STATUS động từ enum
    const SUBMISSION_STATUS = submissionStatuses.reduce((acc, status) => {
        acc[status.name.toUpperCase().replace(/\s+/g, '_')] = status.value;
        return acc;
    }, {});

    /**
     * Get submission status label from value
     * @param {number} value - Submission status value
     * @returns {string} Submission status label
     */
    const getSubmissionStatusLabel = (value) => {
        const status = submissionStatuses.find(s => s.value === value);
        return status ? status.name : 'Unknown';
    };

    /**
     * Check if submission is in progress
     * @param {number} value - Submission status value
     * @returns {boolean}
     */
    const isInProgress = (value) => {
        return value === SUBMISSION_STATUS.INPROGRESS;
    };

    /**
     * Check if submission is submitted
     * @param {number} value - Submission status value
     * @returns {boolean}
     */
    const isSubmitted = (value) => {
        return value === SUBMISSION_STATUS.SUBMITTED;
    };

    /**
     * Check if submission is under review
     * @param {number} value - Submission status value
     * @returns {boolean}
     */
    const isUnderReview = (value) => {
        return value === SUBMISSION_STATUS.UNDERREVIEW;
    };

    /**
     * Check if submission is graded
     * @param {number} value - Submission status value
     * @returns {boolean}
     */
    const isGraded = (value) => {
        return value === SUBMISSION_STATUS.GRADED;
    };

    /**
     * Check if submission is completed (submitted or beyond)
     * @param {number} value - Submission status value
     * @returns {boolean}
     */
    const isCompleted = (value) => {
        return value >= SUBMISSION_STATUS.SUBMITTED;
    };

    return {
        SUBMISSION_STATUS,
        submissionStatuses,
        getSubmissionStatusLabel,
        isInProgress,
        isSubmitted,
        isUnderReview,
        isGraded,
        isCompleted
    };
};
