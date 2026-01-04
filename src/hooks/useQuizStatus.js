import { useEnums } from '../Context/EnumContext';

/**
 * Custom hook for quiz/essay status utilities
 * Provides dynamic status labels and styling from backend enums
 */
export const useQuizStatus = () => {
    const { quizStatuses, getEnumLabel } = useEnums();

    /**
     * Get quiz status label (name from backend)
     */
    const getQuizStatusName = (status) => {
        return getEnumLabel('QuizStatus', status);
    };

    /**
     * Get status label with styling
     * Maps status values to colors and backgrounds
     */
    const getStatusLabel = (status) => {
        const statusName = getQuizStatusName(status);
        
        // Default styling based on status value
        const styleMap = {
            0: { label: statusName, color: "#f59e0b", bg: "#fef3c7" }, // Draft
            1: { label: statusName, color: "#10b981", bg: "#d1fae5" }, // Published
            2: { label: statusName, color: "#6b7280", bg: "#f3f4f6" }, // Closed
            3: { label: statusName, color: "#6b7280", bg: "#f3f4f6" }, // Archived
        };
        
        return styleMap[status] || { label: statusName || 'Unknown', color: "#6b7280", bg: "#f3f4f6" };
    };

    /**
     * Check if status is Draft
     */
    const isDraft = (status) => {
        return status === 0;
    };

    /**
     * Check if status is Published
     */
    const isPublished = (status) => {
        return status === 1;
    };

    /**
     * Check if status is Closed
     */
    const isClosed = (status) => {
        return status === 2;
    };

    /**
     * Check if status is Archived
     */
    const isArchived = (status) => {
        return status === 3;
    };

    return {
        quizStatuses,
        getQuizStatusName,
        getStatusLabel,
        isDraft,
        isPublished,
        isClosed,
        isArchived,
    };
};
