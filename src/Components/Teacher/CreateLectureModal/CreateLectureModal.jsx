import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { lectureService } from "../../../Services/lectureService";
import "./CreateLectureModal.css";

const LECTURE_TYPES = [
  { value: 1, label: "Content" },
  { value: 2, label: "Video" },
  { value: 3, label: "Audio" },
  { value: 4, label: "Document" },
  { value: 5, label: "Interactive" },
];

export default function CreateLectureModal({ show, onClose, onSuccess, moduleId, lectureToUpdate, isAdmin = false }) {
  const [title, setTitle] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [lectureType, setLectureType] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      if (lectureToUpdate) {
        setTitle(lectureToUpdate.title || lectureToUpdate.Title || "");
        setMarkdownContent(lectureToUpdate.markdownContent || lectureToUpdate.MarkdownContent || "");
        setLectureType(lectureToUpdate.type || lectureToUpdate.Type || 1);
      } else {
        resetForm();
      }
      setErrors({});
    }
  }, [show, lectureToUpdate]);

  const resetForm = () => {
    setTitle("");
    setMarkdownContent("");
    setLectureType(1);
  };

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
        orderIndex: lectureToUpdate ? (lectureToUpdate.orderIndex || 0) : 0,
      };

      let response;
      if (lectureToUpdate) {
        const lectureId = lectureToUpdate.lectureId || lectureToUpdate.LectureId;
        response = isAdmin
          ? await lectureService.updateAdminLecture(lectureId, lectureData)
          : await lectureService.updateLecture(lectureId, lectureData);
      } else {
        response = isAdmin
          ? await lectureService.createAdminLecture(lectureData)
          : await lectureService.createLecture(lectureData);
      }

      if (response.data?.success) {
        onSuccess(response.data.data);
        onClose();
      } else {
        throw new Error(response.data?.message || "Thao tác thất bại");
      }
    } catch (error) {
      console.error("Error saving lecture:", error);
      setErrors({ submit: error.response?.data?.message || error.message || "Có lỗi xảy ra" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static" centered dialogClassName="custom-width-modal-1080">
      <Modal.Header closeButton>
        <Modal.Title>{lectureToUpdate ? "Cập nhật Lecture" : "Tạo Lecture mới"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label required">Tiêu đề</label>
            <input
              type="text"
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề lecture"
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          <div className="mb-3">
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

          <div className="mb-3">
            <label className="form-label">Nội dung (Markdown)</label>
            <div className="d-flex gap-3" style={{ height: "400px" }}>
              <div className="w-50 h-100">
                <textarea
                  className={`form-control h-100 ${errors.markdownContent ? "is-invalid" : ""}`}
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  placeholder="Nhập nội dung Markdown..."
                  style={{ resize: "none" }}
                />
              </div>
              <div className="w-50 h-100 border rounded p-3 overflow-auto bg-light">
                {markdownContent.trim() ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdownContent}
                  </ReactMarkdown>
                ) : (
                  <span className="text-muted">Xem trước nội dung...</span>
                )}
              </div>
            </div>
          </div>

          {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>Hủy</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Đang lưu..." : (lectureToUpdate ? "Lưu thay đổi" : "Tạo mới")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}