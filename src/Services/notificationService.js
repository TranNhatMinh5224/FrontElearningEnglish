import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

const notificationService = {
    /**
     * Lấy danh sách tất cả thông báo của user
     */
    getAll: async () => {
        return await axiosClient.get(API_ENDPOINTS.NOTIFICATIONS.GET_ALL);
    },

    /**
     * Lấy số lượng thông báo chưa đọc
     */
    getUnreadCount: async () => {
        return await axiosClient.get(API_ENDPOINTS.NOTIFICATIONS.GET_UNREAD_COUNT);
    },

    /**
     * Đánh dấu thông báo đã đọc
     * @param {number} notificationId - ID của thông báo
     */
    markAsRead: async (notificationId) => {
        return await axiosClient.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
    },

    /**
     * Đánh dấu tất cả thông báo đã đọc
     */
    markAllAsRead: async () => {
        return await axiosClient.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    },
};

export { notificationService };

