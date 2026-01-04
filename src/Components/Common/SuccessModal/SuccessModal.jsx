import React, { useEffect, useRef } from "react";
import "./SuccessModal.css";
import { FaCheckCircle } from "react-icons/fa";

export default function SuccessModal({ 
    isOpen, 
    onClose,
    title = "Thành công",
    message,
    autoClose = true,
    autoCloseDelay = 1500
}) {
    const onCloseRef = useRef(onClose);

    // keep latest onClose in a ref so the auto-close timer doesn't get
    // cancelled by parent re-renders that recreate the onClose function.
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => {
                if (onCloseRef.current) onCloseRef.current();
            }, autoCloseDelay);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, autoCloseDelay]);

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

