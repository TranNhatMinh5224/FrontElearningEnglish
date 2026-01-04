// Permission mappings based on backend AdminPermissionSeeder.cs
export const ADMIN_PERMISSIONS = {
  // Content Management (ContentAdmin có các quyền này)
  COURSE_MANAGE: "Admin.Course.Manage",           // PermissionId: 1
  LESSON_MANAGE: "Admin.Lesson.Manage",           // PermissionId: 2
  CONTENT_MANAGE: "Admin.Content.Manage",         // PermissionId: 3 (flashcards, quizzes, essays)
  
  // Finance Management (FinanceAdmin có các quyền này)
  USER_MANAGE: "Admin.User.Manage",               // PermissionId: 4
  PAYMENT_MANAGE: "Admin.Payment.Manage",         // PermissionId: 5
  REVENUE_VIEW: "Admin.Revenue.View",             // PermissionId: 6
  PACKAGE_MANAGE: "Admin.Package.Manage",         // PermissionId: 7
  COURSE_ENROLL: "Admin.Course.Enroll",           // PermissionId: 9 (thêm/xóa học viên)
  
  // System (SuperAdmin only)
  SYSTEM_FULL_ACCESS: "Admin.System.FullAccess"   // PermissionId: 8
};

// Role-based permission mapping (from AdminPermissionSeeder.GetDefaultRolePermissions)
export const ROLE_PERMISSIONS = {
  SuperAdmin: [
    ADMIN_PERMISSIONS.COURSE_MANAGE,
    ADMIN_PERMISSIONS.LESSON_MANAGE,
    ADMIN_PERMISSIONS.CONTENT_MANAGE,
    ADMIN_PERMISSIONS.USER_MANAGE,
    ADMIN_PERMISSIONS.PAYMENT_MANAGE,
    ADMIN_PERMISSIONS.REVENUE_VIEW,
    ADMIN_PERMISSIONS.PACKAGE_MANAGE,
    ADMIN_PERMISSIONS.SYSTEM_FULL_ACCESS,
    ADMIN_PERMISSIONS.COURSE_ENROLL
  ],
  ContentAdmin: [
    ADMIN_PERMISSIONS.COURSE_MANAGE,
    ADMIN_PERMISSIONS.LESSON_MANAGE,
    ADMIN_PERMISSIONS.CONTENT_MANAGE
  ],
  FinanceAdmin: [
    ADMIN_PERMISSIONS.COURSE_ENROLL,  // Thêm/xóa học viên (khi thanh toán lỗi)
    ADMIN_PERMISSIONS.USER_MANAGE,
    ADMIN_PERMISSIONS.PAYMENT_MANAGE,
    ADMIN_PERMISSIONS.REVENUE_VIEW,
    ADMIN_PERMISSIONS.PACKAGE_MANAGE
  ]
};

// Feature to permission mapping (map tính năng frontend với permission backend)
export const FEATURE_PERMISSIONS = {
  // Course Management
  "course_create": ADMIN_PERMISSIONS.COURSE_MANAGE,
  "course_edit": ADMIN_PERMISSIONS.COURSE_MANAGE,
  "course_delete": ADMIN_PERMISSIONS.COURSE_MANAGE,
  "course_publish": ADMIN_PERMISSIONS.COURSE_MANAGE,
  "course_enroll_student": ADMIN_PERMISSIONS.COURSE_ENROLL,
  
  // Lesson Management
  "lesson_create": ADMIN_PERMISSIONS.LESSON_MANAGE,
  "lesson_edit": ADMIN_PERMISSIONS.LESSON_MANAGE,
  "lesson_delete": ADMIN_PERMISSIONS.LESSON_MANAGE,
  
  // Module & Lecture
  "module_create": ADMIN_PERMISSIONS.LESSON_MANAGE,
  "module_edit": ADMIN_PERMISSIONS.LESSON_MANAGE,
  "module_delete": ADMIN_PERMISSIONS.LESSON_MANAGE,
  "lecture_create": ADMIN_PERMISSIONS.LESSON_MANAGE,
  "lecture_edit": ADMIN_PERMISSIONS.LESSON_MANAGE,
  "lecture_delete": ADMIN_PERMISSIONS.LESSON_MANAGE,
  
  // Content Management (Flashcards, Quizzes, Essays)
  "flashcard_manage": ADMIN_PERMISSIONS.CONTENT_MANAGE,
  "quiz_manage": ADMIN_PERMISSIONS.CONTENT_MANAGE,
  "essay_manage": ADMIN_PERMISSIONS.CONTENT_MANAGE,
  "question_manage": ADMIN_PERMISSIONS.CONTENT_MANAGE,
  "quiz_section_manage": ADMIN_PERMISSIONS.CONTENT_MANAGE,
  "quiz_group_manage": ADMIN_PERMISSIONS.CONTENT_MANAGE,
  "submission_view": ADMIN_PERMISSIONS.CONTENT_MANAGE,
  
  // User Management
  "user_view": ADMIN_PERMISSIONS.USER_MANAGE,
  "user_block": ADMIN_PERMISSIONS.USER_MANAGE,
  "user_delete": ADMIN_PERMISSIONS.USER_MANAGE,
  "user_role_assign": ADMIN_PERMISSIONS.USER_MANAGE,
  
  // Payment & Finance
  "payment_view": ADMIN_PERMISSIONS.PAYMENT_MANAGE,
  "payment_refund": ADMIN_PERMISSIONS.PAYMENT_MANAGE,
  "revenue_view": ADMIN_PERMISSIONS.REVENUE_VIEW,
  "statistics_finance": ADMIN_PERMISSIONS.REVENUE_VIEW,
  
  // Package Management
  "package_create": ADMIN_PERMISSIONS.PACKAGE_MANAGE,
  "package_edit": ADMIN_PERMISSIONS.PACKAGE_MANAGE,
  "package_delete": ADMIN_PERMISSIONS.PACKAGE_MANAGE
};

