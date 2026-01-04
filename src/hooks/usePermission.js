import { useState, useCallback } from "react";
import { useAuth } from "../Context/AuthContext";
import { hasFeatureAccess, getFeatureDisplayName } from "../Utils/permissions";

/**
 * Custom hook để kiểm tra quyền và hiển thị modal unauthorized
 * @returns {Object} { checkPermission, showUnauthorizedModal, unauthorizedFeature, closeUnauthorizedModal }
 */
export const usePermission = () => {
  const { roles } = useAuth();
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [unauthorizedFeature, setUnauthorizedFeature] = useState("");

  /**
   * Kiểm tra quyền trước khi thực hiện action
   * @param {string} feature - Feature key cần kiểm tra
   * @param {Function} callback - Callback function sẽ chạy nếu có quyền
   * @returns {boolean} - True nếu có quyền, false nếu không
   */
  const checkPermission = useCallback((feature, callback) => {
    const hasAccess = hasFeatureAccess(roles, feature);
    
    if (hasAccess) {
      if (callback && typeof callback === "function") {
        callback();
      }
      return true;
    } else {
      // Không có quyền -> hiện modal
      const featureName = getFeatureDisplayName(feature);
      setUnauthorizedFeature(featureName);
      setShowUnauthorizedModal(true);
      return false;
    }
  }, [roles]);

  const closeUnauthorizedModal = useCallback(() => {
    setShowUnauthorizedModal(false);
    setUnauthorizedFeature("");
  }, []);

  return {
    checkPermission,
    showUnauthorizedModal,
    unauthorizedFeature,
    closeUnauthorizedModal
  };
};
