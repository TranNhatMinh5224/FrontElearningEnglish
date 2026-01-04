import React from "react";
import "./ConfirmModal.css";
import { FaQuestionCircle, FaExclamationTriangle } from "react-icons/fa";

export default function ConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm,
    title = "Xác nhận",
    message,
    itemName = "", // Tên item cần xác nhận (dùng cho delete)
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    type = "warning", // "warning", "danger", "delete"
    disabled = false,
    loading = false // Thêm loading state
}) {
    if (!isOpen) return null;

    // Icon theo type
    const getIcon = () => {
        if (type === "delete" || type === "danger") {
            return <FaExclamationTriangle className={`confirm-icon confirm-icon-${type}`} />;
        }
        return <FaQuestionCircle className={`confirm-icon confirm-icon-${type}`} />;
    };

    return (
        <div className="modal-overlay confirm-modal-overlay" onClick={onClose}>
            <div className="modal-content confirm-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-modal-header">
                    {getIcon()}
                    <h2 className="confirm-modal-title">{title}</h2>
                </div>
                
                <div className="confirm-modal-body">
                    <p className="confirm-message">{message}</p>
                    {itemName && <p className="item-name">"{itemName}"</p>}
                </div>

                <div className="confirm-modal-footer">
                    <button
                        type="button"
                        className="modal-btn modal-btn-cancel"
                        onClick={onClose}
                        disabled={disabled || loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={`modal-btn confirm-btn confirm-btn-${type}`}
                        onClick={onConfirm}
                        disabled={disabled || loading}
                    >
                        {loading ? "Đang xử lý..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

