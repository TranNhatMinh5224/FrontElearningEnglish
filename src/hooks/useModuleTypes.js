import { useEnums } from '../Context/EnumContext';

/**
 * Custom hook for Module Type utilities
 * Provides dynamic MODULE_TYPES object and helper functions
 * 
 * Fallback values match backend ModuleType enum:
 * - Lecture = 1
 * - FlashCard = 2
 * - Assessment = 3
 */
export const useModuleTypes = () => {
    const { moduleTypes } = useEnums();

    // Fallback values từ backend ModuleType enum (nếu enum chưa load)
    const FALLBACK_MODULE_TYPES = {
        LECTURE: 1,
        FLASHCARD: 2,
        ASSESSMENT: 3
    };

    // Tạo object MODULE_TYPES động từ enum, fallback về hardcoded values nếu empty
    const MODULE_TYPES = moduleTypes && moduleTypes.length > 0
        ? moduleTypes.reduce((acc, type) => {
            acc[type.name.toUpperCase()] = type.value;
            return acc;
        }, {})
        : FALLBACK_MODULE_TYPES;

    /**
     * Get module type label from value
     * @param {number} value - Module type value
     * @returns {string} Module type label
     */
    const getModuleTypeLabel = (value) => {
        const moduleType = moduleTypes.find(mt => mt.value === value);
        return moduleType ? moduleType.name : 'Unknown';
    };

    /**
     * Get module type name in lowercase (for URLs/paths)
     * @param {number} value - Module type value
     * @returns {string} Module type name in lowercase plural form
     */
    const getModuleTypePath = (value) => {
        const labels = {
            [MODULE_TYPES.LECTURE]: 'lectures',
            [MODULE_TYPES.FLASHCARD]: 'flashcards',
            [MODULE_TYPES.ASSESSMENT]: 'assessments'
        };
        return labels[value] || 'content';
    };

    /**
     * Check if module type is lecture
     * @param {number} value - Module type value
     * @returns {boolean}
     */
    const isLecture = (value) => {
        // Fallback: check directly against value 1 if MODULE_TYPES.LECTURE is undefined
        return value === (MODULE_TYPES.LECTURE ?? 1);
    };

    /**
     * Check if module type is flashcard
     * @param {number} value - Module type value
     * @returns {boolean}
     */
    const isFlashCard = (value) => {
        // Fallback: check directly against value 2 if MODULE_TYPES.FLASHCARD is undefined
        return value === (MODULE_TYPES.FLASHCARD ?? 2);
    };

    /**
     * Check if module type is assessment
     * @param {number} value - Module type value
     * @returns {boolean}
     */
    const isAssessment = (value) => {
        // Fallback: check directly against value 3 if MODULE_TYPES.ASSESSMENT is undefined
        return value === (MODULE_TYPES.ASSESSMENT ?? 3);
    };

    /**
     * Check if module type is clickable (has detail page)
     * @param {number} value - Module type value
     * @returns {boolean}
     */
    const isClickable = (value) => {
        // All module types are clickable (Lecture, FlashCard, Assessment)
        // Fallback to direct value check if MODULE_TYPES is empty
        const lectureValue = MODULE_TYPES.LECTURE ?? 1;
        const flashcardValue = MODULE_TYPES.FLASHCARD ?? 2;
        const assessmentValue = MODULE_TYPES.ASSESSMENT ?? 3;
        
        return value === lectureValue || 
               value === flashcardValue || 
               value === assessmentValue;
    };

    return {
        MODULE_TYPES,
        moduleTypes,
        getModuleTypeLabel,
        getModuleTypePath,
        isLecture,
        isFlashCard,
        isAssessment,
        isClickable
    };
};
