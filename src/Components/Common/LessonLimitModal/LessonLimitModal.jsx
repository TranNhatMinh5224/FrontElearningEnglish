import React from "react";
import "./LessonLimitModal.css";
import { FaExclamationTriangle, FaArrowUp } from "react-icons/fa";

export default function LessonLimitModal({ 
    isOpen, 
    onClose,
    maxLessons,
    onUpgrade
}) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay lesson-limit-modal-overlay" onClick={onClose}>
            <div className="modal-content lesson-limit-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="lesson-limit-modal-header">
                    <div className="lesson-limit-icon-wrapper">
                        <FaExclamationTriangle className="lesson-limit-icon" />
                    </div>
                    <h2 className="lesson-limit-modal-title">Đã đạt giới hạn bài học</h2>
                </div>
                
                <div className="lesson-limit-modal-body">
                    <p className="lesson-limit-message">
                        Bạn chỉ được phép tạo tối đa <strong>{maxLessons}</strong> bài học theo gói hiện tại của bạn.
                    </p>
                    <p className="lesson-limit-submessage">
                        Vui lòng nâng cấp gói giáo viên để tạo thêm bài học.
                    </p>
                </div>

                <div className="lesson-limit-modal-footer">
                    <button
                        type="button"
                        className="modal-btn lesson-limit-btn-close"
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                    {onUpgrade && (
                        <button
                            type="button"
                            className="modal-btn lesson-limit-btn-upgrade"
                            onClick={onUpgrade}
                        >
                            <FaArrowUp className="upgrade-icon" />
                            Nâng cấp gói
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

