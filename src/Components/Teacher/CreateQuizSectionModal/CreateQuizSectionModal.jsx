import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { quizService } from "../../../Services/quizService";
import "./CreateQuizSectionModal.css";

export default function CreateQuizSectionModal({ show, onClose, onSuccess, quizId, sectionToUpdate = null, isAdmin = false }) {
  const isUpdateMode = !!sectionToUpdate;
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({});

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [loadingSection, setLoadingSection] = useState(false);

  // Load section data when in update mode
  useEffect(() => {
    if (show && isUpdateMode && sectionToUpdate) {
      loadSectionData();
    }
  }, [show, isUpdateMode, sectionToUpdate]);

  const loadSectionData = async () => {
    if (!sectionToUpdate) return;
    
    setLoadingSection(true);
    try {
      const sectionId = sectionToUpdate.quizSectionId || sectionToUpdate.QuizSectionId;
      const response = await quizService.getQuizSectionById(sectionId);
      
      if (response.data?.success && response.data?.data) {
        const section = response.data.data;
        setTitle(section.title || section.Title || "");
        setDescription(section.description || section.Description || "");
      }
    } catch (error) {
      console.error("Error loading section data:", error);
      setErrors({ ...errors, submit: "Không thể tải dữ liệu section" });
    } finally {
      setLoadingSection(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setTitle("");
      setDescription("");
      setErrors({});
    }
  }, [show]);

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
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
      const submitData = {
        quizId: parseInt(quizId),
        title: title.trim(),
        description: description.trim() || null,
      };

      let response;
      if (isUpdateMode && sectionToUpdate) {
        const sectionId = sectionToUpdate.quizSectionId || sectionToUpdate.QuizSectionId;
        const updateData = {
          title: submitData.title,
          description: submitData.description,
        };
        response = isAdmin
          ? await quizService.updateAdminQuizSection(sectionId, updateData)
          : await quizService.updateQuizSection(sectionId, updateData);
      } else {
        response = isAdmin
          ? await quizService.createAdminQuizSection(submitData)
          : await quizService.createQuizSection(submitData);
      }

      if (response.data?.success) {
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.data?.message || (isUpdateMode ? "Cập nhật Section thất bại" : "Tạo Section thất bại"));
      }
    } catch (error) {
      console.error(`Error ${isUpdateMode ? "updating" : "creating"} section:`, error);
      const errorMessage = error.response?.data?.message || error.message || (isUpdateMode ? "Có lỗi xảy ra khi cập nhật Section" : "Có lỗi xảy ra khi tạo Section");
      setErrors({ ...errors, submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = title.trim();

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      className="create-quiz-section-modal" 
      dialogClassName="create-quiz-section-modal-dialog"
      style={{ zIndex: 1050 }}
    >
      <Modal.Header closeButton>
        <Modal.Title>{isUpdateMode ? "Cập nhật Section" : "Tạo Section mới"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loadingSection ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Tiêu đề */}
            <div className="mb-3">
              <label className="form-label required">Tiêu đề</label>
              <input
                type="text"
                className={`form-control ${errors.title ? "is-invalid" : ""}`}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors({ ...errors, title: null });
                }}
                placeholder="Nhập tiêu đề Section"
              />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              <div className="form-text">*Bắt buộc</div>
            </div>

            {/* Mô tả */}
            <div className="mb-3">
              <label className="form-label">Mô tả</label>
              <textarea
                className={`form-control ${errors.description ? "is-invalid" : ""}`}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors({ ...errors, description: null });
                }}
                placeholder="Nhập mô tả Section (không bắt buộc)"
                rows={3}
              />
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              <div className="form-text">Không bắt buộc</div>
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div className="alert alert-danger mt-3">{errors.submit}</div>
            )}
          </form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={submitting || loadingSection}>
          Huỷ
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!isFormValid || submitting || loadingSection}
        >
          {submitting ? (isUpdateMode ? "Đang cập nhật..." : "Đang tạo...") : (isUpdateMode ? "Cập nhật" : "Tạo")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

