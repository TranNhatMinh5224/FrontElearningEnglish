import React, { useState } from "react";
import "./JoinClassModal.css";

export default function JoinClassModal({ isOpen, onClose, onJoin }) {
    const [classCode, setClassCode] = useState("");
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (!classCode.trim()) {
            setError("Vui lòng nhập mã lớp học");
            return;
        }

        onJoin(classCode.trim());
        setClassCode("");
    };

    const handleClose = () => {
        setClassCode("");
        setError("");
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Nhập mã lớp học</h2>

                <form onSubmit={handleSubmit}>
                    <div className="modal-input-wrapper">
                        <input
                            type="text"
                            className="modal-input"
                            placeholder="Nhập mã lớp (ví dụ:11111)"
                            value={classCode}
                            onChange={(e) => {
                                setClassCode(e.target.value);
                                setError("");
                            }}
                            autoFocus
                        />
                        {error && <div className="modal-error">{error}</div>}
                    </div>

                    <div className="modal-buttons">
                        <button
                            type="button"
                            className="modal-btn modal-btn-cancel"
                            onClick={handleClose}
                        >
                            Huỷ
                        </button>
                        <button
                            type="submit"
                            className="modal-btn modal-btn-submit"
                        >
                            Tham gia lớp học
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

