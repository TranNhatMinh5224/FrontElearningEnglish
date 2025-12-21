import React from "react";
import "./ExitConfirmModal.css";

export default function ExitConfirmModal({ isOpen, onContinue, onExit }) {
    if (!isOpen) return null;

    return (
        <div className="exit-confirm-modal-overlay">
            <div className="exit-confirm-modal">
                <div className="exit-confirm-content">
                    <p className="exit-confirm-message">
                        Làm nốt bài đi. Thoát bây giờ là toàn bộ kết quả học không được lưu lại đó.
                    </p>
                    <div className="exit-confirm-actions">
                        <button
                            className="exit-confirm-continue-btn"
                            onClick={onContinue}
                        >
                            Tiếp tục ôn tập
                        </button>
                        <button
                            className="exit-confirm-exit-btn"
                            onClick={onExit}
                        >
                            Thoát
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

