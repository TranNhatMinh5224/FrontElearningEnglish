import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { notificationService } from "../../../Services/notificationService";
import { useAuth } from "../../../Context/AuthContext";
import { iconBell } from "../../../Assets";
import "./NotificationDropdown.css";

export default function NotificationDropdown() {
    const { isAuthenticated, isGuest } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated && !isGuest) {
            fetchNotifications();
        }
    }, [isAuthenticated, isGuest]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationService.getAll();
            if (response.data?.isSuccess && response.data?.data) {
                const notificationsData = Array.isArray(response.data.data) 
                    ? response.data.data 
                    : [];
                setNotifications(notificationsData);
                
                // Count unread notifications
                const unread = notificationsData.filter(n => !n.isRead || !n.IsRead).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId, e) => {
        e.stopPropagation();
        try {
            await notificationService.markAsRead(notificationId);
            // Update local state
            setNotifications(prev => 
                prev.map(n => 
                    (n.id === notificationId || n.Id === notificationId)
                        ? { ...n, isRead: true, IsRead: true }
                        : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Vừa xong";
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    if (isGuest || !isAuthenticated) {
        return null;
    }

    return (
        <Dropdown 
            className="notification-wrapper" 
            align="end"
            onToggle={(isOpen) => {
                if (isOpen) {
                    fetchNotifications();
                }
            }}
        >
            <Dropdown.Toggle
                as="button"
                className="notification-button"
                id="notification-dropdown"
            >
                <img src={iconBell} alt="Notifications" className="notification-icon" />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu className="notification-dropdown">
                <div className="notification-header">
                    <h6 className="notification-title">Thông báo</h6>
                </div>
                <div className="notification-list">
                    {loading ? (
                        <div className="notification-empty">Đang tải...</div>
                    ) : notifications.length === 0 ? (
                        <div className="notification-empty">Chưa có thông báo nào mới</div>
                    ) : (
                        notifications.map((notification) => {
                            const id = notification.id || notification.Id;
                            const title = notification.title || notification.Title || "";
                            const message = notification.message || notification.Message || "";
                            const isRead = notification.isRead || notification.IsRead || false;
                            const createdAt = notification.createdAt || notification.CreatedAt;

                            return (
                                <div
                                    key={id}
                                    className={`notification-item ${!isRead ? "unread" : ""}`}
                                    onClick={(e) => handleMarkAsRead(id, e)}
                                >
                                    <div className="notification-content">
                                        {title && (
                                            <div className="notification-item-title">{title}</div>
                                        )}
                                        {message && (
                                            <div className="notification-item-message">{message}</div>
                                        )}
                                        {createdAt && (
                                            <div className="notification-item-time">
                                                {formatDate(createdAt)}
                                            </div>
                                        )}
                                    </div>
                                    {!isRead && <div className="notification-dot"></div>}
                                </div>
                            );
                        })
                    )}
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
}

