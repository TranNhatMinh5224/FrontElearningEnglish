import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { streakService } from "../Services/streakService";
import { useAuth } from "./AuthContext";

const StreakContext = createContext();

export const StreakProvider = ({ children }) => {
  const [streakDays, setStreakDays] = useState(0);
  const [isActiveToday, setIsActiveToday] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetchedRef = useRef(false);
  const { isGuest } = useAuth();

  const fetchAndCheckinStreak = useCallback(async () => {
    // Only fetch if not already fetched or if user is authenticated
    if (hasFetchedRef.current || isGuest) {
      if (isGuest) {
        setStreakDays(0);
        setIsActiveToday(false);
        hasFetchedRef.current = false;
      }
      return;
    }

    setIsLoading(true);
    try {
      // 1. Lấy streak hiện tại
      const response = await streakService.getMyStreak();
      const streakData = response.data.data;
      // Backend trả về PascalCase: CurrentStreak, IsActiveToday, LastActivityDate
      const currentStreak = streakData?.CurrentStreak || streakData?.currentStreak || 0;
      const activeToday = streakData?.IsActiveToday || streakData?.isActiveToday || false;
      
      setStreakDays(currentStreak);
      setIsActiveToday(activeToday);

      // 2. Nếu chưa check-in hôm nay, gọi check-in
      if (!activeToday) {
        try {
          const checkinResponse = await streakService.checkinStreak();
          const checkinResult = checkinResponse.data.data;
          if (checkinResult?.Success || checkinResult?.success) {
            // Cập nhật streak sau khi check-in
            const newStreak = checkinResult?.NewCurrentStreak || checkinResult?.newCurrentStreak || currentStreak;
            setStreakDays(newStreak);
            setIsActiveToday(true);
          }
        } catch (checkinError) {
          // Silently fail check-in - streak đã được fetch ở trên
        }
      }
      hasFetchedRef.current = true;
    } catch (error) {
      setStreakDays(0);
      setIsActiveToday(false);
    } finally {
      setIsLoading(false);
    }
  }, [isGuest]);

  useEffect(() => {
    if (isGuest) {
      setStreakDays(0);
      setIsActiveToday(false);
      hasFetchedRef.current = false;
      return;
    }

    // Delay một chút để đảm bảo user đã load xong trang
    const timer = setTimeout(() => {
      if (!hasFetchedRef.current) {
        fetchAndCheckinStreak();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isGuest, fetchAndCheckinStreak]);

  return (
    <StreakContext.Provider
      value={{
        streakDays,
        isActiveToday,
        isLoading,
        fetchAndCheckinStreak,
      }}
    >
      {children}
    </StreakContext.Provider>
  );
};

export const useStreak = () => useContext(StreakContext);

