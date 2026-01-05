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
  isUpdateMode = false,
  isAdmin = false 
}) {
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [openAt, setOpenAt] = useState(null); // Date object
  const [dueAt, setDueAt] = useState(null); // Date object
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
      setIsPublished(false);
      setErrors({});
    }
  }, [show]);

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
        timeLimit: "01:00:00", // Default 1 hour
        isPublished: isPublished,
      };

      let response;
      if (isUpdateMode && assessmentData) {
        const assessmentId = assessmentData.assessmentId || assessmentData.AssessmentId;
        if (!assessmentId) {
          throw new Error("Không tìm thấy ID của Assessment");
        }
        response = isAdmin
          ? await assessmentService.updateAdminAssessment(assessmentId, submitData)
          : await assessmentService.updateAssessment(assessmentId, submitData);
      } else {
        response = isAdmin
          ? await assessmentService.createAdminAssessment(submitData)
          : await assessmentService.createAssessment(submitData);
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

  const isFormValid = title.trim() && openAt && dueAt;

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
              placeholder="dd/mm/yyyy"
              hasError={!!errors.openAt}
              label="Thời gian mở"
              required={true}
              dateOnly={true}
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
              placeholder="dd/mm/yyyy"
              hasError={!!errors.dueAt}
              label="Thời gian đóng"
              required={true}
              dateOnly={true}
            />
            {errors.dueAt && <div className="invalid-feedback" style={{ marginTop: "4px" }}>{errors.dueAt}</div>}
            <div className="form-hint">*Bắt buộc (phải sau thời gian mở)</div>
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

