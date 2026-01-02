import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { lectureService } from "../../../Services/lectureService";
import "./CreateLectureModal.css";

const LECTURE_TYPES = [
  { value: 1, label: "Content" },
  { value: 2, label: "Video" },
  { value: 3, label: "Audio" },
  { value: 4, label: "Document" },
  { value: 5, label: "Interactive" },
];

export default function CreateLectureModal({ 
  show, 
  onClose, 
  onSuccess, 
  moduleId 
}) {
  const [title, setTitle] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [lectureType, setLectureType] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!show) {
      setTitle("");
      setMarkdownContent("");
      setLectureType(1);
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
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const lectureData = {
        moduleId: parseInt(moduleId),
        title: title.trim(),
        markdownContent: markdownContent.trim() || null,
        type: lectureType,
        orderIndex: 0,
      };

      const response = await lectureService.createLecture(lectureData);
      
      if (response.data?.success) {
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.data?.message || "Tạo lecture thất bại");
      }
    } catch (error) {
      console.error("Error creating lecture:", error);
      setErrors({ submit: error.response?.data?.message || error.message || "Có lỗi xảy ra khi tạo lecture" });
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
      className="create-lecture-modal"
      dialogClassName="create-lecture-modal-dialog"
    >
      <Modal.Header closeButton>
        <Modal.Title>Tạo Lecture</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
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
              placeholder="Nhập tiêu đề lecture"
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            <div className="form-hint">*Bắt buộc</div>
          </div>

          <div className="form-group">
            <label className="form-label">Loại lecture</label>
            <select
              className="form-control"
              value={lectureType}
              onChange={(e) => setLectureType(parseInt(e.target.value))}
            >
              {LECTURE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nội dung (Markdown)</label>
            <textarea
              className="form-control"
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              placeholder="Nhập nội dung lecture (Markdown)"
              rows={10}
            />
            <div className="form-hint">Không bắt buộc</div>
          </div>

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
          disabled={!isFormValid || submitting}
        >
          {submitting ? "Đang tạo..." : "Tạo"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

