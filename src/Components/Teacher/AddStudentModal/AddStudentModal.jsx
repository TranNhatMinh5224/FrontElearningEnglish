import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import "./AddStudentModal.css";
import { teacherService } from "../../../Services/teacherService";
import { adminService } from "../../../Services/adminService";
import { FaEnvelope, FaSpinner } from "react-icons/fa";

export default function AddStudentModal({ show, onClose, onSuccess, courseId, isAdmin = false }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Vui lòng nhập email học viên");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Email không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = isAdmin 
        ? await adminService.addStudentToCourse(courseId, email.trim())
        : await teacherService.addStudentToCourse(courseId, email.trim());

      if (response.data?.success || response.data?.Success) {
        setEmail("");
        onSuccess();
      } else {
        setError(response.data?.message || response.data?.Message || "Không thể thêm học viên");
      }
    } catch (err) {
      console.error("Error adding student:", err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.Message || 
                          "Đã xảy ra lỗi khi thêm học viên. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setLoading(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="add-student-modal">
      <Modal.Header closeButton>
        <Modal.Title>Thêm học viên vào khóa học</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="add-student-form">
          <div className="form-group">
            <label htmlFor="student-email">
              <FaEnvelope className="label-icon" />
              Email học viên
            </label>
            <input
              id="student-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Nhập email học viên cần thêm"
              className={`form-input ${error ? "error" : ""}`}
              disabled={loading}
              autoFocus
            />
            {error && <div className="error-message">{error}</div>}
            <div className="form-hint">
              Nhập email của học viên đã có tài khoản trong hệ thống
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <>
                  <FaSpinner className="spinner" />
                  Đang thêm...
                </>
              ) : (
                "Thêm học viên"
              )}
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}

