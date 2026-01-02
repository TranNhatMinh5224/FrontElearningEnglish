import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { assessmentService } from "../../../Services/assessmentService";
import DateTimePicker from "../DateTimePicker/DateTimePicker";
import "./CreateAssessmentModal.css";

export default function CreateAssessmentModal({ 
  show, 
  onClose, 
  onSuccess, 
  moduleId, 
  assessmentData = null, 
  isUpdateMode = false 
}) {
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [openAt, setOpenAt] = useState(null); // Date object
  const [dueAt, setDueAt] = useState(null); // Date object
  const [timeLimit, setTimeLimit] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pre-fill form when in update mode
  useEffect(() => {
    if (show && isUpdateMode && assessmentData) {
      setLoading(true);
      const assessmentTitle = assessmentData.title || assessmentData.Title || "";
      const assessmentDescription = assessmentData.description || assessmentData.Description || "";
      const assessmentTimeLimit = assessmentData.timeLimit || assessmentData.TimeLimit || "";
      const assessmentIsPublished = assessmentData.isPublished !== undefined 
        ? assessmentData.isPublished 
        : assessmentData.IsPublished !== undefined 
          ? assessmentData.IsPublished 
          : false;
      
      // Parse dates
      let parsedOpenAt = null;
      let parsedDueAt = null;
      
      if (assessmentData.openAt || assessmentData.OpenAt) {
        const openAtValue = assessmentData.openAt || assessmentData.OpenAt;
        parsedOpenAt = new Date(openAtValue);
        if (isNaN(parsedOpenAt.getTime())) parsedOpenAt = null;
      }
      
      if (assessmentData.dueAt || assessmentData.DueAt) {
        const dueAtValue = assessmentData.dueAt || assessmentData.DueAt;
        parsedDueAt = new Date(dueAtValue);
        if (isNaN(parsedDueAt.getTime())) parsedDueAt = null;
      }
      
      setTitle(assessmentTitle);
      setDescription(assessmentDescription || "");
      setOpenAt(parsedOpenAt);
      setDueAt(parsedDueAt);
      setTimeLimit(assessmentTimeLimit || "");
      setIsPublished(assessmentIsPublished);
      setLoading(false);
    }
  }, [show, isUpdateMode, assessmentData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setTitle("");
      setDescription("");
      setOpenAt(null);
      setDueAt(null);
      setTimeLimit("");
      setIsPublished(false);
      setErrors({});
    }
  }, [show]);

  // Format time limit to HH:MM:SS
  const formatTimeLimit = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");
    
    // Format as HH:MM:SS
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4)}`;
    } else {
      return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`;
    }
  };

  const handleTimeLimitChange = (e) => {
    const value = e.target.value;
    const formatted = formatTimeLimit(value);
    setTimeLimit(formatted);
    setErrors({ ...errors, timeLimit: null });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    } else if (title.trim().length > 200) {
      newErrors.title = "Tiêu đề không được vượt quá 200 ký tự";
    }

    if (description && description.length > 1000) {
      newErrors.description = "Mô tả không được vượt quá 1000 ký tự";
    }

    if (!openAt) {
      newErrors.openAt = "Thời gian mở là bắt buộc";
    }

    if (!dueAt) {
      newErrors.dueAt = "Thời gian đóng là bắt buộc";
    }

    // Validate OpenAt < DueAt
    if (openAt && dueAt) {
      if (openAt >= dueAt) {
        newErrors.dueAt = "Thời gian đóng phải sau thời gian mở";
      }
    }

    if (!timeLimit) {
      newErrors.timeLimit = "Thời gian giới hạn là bắt buộc";
    } else {
      // Validate time limit format (HH:MM:SS)
      const timeLimitRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
      if (!timeLimitRegex.test(timeLimit)) {
        newErrors.timeLimit = "Thời gian giới hạn phải có định dạng HH:MM:SS (ví dụ: 01:30:00)";
      } else {
        // Validate that time limit is greater than 0
        const [hours, minutes, seconds] = timeLimit.split(":").map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        if (totalSeconds <= 0) {
          newErrors.timeLimit = "Thời gian giới hạn phải lớn hơn 0";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Format dates to ISO string
      const openAtDate = openAt ? openAt.toISOString() : null;
      const dueAtDate = dueAt ? dueAt.toISOString() : null;

      const submitData = {
        moduleId: parseInt(moduleId),
        title: title.trim(),
        description: description.trim() || null,
        openAt: openAtDate,
        dueAt: dueAtDate,
        timeLimit: timeLimit.trim(),
        isPublished: isPublished,
      };

      let response;
      if (isUpdateMode && assessmentData) {
        const assessmentId = assessmentData.assessmentId || assessmentData.AssessmentId;
        if (!assessmentId) {
          throw new Error("Không tìm thấy ID của Assessment");
        }
        response = await assessmentService.updateAssessment(assessmentId, submitData);
      } else {
        response = await assessmentService.createAssessment(submitData);
      }

      if (response.data?.success) {
        // Success
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.data?.message || (isUpdateMode ? "Cập nhật Assessment thất bại" : "Tạo Assessment thất bại"));
      }
    } catch (error) {
      console.error(`Error ${isUpdateMode ? "updating" : "creating"} assessment:`, error);
      const errorMessage = error.response?.data?.message || error.message || (isUpdateMode ? "Có lỗi xảy ra khi cập nhật Assessment" : "Có lỗi xảy ra khi tạo Assessment");
      setErrors({ ...errors, submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  // Get current date/time for min values
  const now = new Date();
  now.setSeconds(0, 0); // Reset seconds and milliseconds

  const isFormValid = title.trim() && openAt && dueAt && timeLimit;

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      className="create-assessment-modal" 
      dialogClassName="create-assessment-modal-dialog"
      style={{ zIndex: 1050 }}
    >
      <Modal.Header closeButton>
        <Modal.Title>{isUpdateMode ? "Cập nhật Assessment" : "Thêm Assessment"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          {/* Tiêu đề */}
          <div className="form-group">
            <label className="form-label required">Tiêu đề</label>
            <input
              type="text"
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors({ ...errors, title: null });
              }}
              placeholder="Nhập tiêu đề Assessment"
              maxLength={200}
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            <div className="form-hint">*Bắt buộc (tối đa 200 ký tự)</div>
          </div>

          {/* Mô tả */}
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({ ...errors, description: null });
              }}
              placeholder="Nhập mô tả Assessment (không bắt buộc)"
              rows={3}
              maxLength={1000}
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            <div className="form-hint">Không bắt buộc (tối đa 1000 ký tự)</div>
          </div>

          {/* Thời gian mở */}
          <div className="form-group">
            <DateTimePicker
              value={openAt}
              onChange={(date) => {
                setOpenAt(date);
                setErrors({ ...errors, openAt: null, dueAt: null });
              }}
              min={now}
              max={dueAt || null}
              placeholder="dd/mm/yyyy HH:mm"
              hasError={!!errors.openAt}
              label="Thời gian mở"
              required={true}
            />
            {errors.openAt && <div className="invalid-feedback" style={{ marginTop: "4px" }}>{errors.openAt}</div>}
            <div className="form-hint">*Bắt buộc</div>
          </div>

          {/* Thời gian đóng */}
          <div className="form-group">
            <DateTimePicker
              value={dueAt}
              onChange={(date) => {
                setDueAt(date);
                setErrors({ ...errors, dueAt: null });
              }}
              min={openAt || now}
              placeholder="dd/mm/yyyy HH:mm"
              hasError={!!errors.dueAt}
              label="Thời gian đóng"
              required={true}
            />
            {errors.dueAt && <div className="invalid-feedback" style={{ marginTop: "4px" }}>{errors.dueAt}</div>}
            <div className="form-hint">*Bắt buộc (phải sau thời gian mở)</div>
          </div>

          {/* Thời gian giới hạn */}
          <div className="form-group">
            <label className="form-label required">Thời gian giới hạn</label>
            <input
              type="text"
              className={`form-control ${errors.timeLimit ? "is-invalid" : ""}`}
              value={timeLimit}
              onChange={handleTimeLimitChange}
              placeholder="HH:MM:SS (ví dụ: 01:30:00 cho 1 giờ 30 phút)"
              maxLength={8}
            />
            {errors.timeLimit && <div className="invalid-feedback">{errors.timeLimit}</div>}
            <div className="form-hint">*Bắt buộc (định dạng HH:MM:SS)</div>
          </div>

          {/* Trạng thái xuất bản */}
          <div className="form-group">
            <label className="form-label required">Trạng thái xuất bản</label>
            <div 
              className={`publish-status-container ${isPublished ? "published" : ""}`}
              onClick={() => setIsPublished(!isPublished)}
            >
              <div 
                className={`publish-status-toggle ${isPublished ? "published" : ""}`}
              >
                <div className="publish-status-toggle-slider"></div>
              </div>
              <div className="publish-status-content">
                <div className="publish-status-label">
                  {isPublished ? "Đã xuất bản" : "Chưa xuất bản"}
                </div>
                <div className="publish-status-description">
                  {isPublished 
                    ? "Assessment sẽ hiển thị cho học sinh và có thể tham gia làm bài" 
                    : "Assessment sẽ được ẩn và học sinh không thể thấy hoặc làm bài"}
                </div>
              </div>
            </div>
            <div className="form-hint">*Bắt buộc</div>
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className="alert alert-danger mt-3">{errors.submit}</div>
          )}
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Huỷ
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!isFormValid || submitting || loading}
        >
          {submitting ? (isUpdateMode ? "Đang cập nhật..." : "Đang tạo...") : (isUpdateMode ? "Cập nhật" : "Tạo")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

