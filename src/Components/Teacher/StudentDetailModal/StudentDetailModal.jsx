import React from "react";
import { Modal } from "react-bootstrap";
import "./StudentDetailModal.css";
import { FaUser, FaEnvelope, FaCalendarAlt, FaVenusMars, FaGraduationCap, FaCheckCircle } from "react-icons/fa";

export default function StudentDetailModal({ show, onClose, student, courseId }) {
  if (!student) return null;

  const displayName = student.displayName || student.DisplayName || 
    `${student.firstName || student.FirstName || ""} ${student.lastName || student.LastName || ""}`.trim();
  const email = student.email || student.Email || "";
  const dateOfBirth = student.dateOfBirth || student.DateOfBirth;
  const isMale = student.isMale !== undefined ? student.isMale : (student.IsMale !== undefined ? student.IsMale : true);
  const avatarUrl = student.avatarUrl || student.AvatarUrl;
  const courseName = student.courseName || student.CourseName || "";
  const joinedAt = student.joinedAt || student.JoinedAt;
  const progress = student.progress || student.Progress;

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return "Chưa cập nhật";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Chưa cập nhật";
    }
  };

  const calculateAge = (dateString) => {
    if (!dateString) return null;
    try {
      const birthDate = new Date(dateString);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  const age = calculateAge(dateOfBirth);
  const progressPercentage = progress?.progressPercentage || progress?.ProgressPercentage || 0;
  const completedLessons = progress?.completedLessons || progress?.CompletedLessons || 0;
  const totalLessons = progress?.totalLessons || progress?.TotalLessons || 0;
  const isCompleted = progress?.isCompleted || progress?.IsCompleted || false;
  const completedAt = progress?.completedAt || progress?.CompletedAt;
  const lastUpdated = progress?.lastUpdated || progress?.LastUpdated;

  return (
    <Modal show={show} onHide={onClose} size="lg" centered className="student-detail-modal">
      <Modal.Header closeButton>
        <Modal.Title>Thông tin học viên</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="student-detail-content">
          {/* Avatar and Basic Info */}
          <div className="student-header">
            <div className="student-avatar-large">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} />
              ) : (
                <div className="avatar-placeholder-large">
                  <FaUser />
                </div>
              )}
            </div>
            <div className="student-header-info">
              <h2 className="student-name-large">{displayName || "Chưa có tên"}</h2>
              {isCompleted && (
                <div className="completion-badge">
                  <FaCheckCircle />
                  <span>Đã hoàn thành khóa học</span>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="info-section">
            <h3 className="section-title">
              <FaUser className="section-icon" />
              Thông tin cá nhân
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <label>
                  <FaEnvelope className="info-icon" />
                  Email
                </label>
                <span>{email || "Chưa cập nhật"}</span>
              </div>
              <div className="info-item">
                <label>
                  <FaCalendarAlt className="info-icon" />
                  Ngày sinh
                </label>
                <span>
                  {formatDate(dateOfBirth)}
                  {age !== null && ` (${age} tuổi)`}
                </span>
              </div>
              <div className="info-item">
                <label>
                  <FaVenusMars className="info-icon" />
                  Giới tính
                </label>
                <span>{isMale ? "Nam" : "Nữ"}</span>
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div className="info-section">
            <h3 className="section-title">
              <FaGraduationCap className="section-icon" />
              Thông tin khóa học
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Khóa học</label>
                <span>{courseName || "Chưa cập nhật"}</span>
              </div>
              <div className="info-item">
                <label>Ngày tham gia</label>
                <span>{formatDateTime(joinedAt)}</span>
              </div>
            </div>
          </div>

          {/* Progress Information */}
          {progress && (
            <div className="info-section">
              <h3 className="section-title">
                <FaGraduationCap className="section-icon" />
                Tiến độ học tập
              </h3>
              <div className="progress-container">
                <div className="progress-stats">
                  <div className="progress-stat-item">
                    <span className="progress-label">Bài học đã hoàn thành</span>
                    <span className="progress-value">
                      {completedLessons} / {totalLessons}
                    </span>
                  </div>
                  <div className="progress-stat-item">
                    <span className="progress-label">Tỷ lệ hoàn thành</span>
                    <span className="progress-value">{progressPercentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
                {isCompleted && completedAt && (
                  <div className="completion-info">
                    <FaCheckCircle className="completion-icon" />
                    <span>Hoàn thành vào: {formatDateTime(completedAt)}</span>
                  </div>
                )}
                {lastUpdated && (
                  <div className="last-updated">
                    Cập nhật lần cuối: {formatDateTime(lastUpdated)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="close-btn" onClick={onClose}>
          Đóng
        </button>
      </Modal.Footer>
    </Modal>
  );
}

