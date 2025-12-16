import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const paymentService = {
    processPayment: (data) => axiosClient.post(API_ENDPOINTS.PAYMENTS.PROCESS, data),

    confirmPayment: (data) => axiosClient.post(API_ENDPOINTS.PAYMENTS.CONFIRM, data),

    getHistory: () => axiosClient.get(API_ENDPOINTS.PAYMENTS.HISTORY),

    getAllHistory: () => axiosClient.get(API_ENDPOINTS.PAYMENTS.HISTORY_ALL),

    getTransactionDetail: (paymentId) =>
        axiosClient.get(API_ENDPOINTS.PAYMENTS.TRANSACTION_DETAIL(paymentId)),

    createPayOsLink: (paymentId) =>
        axiosClient.post(API_ENDPOINTS.PAYMENTS.PAYOS_CREATE_LINK(paymentId)),

    confirmPayOs: (paymentId) =>
        axiosClient.post(API_ENDPOINTS.PAYMENTS.PAYOS_CONFIRM(paymentId)),
};
