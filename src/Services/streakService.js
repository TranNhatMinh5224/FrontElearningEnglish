import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const streakService = {
    getMyStreak: () => axiosClient.get(API_ENDPOINTS.STREAKS.GET_MY_STREAK),
};