/**
 * Kiểm tra user có permission không
 * @param {Array<string>} userRoles - Danh sách roles của user
 * @param {string} permission - Permission cần kiểm tra
 * @returns {boolean}
 */
export const hasPermission = (userRoles, permission) => {
  if (!userRoles || userRoles.length === 0) return false;
  
  // SuperAdmin tự động có tất cả quyền
  if (userRoles.includes("SuperAdmin")) return true;
  
  // Kiểm tra từng role có permission không
  return userRoles.some(role => {
    const rolePermissions = ROLE_PERMISSIONS[role];
    return rolePermissions && rolePermissions.includes(permission);
  });
};

/**
 * Kiểm tra user có quyền với feature không
 * @param {Array<string>} userRoles - Danh sách roles của user
 * @param {string} feature - Feature key cần kiểm tra
 * @returns {boolean}
 */
export const hasFeatureAccess = (userRoles, feature) => {
  const requiredPermission = FEATURE_PERMISSIONS[feature];
  if (!requiredPermission) return false;
  
  return hasPermission(userRoles, requiredPermission);
};

/**
 * Kiểm tra user có ít nhất một trong các roles
 * @param {Array<string>} userRoles - Danh sách roles của user
 * @param {Array<string>} requiredRoles - Danh sách roles yêu cầu
 * @returns {boolean}
 */
export const hasAnyRole = (userRoles, requiredRoles) => {
  if (!userRoles || !requiredRoles) return false;
  return requiredRoles.some(role => userRoles.includes(role));
};

/**
 * Lấy tên hiển thị của feature
 * @param {string} feature - Feature key
 * @returns {string}
 */
export const getFeatureDisplayName = (feature) => {
  const featureNames = {
    "course_create": "tạo khóa học",
    "course_edit": "chỉnh sửa khóa học",
    "course_delete": "xóa khóa học",
    "course_publish": "xuất bản khóa học",
    "course_enroll_student": "thêm học viên vào khóa học",
    "lesson_create": "tạo bài học",
    "lesson_edit": "chỉnh sửa bài học",
    "lesson_delete": "xóa bài học",
    "module_create": "tạo module",
    "module_edit": "chỉnh sửa module",
    "module_delete": "xóa module",
    "lecture_create": "tạo bài giảng",
    "lecture_edit": "chỉnh sửa bài giảng",
    "lecture_delete": "xóa bài giảng",
    "flashcard_manage": "quản lý flashcards",
    "quiz_manage": "quản lý quiz",
    "essay_manage": "quản lý essay",
    "question_manage": "quản lý câu hỏi",
    "quiz_section_manage": "quản lý quiz section",
    "quiz_group_manage": "quản lý quiz group",
    "submission_view": "xem bài nộp của học viên",
    "user_view": "xem danh sách người dùng",
    "user_block": "chặn người dùng",
    "user_delete": "xóa người dùng",
    "user_role_assign": "phân quyền người dùng",
    "payment_view": "xem danh sách thanh toán",
    "payment_refund": "hoàn tiền",
    "revenue_view": "xem doanh thu",
    "statistics_finance": "xem thống kê tài chính",
    "package_create": "tạo gói giáo viên",
    "package_edit": "chỉnh sửa gói giáo viên",
    "package_delete": "xóa gói giáo viên"
  };
  
  return featureNames[feature] || "chức năng này";
};
