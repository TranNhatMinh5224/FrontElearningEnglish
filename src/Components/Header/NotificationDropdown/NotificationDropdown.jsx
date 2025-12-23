import React, { useState, useEffect, useRef, useCallback } from "react";
import { Dropdown } from "react-bootstrap";
import { notificationService } from "../../../Services/notificationService";
import { useAuth } from "../../../Context/AuthContext";
import { useNotificationRefresh } from "../../../Context/NotificationContext";
import { iconBell } from "../../../Assets";
import { 
    FaGraduationCap, 
    FaCheckCircle, 
    FaBook, 
    FaFileAlt, 
    FaCreditCard
} from "react-icons/fa";
import "./NotificationDropdown.css";

export default function NotificationDropdown() {
    const { isAuthenticated, isGuest } = useAuth();
    const { registerRefreshCallback } = useNotificationRefresh();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const pollingIntervalRef = useRef(null);
    const notificationListRef = useRef(null);
    const hasMarkedAllAsReadRef = useRef(false);

    // Fetch unread count separately (lighter API call for polling)
    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await notificationService.getUnreadCount();
            // Handle both camelCase and PascalCase responses
            const isSuccess = response.data?.Success !== false || response.data?.isSuccess !== false;
            const count = response.data?.data ?? response.data?.Data;
            if (isSuccess && count !== undefined) {
                setUnreadCount(count);
            }
        } catch (error) {
            // Silently fail for polling - don't spam console
            if (process.env.NODE_ENV === 'development') {
                console.error("Error fetching unread count:", error);
            }
        }
    }, []);

    // Fetch full notifications list
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            // Reset flag khi fetch notifications mới
            hasMarkedAllAsReadRef.current = false;
            const response = await notificationService.getAll();
            // Handle both camelCase and PascalCase responses
            const isSuccess = response.data?.Success !== false || response.data?.isSuccess !== false;
            const data = response.data?.data ?? response.data?.Data;
            if (isSuccess && data) {
                const notificationsData = Array.isArray(data) ? data : [];
                setNotifications(notificationsData);
            }
            // Also update unread count from API
            await fetchUnreadCount();
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [fetchUnreadCount]);

    // Register refresh callback với NotificationContext
    useEffect(() => {
        if (isAuthenticated && !isGuest) {
            const refreshCallback = () => {
                fetchUnreadCount();
                fetchNotifications();
            };
            registerRefreshCallback(refreshCallback);
        }
    }, [registerRefreshCallback, fetchUnreadCount, fetchNotifications, isAuthenticated, isGuest]);

    // Poll for unread count every 30 seconds when authenticated
    useEffect(() => {
        if (isAuthenticated && !isGuest) {
            // Initial fetch
            fetchUnreadCount();
            fetchNotifications();

            // Set up polling
            pollingIntervalRef.current = setInterval(() => {
                fetchUnreadCount();
            }, 30000); // 30 seconds

            return () => {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                }
            };
        } else {
            setUnreadCount(0);
            setNotifications([]);
            hasMarkedAllAsReadRef.current = false;
        }
    }, [isAuthenticated, isGuest]);

    // Reset flag khi mở dropdown và có thông báo mới
    useEffect(() => {
        if (notifications.length > 0) {
            const hasUnread = notifications.some(n => {
                const isRead = n.isRead || n.IsRead || false;
                return !isRead;
            });
            // Reset flag nếu có thông báo chưa đọc
            if (hasUnread) {
                hasMarkedAllAsReadRef.current = false;
            }
        }
    }, [notifications]);

    const handleMarkAsRead = async (notificationId, e) => {
        if (e) e.stopPropagation();
        try {
            await notificationService.markAsRead(notificationId);
            // Update local state
            setNotifications(prev => 
                prev.map(n => {
                    const id = n.id || n.Id;
                    if (id === notificationId) {
                        return { ...n, isRead: true, IsRead: true };
                    }
                    return n;
                })
            );
            // Update unread count
            await fetchUnreadCount();
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const handleMarkAllAsRead = async (e) => {
        if (e) e.stopPropagation();
        try {
            await notificationService.markAllAsRead();
            // Update local state
            setNotifications(prev => 
                prev.map(n => ({ ...n, isRead: true, IsRead: true }))
            );
            setUnreadCount(0);
            hasMarkedAllAsReadRef.current = true;
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    // Tự động đánh dấu tất cả đã đọc khi scroll đến cuối danh sách
    const handleScroll = () => {
        const listElement = notificationListRef.current;
        if (!listElement || hasMarkedAllAsReadRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = listElement;
        // Khi scroll đến gần cuối (còn 50px nữa là hết), tự động đánh dấu tất cả đã đọc
        const isNearBottom = scrollHeight - scrollTop - clientHeight <= 50;

        if (isNearBottom && unreadCount > 0) {
            handleMarkAllAsRead(null);
        }
    };

    const handleNotificationClick = (notification, e) => {
        e?.stopPropagation();
        const id = notification.id || notification.Id;
        const isRead = notification.isRead || notification.IsRead || false;

        // Chỉ đánh dấu đã đọc khi click, không tự động chuyển trang
        if (!isRead) {
            handleMarkAsRead(id, null);
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

    const getNotificationIcon = (type) => {
        // Convert to string first (handles numbers/enums from backend)
        const typeStr = type != null ? String(type).toLowerCase() : "";
        switch (typeStr) {
            case 'courseenrollment':
            case '0': // Enum value 0
                return <FaGraduationCap className="notification-type-icon icon-enrollment" />;
            case 'coursecompletion':
            case '1': // Enum value 1
                return <FaCheckCircle className="notification-type-icon icon-completion" />;
            case 'vocabularyreminder':
            case '2': // Enum value 2
                return <FaBook className="notification-type-icon icon-vocabulary" />;
            case 'assessmentgraded':
            case '3': // Enum value 3
                return <FaFileAlt className="notification-type-icon icon-assessment" />;
            case 'paymentsuccess':
            case '4': // Enum value 4
                return <FaCreditCard className="notification-type-icon icon-payment" />;
            default:
                return <FaCheckCircle className="notification-type-icon icon-default" />;
        }
    };

    const getCurrentUnreadCount = () => {
        return notifications.filter(n => {
            const isRead = n.isRead || n.IsRead || false;
            return !isRead;
        }).length;
    };

    const hasUnreadNotifications = unreadCount > 0 || getCurrentUnreadCount() > 0;

    if (isGuest || !isAuthenticated) {
        return null;
    }

    return (
        <Dropdown 
            className="notification-wrapper" 
            align="end"
            onToggle={(isOpen) => {
                if (isOpen) {
                    // Reset flag khi mở dropdown
                    hasMarkedAllAsReadRef.current = false;
                    fetchNotifications();
                }
            }}
        >
            <Dropdown.Toggle
                as="button"
                className={`notification-button ${unreadCount > 0 ? 'has-notifications' : ''}`}
                id="notification-dropdown"
            >
                <img src={iconBell} alt="Thông báo" className={`notification-icon ${unreadCount > 0 ? 'ringing' : ''}`} />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu className="notification-dropdown">
                <div className="notification-header">
                    <h6 className="notification-title">Thông báo</h6>
                    {hasUnreadNotifications && (
                        <button 
                            className="notification-mark-all-btn"
                            onClick={handleMarkAllAsRead}
                            title="Đánh dấu tất cả đã đọc"
                        >
                            Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>
                <div 
                    className="notification-list"
                    ref={notificationListRef}
                    onScroll={handleScroll}
                >
                    {loading ? (
                        <div className="notification-empty">Đang tải...</div>
                    ) : notifications.length === 0 ? (
                        <div className="notification-empty">Chưa có thông báo nào</div>
                    ) : (
                        notifications.map((notification) => {
                            const id = notification.id || notification.Id;
                            const title = notification.title || notification.Title || "";
                            const message = notification.message || notification.Message || "";
                            const isRead = notification.isRead || notification.IsRead || false;
                            const createdAt = notification.createdAt || notification.CreatedAt;
                            const type = notification.type || notification.Type;

                            return (
                                <div
                                    key={id}
                                    className={`notification-item ${!isRead ? "unread" : ""}`}
                                    onClick={(e) => handleNotificationClick(notification, e)}
                                >
                                    <div className="notification-icon-wrapper">
                                        {getNotificationIcon(type)}
                                    </div>
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

