import React from "react";
import "./ConfirmModal.css";
import { FaQuestionCircle } from "react-icons/fa";

export default function ConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm,
    title = "Xác nhận",
    message,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    type = "warning", // "warning", "danger"
    disabled = false
}) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay confirm-modal-overlay" onClick={onClose}>
            <div className="modal-content confirm-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-modal-header">
                    <FaQuestionCircle className={`confirm-icon confirm-icon-${type}`} />
                    <h2 className="confirm-modal-title">{title}</h2>
                </div>
                
                <div className="confirm-modal-body">
                    <p className="confirm-message">{message}</p>
                </div>

                <div className="confirm-modal-footer">
                    <button
                        type="button"
                        className="modal-btn modal-btn-cancel"
                        onClick={onClose}
                        disabled={disabled}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={`modal-btn confirm-btn confirm-btn-${type}`}
                        onClick={onConfirm}
                        disabled={disabled}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

