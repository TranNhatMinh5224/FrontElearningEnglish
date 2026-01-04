import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { fileService } from "../../../../Services/fileService";
import { adminService } from "../../../../Services/adminService";
import { FaFileUpload, FaTimes } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./CourseFormModal.css";

const COURSE_IMAGE_BUCKET = "courses";

export default function CourseFormModal({ show, onClose, onSubmit, initialData }) {
  const fileInputRef = useRef(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [maxStudent, setMaxStudent] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [type, setType] = useState(1); // 1 = System, 2 = Teacher

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

  const isUpdateMode = !!initialData;

  // Pre-fill form when in update mode
  useEffect(() => {
    if (show && isUpdateMode && initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setPrice(initialData.price || 0);
      setMaxStudent(initialData.maxStudent || 0);
      setIsFeatured(initialData.isFeatured || false);
      setType(initialData.type || 1);
      
      const courseImageUrl = initialData.imageUrl || null;
      setExistingImageUrl(courseImageUrl);
      
      if (courseImageUrl) {
        setImagePreview(courseImageUrl);
      } else {
        setImagePreview(null);
      }
      
      setSelectedImage(null);
      setImageTempKey(null);
      setImageType(null);
    }
  }, [show, isUpdateMode, initialData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setTitle("");
      setDescription("");
      setPrice(0);
      setMaxStudent(0);
      setIsFeatured(false);
      setType(1);
      setSelectedImage(null);
      setImagePreview(null);
      setImageTempKey(null);
      setImageType(null);
      setExistingImageUrl(null);
      setErrors({});
      setSubmitting(false);
      setUploadingImage(false);
    }
  }, [show]);

  // Image handling
  const handleImageClick = () => {
    if (!uploadingImage && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors({ ...errors, image: "Vui lòng chọn file ảnh hợp lệ" });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: "Kích thước ảnh không được vượt quá 5MB" });
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    await uploadImage(file);
  };

  const uploadImage = async (file) => {
    setUploadingImage(true);
    setErrors({ ...errors, image: null });

    try {
      const uploadResponse = await fileService.uploadTempFile(
        file,
        COURSE_IMAGE_BUCKET,
        "temp"
      );

      console.log("Upload response:", uploadResponse.data);

      if (uploadResponse.data?.success && uploadResponse.data?.data) {
        const resultData = uploadResponse.data.data;
        // Backend trả về PascalCase: TempKey, ImageUrl, ImageType
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
      setImagePreview(existingImageUrl || null);
    } finally {
      setUploadingImage(false);
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

  // Validation
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
      let submitData;
      
      if (isUpdateMode && initialData) {
        submitData = {
          title: title.trim(),
          description: description.trim(),
          price: parseFloat(price) || 0,
          maxStudent: parseInt(maxStudent) || 0,
          isFeatured,
          type: parseInt(type)
        };

        if (imageTempKey && imageType) {
          submitData.imageTempKey = imageTempKey;
          submitData.imageType = imageType;
        }
        
        const courseId = initialData.courseId || initialData.CourseId;
        if (!courseId) {
          throw new Error("Không tìm thấy ID khóa học");
        }
        const response = await adminService.updateCourse(courseId, submitData);
        
        if (response.data?.success) {
          // Đóng modal trước
          onClose();
          // Gọi callback để parent hiện SuccessModal
          if (onSubmit) onSubmit(response.data.data);
        } else {
          throw new Error(response.data?.message || "Cập nhật thất bại");
        }
      } else {
        submitData = {
          title: title.trim(),
          description: description.trim(),
          price: parseFloat(price) || 0,
          maxStudent: parseInt(maxStudent) || 0,
          isFeatured,
          type: parseInt(type)
        };

        if (imageTempKey && imageType) {
          submitData.imageTempKey = imageTempKey;
          submitData.imageType = imageType;
        }

        const response = await adminService.createCourse(submitData);
        
        if (response.data?.success) {
          // Đóng modal trước
          onClose();
          // Gọi callback để parent hiện SuccessModal
          if (onSubmit) onSubmit(response.data.data);
        } else {
          throw new Error(response.data?.message || "Tạo khóa học thất bại");
        }
      }
    } catch (error) {
      console.error("Error submitting course:", error);
      setErrors({ ...errors, submit: error.message || "Có lỗi xảy ra. Vui lòng thử lại" });
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
      size="xl"
      backdrop="static"
      className="create-course-modal"
      dialogClassName="create-course-modal-dialog"
      style={{ zIndex: 1050 }}
    >
        <Modal.Header closeButton>
          <Modal.Title>{isUpdateMode ? "Cập nhật khóa học" : "Tạo khóa học mới"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            {/* Title */}
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
                placeholder="Nhập tiêu đề khóa học"
              />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              <div className="form-hint">*Bắt buộc</div>
            </div>

            {/* Price & Max Student & Type */}
            <div className="row">
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">Giá (VND)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                  />
                  <div className="form-hint">0 = Miễn phí</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">Số học viên tối đa</label>
                  <input
                    type="number"
                    className="form-control"
                    value={maxStudent}
                    onChange={(e) => setMaxStudent(e.target.value)}
                    placeholder="0"
                  />
                  <div className="form-hint">0 = Không giới hạn</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">Loại khóa học</label>
                  <select 
                    className="form-select" 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="1">System Course</option>
                    <option value="2">Teacher Course</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label className="form-label">Ảnh khóa học</label>
              {imagePreview ? (
                <div className="image-preview-wrapper">
                  <img src={imagePreview} alt="Ảnh xem trước khóa học" className="image-preview" />
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

            {/* Description - Markdown Editor */}
            <div className="form-group">
              <label className="form-label required">Mô tả (Markdown)</label>
              <div className="markdown-editor-container">
                <div className="markdown-editor-left">
                  <textarea
                    className={`markdown-textarea ${errors.description ? "is-invalid" : ""}`}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setErrors({ ...errors, description: null });
                    }}
                    placeholder={`Viết mô tả khóa học bằng Markdown

Ví dụ:
# Giới thiệu

Đây là một khóa học tuyệt vời...

- Điểm 1
- Điểm 2`}
                  />
                </div>
                <div className="markdown-editor-right">
                  <div className="markdown-preview">
                    {description.trim() ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {description}
                      </ReactMarkdown>
                    ) : (
                      <div className="markdown-preview-empty">
                        <p>Xem trước mô tả sẽ hiển thị ở đây...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              <div className="form-hint">*Bắt buộc. Sử dụng Markdown để định dạng văn bản</div>
            </div>

            {/* Featured */}
            <div className="form-group">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="featuredCheck"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="featuredCheck">
                  Đánh dấu là khóa học nổi bật
                </label>
              </div>
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div className="alert alert-danger mt-3">{errors.submit}</div>
            )}
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isFormValid || submitting || uploadingImage}
          >
            {submitting ? (isUpdateMode ? "Đang cập nhật..." : "Đang tạo...") : (isUpdateMode ? "Cập nhật" : "Tạo khóa học")}
          </Button>
        </Modal.Footer>
      </Modal>
  );
}
