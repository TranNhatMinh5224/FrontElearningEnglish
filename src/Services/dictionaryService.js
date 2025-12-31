import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const dictionaryService = {
    generateFlashcard: (word, translateToVietnamese = true) => {
        return axiosClient.post(API_ENDPOINTS.PUBLIC.DICTIONARY.GENERATE_FLASHCARD, {
            word: word.trim(),
            translateToVietnamese: translateToVietnamese,
        });
    },
    lookupWord: (word, targetLanguage = "vi") => {
        return axiosClient.get(API_ENDPOINTS.PUBLIC.DICTIONARY.LOOKUP(word, targetLanguage));
    },
};

