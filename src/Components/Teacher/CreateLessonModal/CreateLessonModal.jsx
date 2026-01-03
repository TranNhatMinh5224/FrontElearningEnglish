import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { fileService } from "../../../Services/fileService";
import { teacherService } from "../../../Services/teacherService";
import { adminService } from "../../../Services/adminService";
import { useAuth } from "../../../Context/AuthContext";
import { FaFileUpload, FaTimes } from "react-icons/fa";
import "./CreateLessonModal.css";

const LESSON_IMAGE_BUCKET = "lessons"; // Bucket name for lesson images

export default function CreateLessonModal({ show, onClose, onSuccess, courseId, lessonData, isUpdateMode = false, isAdmin = false }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Image upload state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageTempKey, setImageTempKey] = useState(null);
  const [imageType, setImageType] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Submit state
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill form when in update mode
  useEffect(() => {
    if (show && isUpdateMode && lessonData) {
      const lessonTitle = lessonData.title || lessonData.Title || "";
      const lessonDescription = lessonData.description || lessonData.Description || "";
      const lessonImageUrl = lessonData.imageUrl || lessonData.ImageUrl || null;
      
      setTitle(lessonTitle);
      setDescription(lessonDescription || "");
      setExistingImageUrl(lessonImageUrl);
      
      // Set preview to existing image if available
      if (lessonImageUrl) {
        setImagePreview(lessonImageUrl);
      } else {
        setImagePreview(null);
      }
      
      // Reset new upload fields
      setSelectedImage(null);
      setImageTempKey(null);
      setImageType(null);
    }
  }, [show, isUpdateMode, lessonData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setTitle("");
      setDescription("");
      setSelectedImage(null);
      setImagePreview(null);
      setImageTempKey(null);
      setImageType(null);
      setExistingImageUrl(null);
      setErrors({});
    }
  }, [show]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors({ ...errors, image: "Vui lòng chọn file ảnh" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: "Kích thước ảnh không được vượt quá 5MB" });
      return;
    }

    setUploadingImage(true);
    setErrors({ ...errors, image: null });

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setSelectedImage(file);

      // Upload file to temp storage
      const uploadResponse = await fileService.uploadTempFile(
        file,
        LESSON_IMAGE_BUCKET,
        "temp"
      );

      console.log("Upload response:", uploadResponse.data);

      if (uploadResponse.data?.success && uploadResponse.data?.data) {
        const resultData = uploadResponse.data.data;
        const tempKey = resultData.TempKey || resultData.tempKey;
        const imageTypeValue = resultData.ImageType || resultData.imageType || file.type;

        console.log("TempKey:", tempKey, "ImageType:", imageTypeValue);

        if (!tempKey) {
          throw new Error("Không nhận được TempKey từ server");
        }

        setImageTempKey(tempKey);
        setImageType(imageTypeValue);
      } else {
        const errorMsg = uploadResponse.data?.message || "Upload ảnh thất bại";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrors({ ...errors, image: error.response?.data?.message || "Có lỗi xảy ra khi upload ảnh" });
      setSelectedImage(null);
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageTempKey(null);
    setImageType(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    }

    if (!description.trim()) {
      newErrors.description = "Mô tả là bắt buộc";
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
        title: title.trim(),
        description: description.trim(),
      };

      // Chỉ thêm imageTempKey và imageType nếu có upload ảnh mới
      if (imageTempKey && imageType) {
        submitData.imageTempKey = imageTempKey;
        submitData.imageType = imageType;
      }

      let response;
      if (isUpdateMode && lessonData) {
        const lessonId = lessonData.lessonId || lessonData.LessonId;
        if (!lessonId) {
          throw new Error("Không tìm thấy ID bài học");
        }
        response = isAdmin 
          ? await adminService.updateLesson(lessonId, submitData)
          : await teacherService.updateLesson(lessonId, submitData);
      } else {
        submitData.courseId = parseInt(courseId);
        response = isAdmin
          ? await adminService.createLesson(submitData)
          : await teacherService.createLesson(submitData);
      }

      if (response.data?.success) {
        // Success
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.data?.message || (isUpdateMode ? "Cập nhật bài học thất bại" : "Tạo bài học thất bại"));
      }
    } catch (error) {
      console.error(`Error ${isUpdateMode ? "updating" : "creating"} lesson:`, error);
      const errorMessage = error.response?.data?.message || error.message || (isUpdateMode ? "Có lỗi xảy ra khi cập nhật bài học" : "Có lỗi xảy ra khi tạo bài học");
      setErrors({ ...errors, submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = title.trim() && description.trim();

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      className="create-lesson-modal" 
      dialogClassName="create-lesson-modal-dialog"
      style={{ zIndex: 1050 }}
    >
      <Modal.Header closeButton>
        <Modal.Title>{isUpdateMode ? "Cập nhật bài học" : "Thêm bài học"}</Modal.Title>
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
              placeholder="Nhập tiêu đề bài học"
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            <div className="form-hint">*Bắt buộc</div>
          </div>

          {/* Mô tả */}
          <div className="form-group">
            <label className="form-label required">Mô tả</label>
            <textarea
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({ ...errors, description: null });
              }}
              placeholder="Nhập mô tả bài học"
              rows={4}
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            <div className="form-hint">*Bắt buộc</div>
          </div>

          {/* Ảnh bài học */}
          <div className="form-group">
            <label className="form-label">Ảnh bài học</label>
            {imagePreview ? (
              <div className="image-preview-wrapper">
                <img src={imagePreview} alt="Ảnh xem trước bài học" className="image-preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={handleRemoveImage}
                  disabled={uploadingImage}
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div
                className={`image-upload-area ${uploadingImage ? "uploading" : ""} ${errors.image ? "error" : ""}`}
                onClick={handleImageClick}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <FaFileUpload className="upload-icon" />
                <span className="upload-text">
                  {uploadingImage ? "Đang upload..." : isUpdateMode ? "Thay đổi ảnh" : "Chọn ảnh"}
                </span>
              </div>
            )}
            {errors.image && <div className="error-message">{errors.image}</div>}
            <div className="form-hint">Không bắt buộc{isUpdateMode && existingImageUrl && !imageTempKey ? " (giữ nguyên ảnh hiện tại nếu không chọn ảnh mới)" : ""}</div>
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
          disabled={!isFormValid || submitting || uploadingImage}
        >
          {submitting ? (isUpdateMode ? "Đang cập nhật..." : "Đang tạo...") : (isUpdateMode ? "Cập nhật" : "Tạo")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

