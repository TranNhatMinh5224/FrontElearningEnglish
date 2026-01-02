import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService } from "../Services/authService";
import { tokenStorage } from "../Utils/tokenStorage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSocialLoginInProgress, setIsSocialLoginInProgress] = useState(false);

  // ===== INIT =====
  useEffect(() => {
    const initAuth = async () => {
      // If already authenticated (e.g., from social login), skip init
      if (isAuthenticated || isSocialLoginInProgress) {
        setLoading(false);
        return;
      }

      const token = tokenStorage.getAccessToken();
      if (!token) {
        setIsGuest(true);
        setLoading(false);
        return;
      }

      // Retry logic for getProfile - sometimes after social login, 
      // there's a small delay before backend recognizes the token
      let retries = 3;
      let delay = 500; // start with 500ms delay

      for (let i = 0; i < retries; i++) {
        try {
          const res = await authService.getProfile();
          const userData = res.data.data;
          // Backend trả về displayName hoặc fullName
          userData.fullName = userData.displayName || userData.fullName || `${userData.firstName} ${userData.lastName}`.trim();
          // Lưu avatarUrl vào user object
          userData.avatarUrl = userData.avatarUrl || null;
          setUser(userData);
          const rolesArray = userData.roles?.map((r) => r.name || r) || [];
          setRoles(rolesArray);
          setIsAuthenticated(true);
          setIsGuest(false);
          setLoading(false);
          return; // Success - exit early
        } catch (error) {
          console.error(`getProfile attempt ${i + 1} failed:`, error);
          
          // If this is the last retry, clear tokens and set as guest
          if (i === retries - 1) {
            console.error("All getProfile attempts failed, clearing tokens");
            tokenStorage.clear();
            setIsGuest(true);
            setLoading(false);
            return;
          }
          
          // Wait before retrying (exponential backoff)
          const currentDelay = delay;
          await new Promise(resolve => setTimeout(resolve, currentDelay));
          delay *= 2; // double the delay for next retry
        }
      }
    };

    initAuth();
  }, [isAuthenticated, isSocialLoginInProgress]);

  // ===== LOGIN =====
  const login = useCallback(async (data, navigate) => {
    try {
      const res = await authService.login(data);
      
      if (!res.data?.success || !res.data?.data) {
        throw new Error(res.data?.message || "Đăng nhập thất bại");
      }

      const { accessToken, refreshToken, user } = res.data.data;

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Dữ liệu đăng nhập không hợp lệ");
      }

      // Parse user data
      user.fullName = user.displayName || user.fullName || `${user.firstName} ${user.lastName}`.trim();
      user.avatarUrl = user.avatarUrl || null;

      // Set state BEFORE saving tokens to prevent race condition
      setUser(user);
      const rolesArray = user.roles?.map((r) => r.name || r) || [];
      setRoles(rolesArray);
      setIsAuthenticated(true);
      setIsGuest(false);
      setLoading(false);
      
      // Now save tokens
      tokenStorage.setTokens({ accessToken, refreshToken });

      // Debug: Log roles to check
      console.log("=== LOGIN DEBUG ===");
      console.log("User roles from backend:", user.roles);
      console.log("Mapped roles array:", rolesArray);

      // Use window.location.href instead of navigate to prevent state reset
      // Check for any admin role: SuperAdmin, ContentAdmin, FinanceAdmin, or Admin
      const isAdmin = rolesArray.some((roleName) => {
        const normalizedRole = typeof roleName === 'string' ? roleName : roleName?.name || roleName;
        return normalizedRole === "SuperAdmin" || 
               normalizedRole === "ContentAdmin" || 
               normalizedRole === "FinanceAdmin" ||
               normalizedRole === "Admin";
      });
      
      console.log("Is Admin:", isAdmin);
      const redirectPath = isAdmin ? "/admin" : "/home";
      console.log("Redirecting to:", redirectPath);
      window.location.href = redirectPath;
    } catch (error) {
      throw error; // Re-throw để component có thể catch
    }
  }, []);

  // ===== GOOGLE LOGIN =====
  const googleLogin = useCallback(async (data, navigate) => {
    try {
      console.log("=== AuthContext.googleLogin START ===");
      setIsSocialLoginInProgress(true);
      const res = await authService.googleLogin(data);
      
      // Backend returns: { success, statusCode, message, data: { accessToken, refreshToken, user, expiresAt } }
      if (!res.data?.success || !res.data?.data) {
        throw new Error(res.data?.message || "Đăng nhập bằng Google thất bại");
      }

      const { accessToken, refreshToken, user } = res.data.data;

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Dữ liệu đăng nhập không hợp lệ");
      }

      user.fullName = user.displayName || user.fullName || `${user.firstName} ${user.lastName}`.trim();
      user.avatarUrl = user.avatarUrl || null;

      console.log("Setting tokens and user state...");
      // IMPORTANT: Set state BEFORE saving tokens to prevent race condition
      // where useEffect init runs before state is set
      setUser(user);
      const rolesArray = user.roles?.map((r) => r.name || r) || [];
      setRoles(rolesArray);
      setIsAuthenticated(true);
      setIsGuest(false);
      setLoading(false);
      
      // Now save tokens - this ensures state is ready before any token-based checks
      tokenStorage.setTokens({ accessToken, refreshToken });

      console.log("Navigating to home/admin...");
      console.log("User roles from backend:", user.roles);
      console.log("Mapped roles array:", rolesArray);
      
      // Use window.location.href instead of navigate to prevent state reset
      // Check for any admin role: SuperAdmin, ContentAdmin, FinanceAdmin, or Admin
      const isAdmin = rolesArray.some((roleName) => {
        const normalizedRole = typeof roleName === 'string' ? roleName : roleName?.name || roleName;
        return normalizedRole === "SuperAdmin" || 
               normalizedRole === "ContentAdmin" || 
               normalizedRole === "FinanceAdmin" ||
               normalizedRole === "Admin";
      });
      
      console.log("Is Admin:", isAdmin);
      const redirectPath = isAdmin ? "/admin" : "/home";
      console.log("Redirecting to:", redirectPath);
      window.location.href = redirectPath;
      console.log("=== AuthContext.googleLogin SUCCESS ===");
    } catch (error) {
      console.error("=== AuthContext.googleLogin ERROR ===", error);
      setIsSocialLoginInProgress(false);
      throw error; // Re-throw để component có thể catch
    }
  }, []);

  // ===== FACEBOOK LOGIN =====
  const facebookLogin = useCallback(async (data, navigate) => {
    try {
      // Log to terminal (console.log outputs to terminal in Node.js/React)
      console.log("=== AuthContext.facebookLogin START ===");
      setIsSocialLoginInProgress(true);
      console.log("Received data:", JSON.stringify({ ...data, Code: data?.Code ? "***" : undefined }, null, 2));
      
      console.log("Calling authService.facebookLogin...");
      const res = await authService.facebookLogin(data);
      console.log("Backend response received");
      console.log("Response status:", res.status);
      console.log("Response statusText:", res.statusText);
      console.log("Response data:", JSON.stringify(res.data, null, 2));
      
      // Backend returns: { success, statusCode, message, data: { accessToken, refreshToken, user, expiresAt } }
      if (!res.data?.success || !res.data?.data) {
        console.error("Backend returned error response");
        console.error("Success:", res.data?.success);
        console.error("StatusCode:", res.data?.statusCode);
        console.error("Message:", res.data?.message);
        console.error("Data:", JSON.stringify(res.data?.data, null, 2));
        throw new Error(res.data?.message || "Đăng nhập bằng Facebook thất bại");
      }

      const { accessToken, refreshToken, user } = res.data.data;
      console.log("Extracted data from response");
      console.log("Has accessToken:", !!accessToken);
      console.log("Has refreshToken:", !!refreshToken);
      console.log("Has user:", !!user);
      console.log("User data:", JSON.stringify(user ? { 
        userId: user.userId, 
        email: user.email, 
        fullName: user.fullName || user.displayName,
        hasRoles: !!user.roles 
      } : null, null, 2));

      if (!accessToken || !refreshToken || !user) {
        console.error("Missing required data in response");
        throw new Error("Dữ liệu đăng nhập không hợp lệ");
      }

      user.fullName = user.displayName || user.fullName || `${user.firstName} ${user.lastName}`.trim();
      user.avatarUrl = user.avatarUrl || null;

      console.log("Setting tokens and user state...");
      // IMPORTANT: Set state BEFORE saving tokens to prevent race condition
      setUser(user);
      const rolesArray = user.roles?.map((r) => r.name || r) || [];
      setRoles(rolesArray);
      setIsAuthenticated(true);
      setIsGuest(false);
      setLoading(false);
      
      // Now save tokens
      tokenStorage.setTokens({ accessToken, refreshToken });

      console.log("Navigating to home/admin...");
      console.log("User roles from backend:", user.roles);
      console.log("Mapped roles array:", rolesArray);
      
      // Use window.location.href instead of navigate to prevent state reset
      // Check for any admin role: SuperAdmin, ContentAdmin, FinanceAdmin, or Admin
      const isAdmin = rolesArray.some((roleName) => {
        const normalizedRole = typeof roleName === 'string' ? roleName : roleName?.name || roleName;
        return normalizedRole === "SuperAdmin" || 
               normalizedRole === "ContentAdmin" || 
               normalizedRole === "FinanceAdmin" ||
               normalizedRole === "Admin";
      });
      
      console.log("Is Admin:", isAdmin);
      const redirectPath = isAdmin ? "/admin" : "/home";
      console.log("Redirecting to:", redirectPath);
      window.location.href = redirectPath;
      console.log("=== AuthContext.facebookLogin SUCCESS ===");
    } catch (error) {
      console.error("=== AuthContext.facebookLogin ERROR ===");
      console.error("Error object:", error);
      console.error("Error type:", typeof error);
      console.error("Error message:", error.message);
      console.error("Error name:", error.name);
      console.error("Error stack:", error.stack);
      
      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", JSON.stringify(error.response.data, null, 2));
      }
      
      setIsSocialLoginInProgress(false);
      throw error; // Re-throw để component có thể catch
    }
  }, []);

  // ===== GUEST =====
  const loginAsGuest = useCallback((navigate) => {
    try {
      console.log("=== LOGIN AS GUEST START ===");
      
      // Clear all tokens and user data
      tokenStorage.clear();
      console.log("Tokens cleared");
      
      // Reset all auth state
      setUser(null);
      setRoles([]);
      setIsAuthenticated(false);
      setIsGuest(true);
      console.log("Auth state reset - isGuest: true");
      
      // Navigate to home
      console.log("Navigating to /home...");
      navigate("/home");
      console.log("=== LOGIN AS GUEST SUCCESS ===");
    } catch (error) {
      console.error("=== LOGIN AS GUEST ERROR ===");
      console.error("Error:", error);
      // Still try to navigate even if there's an error
      navigate("/home");
    }
  }, []);

  // ===== LOGOUT =====
  const logout = useCallback(async (navigate) => {
    try {
      const rt = tokenStorage.getRefreshToken();
      if (rt) {
        await authService.logout(rt);
      }
    } catch (_) {
      // ignore errors on logout
    } finally {
      tokenStorage.clear();
      setUser(null);
      setRoles([]);
      setIsAuthenticated(false);
      setIsGuest(true);
      navigate("/login");
    }
  }, []);

  // ===== REFRESH USER =====
  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getProfile();
      const userData = response.data.data;
      userData.fullName = userData.displayName || userData.fullName || `${userData.firstName} ${userData.lastName}`.trim();
      userData.avatarUrl = userData.avatarUrl || null;
      setUser(userData);
      setRoles(userData.roles?.map((r) => r.name) || []);
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        isAuthenticated,
        isGuest,
        loading,
        login,
        googleLogin,
        facebookLogin,
        loginAsGuest,
        logout,
        refreshUser,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
