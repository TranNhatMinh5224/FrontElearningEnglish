import React from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { FaCheckCircle, FaStar, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import "./StudentEssayResultModal.css";

export default function StudentEssayResultModal({ show, onClose, submission }) {
  if (!submission) return null;

  const score = submission.score !== undefined ? submission.score : (submission.Score !== undefined ? submission.Score : null);
  const maxScore = submission.maxScore !== undefined ? submission.maxScore : (submission.MaxScore !== undefined ? submission.MaxScore : 10);
  const feedback = submission.feedback || submission.Feedback || submission.teacherFeedback || submission.TeacherFeedback || "";
  const gradedAt = submission.gradedAt || submission.GradedAt || submission.teacherGradedAt || submission.TeacherGradedAt;
  const status = submission.status || submission.Status || "";
  const submittedAt = submission.submittedAt || submission.SubmittedAt;
  const essayTitle = submission.essayTitle || submission.EssayTitle || "Bài Essay";

  // AI grading info (if available)
  const aiScore = submission.aiScore !== undefined ? submission.aiScore : (submission.AiScore !== undefined ? submission.AiScore : null);
  const aiFeedback = submission.aiFeedback || submission.AiFeedback || "";
  const aiGradedAt = submission.aiGradedAt || submission.AiGradedAt;

  const hasTeacherGrade = score !== null && score !== undefined;
  const hasAiGrade = aiScore !== null && aiScore !== undefined;

  const getScoreColor = (score, max) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return "#10b981"; // green
    if (percentage >= 60) return "#f59e0b"; // orange
    return "#ef4444"; // red
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      size="lg"
      className="student-essay-result-modal" 
      dialogClassName="student-essay-result-modal-dialog"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCheckCircle className="me-2 text-success" />
          Kết quả bài làm
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Teacher Grade (Main Score) */}
        {hasTeacherGrade && (
          <div className="score-section mb-4 p-4 rounded" style={{ backgroundColor: "#f0fdf4" }}>
            <div className="text-center">
              <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                <FaStar className="text-warning" size={24} />
                <h3 className="mb-0 fw-bold">Điểm của giáo viên</h3>
              </div>
              <div className="score-display mb-3">
                <span 
                  className="score-number" 
                  style={{ 
                    fontSize: "72px", 
                    fontWeight: "bold",
                    color: getScoreColor(score, maxScore)
                  }}
                >
                  {score}
                </span>
                <span className="score-max" style={{ fontSize: "32px", color: "#6b7280" }}>
                  /{maxScore}
                </span>
              </div>
              <div className="score-percentage">
                <span className="badge bg-success" style={{ fontSize: "16px", padding: "8px 16px" }}>
                  {((score / maxScore) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Teacher Feedback */}
            {feedback && (
              <div className="mt-4">
                <h6 className="fw-bold mb-3">
                  <FaCheckCircle className="me-2 text-success" />
                  Nhận xét của giáo viên:
                </h6>
                <div className="feedback-box p-3 rounded" style={{ backgroundColor: "white", border: "1px solid #e5e7eb" }}>
                  <p className="mb-0" style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}>
                    {feedback}
                  </p>
                </div>
              </div>
            )}

            {/* Graded Date */}
            {gradedAt && (
              <div className="mt-3 text-center text-muted">
                <small>
                  <FaCalendarAlt className="me-2" />
                  Chấm điểm lúc: {formatDate(gradedAt)}
                </small>
              </div>
            )}
          </div>
        )}

        {/* AI Grade (Optional) */}
        {hasAiGrade && (
          <div className="ai-score-section mb-4 p-4 rounded" style={{ backgroundColor: "#f0f9ff" }}>
            <h6 className="fw-bold mb-3">
              <FaStar className="me-2 text-info" />
              Điểm AI (Tham khảo)
            </h6>
            <div className="d-flex align-items-center gap-3">
              <div>
                <span className="fw-bold" style={{ fontSize: "24px", color: "#3b82f6" }}>
                  {aiScore}
                </span>
                <span style={{ fontSize: "16px", color: "#6b7280" }}>/{maxScore}</span>
              </div>
              <div className="flex-grow-1">
                <div className="progress" style={{ height: "8px" }}>
                  <div 
                    className="progress-bar bg-info" 
                    style={{ width: `${(aiScore / maxScore) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            {aiFeedback && (
              <div className="mt-3">
                <small className="text-muted" style={{ whiteSpace: "pre-wrap" }}>
                  {aiFeedback}
                </small>
              </div>
            )}
            {aiGradedAt && (
              <div className="mt-2">
                <small className="text-muted">
                  <FaCalendarAlt className="me-1" />
                  {formatDate(aiGradedAt)}
                </small>
              </div>
            )}
          </div>
        )}

        {/* Submission Info */}
        <div className="submission-info-section p-3 rounded" style={{ backgroundColor: "#f9fafb" }}>
          <div className="row">
            <div className="col-md-6">
              <small className="text-muted d-block mb-1">Trạng thái:</small>
              <span className="badge bg-success">{status}</span>
            </div>
            {submittedAt && (
              <div className="col-md-6">
                <small className="text-muted d-block mb-1">Ngày nộp bài:</small>
                <span>{formatDate(submittedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Motivational Message */}
        {hasTeacherGrade && score >= maxScore * 0.8 && (
          <Alert variant="success" className="mt-4 mb-0">
            <div className="text-center">
              <strong>🎉 Xuất sắc!</strong> Bạn đã hoàn thành bài essay rất tốt!
            </div>
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose} size="lg">
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
