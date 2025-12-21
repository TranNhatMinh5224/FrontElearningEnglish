import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

const flashcardReviewService = {
    /**
     * Lấy danh sách từ cần ôn hôm nay
     */
    getDueFlashCards: async () => {
        return await axiosClient.get(API_ENDPOINTS.FLASHCARD_REVIEW.GET_DUE);
    },

    /**
     * Ôn tập một flashcard
     * @param {number} flashCardId - ID của flashcard
     * @param {number} quality - Quality từ 0-5
     */
    reviewFlashCard: async (flashCardId, quality) => {
        return await axiosClient.post(API_ENDPOINTS.FLASHCARD_REVIEW.REVIEW, {
            flashCardId,
            quality,
        });
    },

    /**
     * Lấy thống kê review
     */
    getStatistics: async () => {
        return await axiosClient.get(API_ENDPOINTS.FLASHCARD_REVIEW.STATISTICS);
    },

    /**
     * Bắt đầu học module - thêm tất cả flashcard vào hệ thống ôn tập
     * @param {number} moduleId - ID của module
     */
    startModule: async (moduleId) => {
        return await axiosClient.post(API_ENDPOINTS.FLASHCARD_REVIEW.START_MODULE(moduleId));
    },

    /**
     * Lấy danh sách từ đã thuộc
     */
    getMasteredFlashCards: async () => {
        return await axiosClient.get(API_ENDPOINTS.FLASHCARD_REVIEW.GET_MASTERED);
    },
};

export { flashcardReviewService };

