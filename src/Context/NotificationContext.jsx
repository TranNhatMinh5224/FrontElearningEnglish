import React, { createContext, useContext, useRef, useCallback } from "react";

const NotificationContext = createContext(null);

export const useNotificationRefresh = () => {
    const context = useContext(NotificationContext);
    return context;
};

export const NotificationProvider = ({ children }) => {
    const refreshCallbackRef = useRef(null);

    const registerRefreshCallback = useCallback((callback) => {
        refreshCallbackRef.current = callback;
    }, []);

    const refreshNotifications = useCallback(() => {
        if (refreshCallbackRef.current) {
            refreshCallbackRef.current();
        }
    }, []);

    return (
        <NotificationContext.Provider value={{ registerRefreshCallback, refreshNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

