import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./apiConfig";

export const authService = {
  login: (data) => axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, data),

  register: (data) => axiosClient.post(API_ENDPOINTS.AUTH.REGISTER, data),

  getProfile: () => axiosClient.get(API_ENDPOINTS.AUTH.PROFILE),

  logout: (refreshToken) =>
    axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken }),

  googleLogin: (data) =>
    axiosClient.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, data),

  facebookLogin: (data) =>
    axiosClient.post(API_ENDPOINTS.AUTH.FACEBOOK_LOGIN, data),

  verifyEmail: (data) =>
    axiosClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data),

  forgotPassword: (data) =>
    axiosClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data),

  verifyResetOtp: (data) =>
    axiosClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, data),

  resetPassword: (data) =>
    axiosClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data),

  updateProfile: (data) =>
    axiosClient.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data),

  updateAvatar: (data) =>
    axiosClient.put(API_ENDPOINTS.AUTH.UPDATE_AVATAR, data),

  changePassword: (data) =>
    axiosClient.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data),
};
