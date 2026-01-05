import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { FaDownload } from "react-icons/fa";
import { essaySubmissionService } from "../../../../Services/essaySubmissionService";
import SuccessModal from "../../../Common/SuccessModal/SuccessModal";
import "./EssaySubmissionDetailModal.css";

export default function EssaySubmissionDetailModal({ show, onClose, submission, onGradeSuccess, isAdmin = false }) {
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [grading, setGrading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (submission) {
      // Score: TeacherScore takes priority over AiScore
      const currentScore = submission.teacherScore !== undefined ? submission.teacherScore : 
                          (submission.TeacherScore !== undefined ? submission.TeacherScore :
                          (submission.aiScore !== undefined ? submission.aiScore :
                          (submission.AiScore !== undefined ? submission.AiScore :
                          (submission.score !== undefined ? submission.score :
                          (submission.Score !== undefined ? submission.Score : "")))));
      const currentFeedback = submission.teacherFeedback || submission.TeacherFeedback || 
                              (submission.aiFeedback || submission.AiFeedback || 
                              (submission.feedback || submission.Feedback || ""));
      setScore(currentScore !== null && currentScore !== undefined ? currentScore.toString() : "");
      setFeedback(currentFeedback);
    }
  }, [submission]);


  const handleSubmitGrade = async () => {
    if (!submission) return;
    
    // Validate score
    if (!score || isNaN(parseFloat(score))) {
      setError("Vui lòng nhập điểm hợp lệ");
      return;
    }

    try {
      setGrading(true);
      setError("");
      const submissionId = submission.submissionId || submission.SubmissionId;
      const gradeData = {
        score: parseFloat(score),
        // Send empty string when feedback is blank so backend that doesn't accept null still works
        feedback: (feedback?.trim() ?? ""),
      };

      const hasGrade = submission.teacherScore !== null && submission.teacherScore !== undefined;
      
      let response;
      if (isAdmin) {
        response = await essaySubmissionService.gradeAdminManually(submissionId, gradeData);
      } else {
        response = hasGrade
          ? await essaySubmissionService.updateGrade(submissionId, gradeData)
          : await essaySubmissionService.gradeManually(submissionId, gradeData);
      }

      if (response.data?.success) {
        setShowSuccessModal(true);
        if (onGradeSuccess) onGradeSuccess();
      } else {
        setError(response.data?.message || "Chấm bài thất bại");
      }
    } catch (err) {
      console.error("Error grading:", err);
      setError(err.response?.data?.message || "Có lỗi xảy ra khi chấm bài");
    } finally {
      setGrading(false);
    }
  };

  const handleDownload = async () => {
    if (!submission) return;
    try {
      const submissionId = submission.submissionId || submission.SubmissionId;
      const response = isAdmin
        ? await essaySubmissionService.downloadAdminSubmissionFile(submissionId)
        : await essaySubmissionService.downloadSubmissionFile(submissionId);
      
      // Get filename from Content-Disposition header or use attachmentType
      let fileName = `submission-${submissionId}`;
      const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // If no filename from header, try to get from attachmentType
      if (fileName === `submission-${submissionId}`) {
        const attachmentType = submission.attachmentType || submission.AttachmentType;
        if (attachmentType) {
          // Map MIME type to extension
          const mimeToExt = {
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/docx': 'docx',
            'text/plain': 'txt',
            'application/docm': 'docm',
            'application/dotx': 'dotx',
            'application/dotm': 'dotm'
          };
          
          // Try to get extension from attachmentType
          let extension = 'pdf'; // default
          if (attachmentType.includes('word') || attachmentType.includes('docx')) {
            extension = 'docx';
          } else if (attachmentType.includes('doc') && !attachmentType.includes('docx')) {
            extension = 'doc';
          } else if (attachmentType.includes('pdf')) {
            extension = 'pdf';
          } else if (attachmentType.includes('txt') || attachmentType.includes('text/plain')) {
            extension = 'txt';
          } else {
            // Try to find in mimeToExt
            for (const [mime, ext] of Object.entries(mimeToExt)) {
              if (attachmentType.includes(mime.split('/')[1])) {
                extension = ext;
                break;
              }
            }
          }
          
          fileName = `submission-${submissionId}.${extension}`;
        }
      }
      
      // Get content type from response
      const contentType = response.headers['content-type'] || response.headers['Content-Type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading file:", err);
      alert("Không thể tải file");
    }
  };

  if (!submission) return null;

  const userName = submission.userName || submission.UserName || "N/A";
  const userEmail = submission.userEmail || submission.UserEmail || "N/A";
  const textContent = submission.textContent || submission.TextContent || "";
  const attachmentUrl = submission.attachmentUrl || submission.AttachmentUrl;
  const maxScore = submission.maxScore !== undefined ? submission.maxScore : (submission.MaxScore !== undefined ? submission.MaxScore : 100);
  const teacherScore = submission.teacherScore !== undefined ? submission.teacherScore : (submission.TeacherScore !== undefined ? submission.TeacherScore : null);

  return (
    <>
      <Modal 
        show={show} 
        onHide={onClose} 
        centered 
        className="essay-submission-detail-modal" 
        dialogClassName="essay-submission-detail-modal-dialog"
        style={{ zIndex: 1050 }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết bài nộp</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <div className="mb-3">
            <strong>Học sinh:</strong> {userName} ({userEmail})
          </div>

          {textContent && (
            <div className="mb-3">
              <strong>Nội dung bài làm:</strong>
              <div className="submission-content p-3 mt-2 border rounded">
                {textContent}
              </div>
            </div>
          )}

          {attachmentUrl && (
            <div className="mb-3">
              <Button variant="outline-primary" size="sm" onClick={handleDownload}>
                <FaDownload className="me-2" />
                Tải file đính kèm
              </Button>
            </div>
          )}

          {teacherScore !== null && (
            <div className="mb-3 p-3 bg-info bg-opacity-10 rounded">
              <div className="d-flex align-items-center gap-2 mb-2">
                <strong>Điểm giáo viên:</strong> {teacherScore} / {maxScore}
              </div>
            </div>
          )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Điểm số (tối đa: {maxScore})</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max={maxScore}
                step="0.1"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Nhập điểm"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Nhận xét
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Nhập nhận xét cho học sinh (tùy chọn)"
              />
              <Form.Text className="text-muted">Không bắt buộc</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={handleSubmitGrade}
            disabled={grading}
          >
            {grading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang lưu...
              </>
            ) : (
              "Lưu điểm"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
        title="Thành công"
        message="Chấm bài thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />
    </>
  );
}

