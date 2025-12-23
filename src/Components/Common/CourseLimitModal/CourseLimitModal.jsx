import React from "react";
import "./CourseLimitModal.css";
import { FaExclamationTriangle, FaArrowUp } from "react-icons/fa";

export default function CourseLimitModal({ 
    isOpen, 
    onClose,
    maxCourses,
    onUpgrade
}) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay course-limit-modal-overlay" onClick={onClose}>
            <div className="modal-content course-limit-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="course-limit-modal-header">
                    <div className="course-limit-icon-wrapper">
                        <FaExclamationTriangle className="course-limit-icon" />
                    </div>
                    <h2 className="course-limit-modal-title">Đã đạt giới hạn khóa học</h2>
                </div>
                
                <div className="course-limit-modal-body">
                    <p className="course-limit-message">
                        Bạn chỉ được phép tạo tối đa <strong>{maxCourses}</strong> khóa học theo gói hiện tại của bạn.
                    </p>
                    <p className="course-limit-submessage">
                        Vui lòng nâng cấp gói giáo viên để tạo thêm khóa học.
                    </p>
                </div>

                <div className="course-limit-modal-footer">
                    <button
                        type="button"
                        className="modal-btn course-limit-btn-close"
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                    {onUpgrade && (
                        <button
                            type="button"
                            className="modal-btn course-limit-btn-upgrade"
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

