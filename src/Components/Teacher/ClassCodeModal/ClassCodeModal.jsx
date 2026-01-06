import React, { useState } from "react";
import { FaCopy, FaExpand } from "react-icons/fa";
import "./ClassCodeModal.css";

export default function ClassCodeModal({ isOpen, onClose, classCode, courseTitle }) {
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyClassCode = () => {
    navigator.clipboard.writeText(classCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="class-code-modal-overlay" onClick={onClose}>
      <div className="class-code-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="class-code-modal-close" onClick={onClose}>
          ×
        </button>
        <h2 className="class-code-modal-title">Mã lớp</h2>
        <div className="class-code-display">
          {classCode}
        </div>
        <div className="class-code-info">
          <span className="class-code-label">{courseTitle}</span>
        </div>
        <button className="class-code-copy-btn" onClick={handleCopyClassCode}>
          <FaCopy className="me-2" />
          {copySuccess ? "Đã sao chép!" : "Sao chép đường liên kết mới"}
        </button>
        <button className="class-code-expand-btn" title="Phóng to">
          <FaExpand />
        </button>
      </div>
    </div>
  );
}
