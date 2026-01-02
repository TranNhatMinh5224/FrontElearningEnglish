import React, { useEffect } from "react";
import "./SuccessModal.css";
import { FaCheckCircle } from "react-icons/fa";

export default function SuccessModal({ 
    isOpen, 
    onClose,
    title = "Thành công",
    message,
    autoClose = true,
    autoCloseDelay = 3000
}) {
    useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, autoCloseDelay, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay success-modal-overlay" onClick={onClose}>
            <div className="modal-content success-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="success-modal-header">
                    <div className="success-icon-wrapper">
                        <FaCheckCircle className="success-icon" />
                    </div>
                    <h2 className="success-modal-title">{title}</h2>
                </div>
                
                <div className="success-modal-body">
                    <p className="success-message">{message}</p>
                </div>
            </div>
        </div>
    );
}

