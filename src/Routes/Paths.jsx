/**
 * Route Paths Configuration
 * Tất cả các route paths được định nghĩa tại đây để dễ quản lý và tái sử dụng
 */

export const ROUTE_PATHS = {
  // Public routes
  ROOT: "/",
  WELCOME: "/welcome",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_OTP: "/reset-otp",
  RESET_PASSWORD: "/reset-password",
  OTP: "/otp",
  
  // Auth callback routes
  GOOGLE_CALLBACK: "/auth/google/callback",
  FACEBOOK_CALLBACK: "/auth/facebook/callback",
  
  // Protected routes
  HOME: "/home",
  MY_COURSES: "/my-courses",
  PROFILE: "/profile",
  PROFILE_EDIT: "/profile/edit",
  PROFILE_CHANGE_PASSWORD: "/profile/change-password",
  PAYMENT: "/payment",
  PAYMENT_HISTORY: "/payment-history",
  PAYMENT_SUCCESS: "/payment-success",
  PAYMENT_FAILED: "/payment-failed",
  VOCABULARY_REVIEW: "/vocabulary-review",
  VOCABULARY_NOTEBOOK: "/vocabulary-notebook",
  
  // Admin Routes
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    COURSES: "/admin/courses",
    USERS: "/admin/users",
    FINANCE: "/admin/finance"
  }
};

