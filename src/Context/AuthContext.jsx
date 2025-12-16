import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../Services/authService";
import { tokenStorage } from "../Utils/tokenStorage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  // ===== INIT =====
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setIsGuest(true);
      setLoading(false);
      return;
    }

    authService
      .getProfile()
      .then((res) => {
        const userData = res.data.data;
        // Backend trả về displayName hoặc fullName
        userData.fullName = userData.displayName || userData.fullName || `${userData.firstName} ${userData.lastName}`.trim();
        // Lưu avatarUrl vào user object
        userData.avatarUrl = userData.avatarUrl || null;
        setUser(userData);
        setRoles(userData.roles?.map((r) => r.name) || []);
        setIsAuthenticated(true);
        setIsGuest(false);
      })
      .catch(() => {
        tokenStorage.clear();
        setIsGuest(true);
      })
      .finally(() => setLoading(false));
  }, []);

  // ===== LOGIN =====
  const login = (data, navigate) => {
    return authService.login(data).then((res) => {
      const { accessToken, refreshToken, user } = res.data.data;

      // Parse user data
      user.fullName = user.displayName || user.fullName || `${user.firstName} ${user.lastName}`.trim();
      user.avatarUrl = user.avatarUrl || null;

      tokenStorage.setTokens({ accessToken, refreshToken });
      setUser(user);
      setRoles(user.roles?.map((r) => r.name) || []);
      setIsAuthenticated(true);
      setIsGuest(false);

      if (user.roles?.some((r) => r.name === "Admin")) {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    });
  };

  // ===== GUEST =====
  const loginAsGuest = (navigate) => {
    tokenStorage.clear();
    setUser(null);
    setRoles([]);
    setIsAuthenticated(false);
    setIsGuest(true);
    navigate("/home");
  };

  // ===== LOGOUT =====
  const logout = async (navigate) => {
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
  };

  // ===== REFRESH USER =====
  const refreshUser = async () => {
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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        isAuthenticated,
        isGuest,
        loading,
        login,
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
