import React from "react";
import { MdBlock, MdLock } from "react-icons/md";
import "./UnauthorizedModal.css";

export default function UnauthorizedModal({ show, onClose, feature = "chức năng này" }) {
  if (!show) return null;

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered unauthorized-modal-dialog">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
        <div className="unauthorized-modal-icon-wrapper">
          <div className="unauthorized-icon-bg">
            <MdBlock className="unauthorized-icon" />
          </div>
        </div>

        <div className="unauthorized-modal-body">
          <h4 className="unauthorized-title">
            <MdLock className="me-2" />
            Không có quyền truy cập
          </h4>
          <p className="unauthorized-message">
            Bạn không có quyền truy cập vào <strong>{feature}</strong>.
          </p>
          <p className="unauthorized-hint">
            Vui lòng liên hệ quản trị viên để được cấp quyền hoặc sử dụng tài khoản có quyền phù hợp.
          </p>
        </div>

        <div className="unauthorized-modal-footer">
          <button 
            onClick={onClose}
            className="btn btn-primary unauthorized-close-btn"
          >
            Đã hiểu
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
