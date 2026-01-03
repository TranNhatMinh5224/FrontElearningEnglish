import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const flashcardService = {
    // User endpoints
    getFlashcardsByModuleId: (moduleId) => axiosClient.get(API_ENDPOINTS.FLASHCARDS.GET_BY_MODULE(moduleId)),
    getFlashcardById: (flashcardId) => axiosClient.get(API_ENDPOINTS.FLASHCARDS.GET_BY_ID(flashcardId)),
    
    // Teacher endpoints
    createFlashcard: (data) => axiosClient.post(API_ENDPOINTS.TEACHER.CREATE_FLASHCARD, data),
    
    bulkCreateFlashcards: (data) => axiosClient.post(API_ENDPOINTS.TEACHER.BULK_CREATE_FLASHCARDS, data),
    
    getTeacherFlashcardById: (flashcardId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_FLASHCARD_BY_ID(flashcardId)),
    
    getTeacherFlashcardsByModule: (moduleId) => axiosClient.get(API_ENDPOINTS.TEACHER.GET_FLASHCARDS_BY_MODULE(moduleId)),
    
    updateFlashcard: (flashcardId, data) => axiosClient.put(API_ENDPOINTS.TEACHER.UPDATE_FLASHCARD(flashcardId), data),
    
    deleteFlashcard: (flashcardId) => axiosClient.delete(API_ENDPOINTS.TEACHER.DELETE_FLASHCARD(flashcardId)),

    // Admin endpoints
    createAdminFlashcard: (data) => axiosClient.post(API_ENDPOINTS.ADMIN.FLASHCARDS.CREATE, data),
    
    bulkCreateAdminFlashcards: (data) => axiosClient.post(API_ENDPOINTS.ADMIN.FLASHCARDS.BULK_CREATE, data),
    
    getAdminFlashcardById: (flashcardId) => axiosClient.get(API_ENDPOINTS.ADMIN.FLASHCARDS.GET_BY_ID(flashcardId)),
    
    getAdminFlashcardsByModule: (moduleId) => axiosClient.get(API_ENDPOINTS.ADMIN.FLASHCARDS.GET_BY_MODULE(moduleId)),
    
    updateAdminFlashcard: (flashcardId, data) => axiosClient.put(API_ENDPOINTS.ADMIN.FLASHCARDS.UPDATE(flashcardId), data),
    
    deleteAdminFlashcard: (flashcardId) => axiosClient.delete(API_ENDPOINTS.ADMIN.FLASHCARDS.DELETE(flashcardId)),
};

