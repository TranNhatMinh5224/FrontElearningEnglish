import { useEnums } from '../Context/EnumContext';

/**
 * Custom hook for question type utilities
 * Sử dụng enum từ backend thay vì hard-code
 */
export const useQuestionTypes = () => {
    const { questionTypes, getEnumLabel } = useEnums();

    // Tạo object QUESTION_TYPES động từ enum
    const QUESTION_TYPES = questionTypes.reduce((acc, type) => {
        // Use exact backend enum name (e.g., "MultipleChoice") to match component usage
        acc[type.name] = type.value;
        return acc;
    }, {});

    /**
     * Get question type label
     */
    const getQuestionTypeLabel = (type) => {
        return getEnumLabel('QuestionType', type);
    };

    /**
     * Check if question type requires multiple correct answers
     */
    const requiresMultipleAnswers = (type) => {
        const multipleAnswersType = questionTypes.find(t => t.name === 'MultipleAnswers');
        return type === multipleAnswersType?.value;
    };

    /**
     * Check if question type is matching
     */
    const isMatchingType = (type) => {
        const matchingType = questionTypes.find(t => t.name === 'Matching');
        return type === matchingType?.value;
    };

    /**
     * Check if question type is ordering
     */
    const isOrderingType = (type) => {
        const orderingType = questionTypes.find(t => t.name === 'Ordering');
        return type === orderingType?.value;
    };

    return {
        QUESTION_TYPES,
        questionTypes,
        getQuestionTypeLabel,
        requiresMultipleAnswers,
        isMatchingType,
        isOrderingType,
    };
};
