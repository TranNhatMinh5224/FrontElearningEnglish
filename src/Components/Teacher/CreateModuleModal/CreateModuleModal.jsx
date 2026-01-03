import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { fileService } from "../../../Services/fileService";
import { teacherService } from "../../../Services/teacherService";
import { adminService } from "../../../Services/adminService";
import { useAuth } from "../../../Context/AuthContext";
import { FaFileUpload, FaTimes } from "react-icons/fa";
import "./CreateModuleModal.css";

const MODULE_IMAGE_BUCKET = "modules"; // Bucket name for module images

// ModuleType enum mapping (matching backend ModuleType enum)
// Lecture = 1, FlashCard = 2, Assessment = 3
const MODULE_TYPES = [
  { value: 1, label: "Lecture" },
  { value: 2, label: "FlashCard" },
  { value: 3, label: "Assessment" },
];

export default function CreateModuleModal({ show, onClose, onSuccess, lessonId, moduleData, isUpdateMode = false, isAdmin = false }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState("");

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
    if (show && isUpdateMode && moduleData) {
      const moduleName = moduleData.name || moduleData.Name || "";
      const moduleDescription = moduleData.description || moduleData.Description || "";
      const moduleContentType = moduleData.contentType || moduleData.ContentType || "";
      const moduleImageUrl = moduleData.imageUrl || moduleData.ImageUrl || null;
      
      setName(moduleName);
      setDescription(moduleDescription || "");
      setContentType(moduleContentType.toString());
      setExistingImageUrl(moduleImageUrl);
      
      // Set preview to existing image if available
      if (moduleImageUrl) {
        setImagePreview(moduleImageUrl);
      } else {
        setImagePreview(null);
      }
      
      // Reset new upload fields
      setSelectedImage(null);
      setImageTempKey(null);
      setImageType(null);
    }
  }, [show, isUpdateMode, moduleData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setName("");
      setDescription("");
      setContentType("");
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
        MODULE_IMAGE_BUCKET,
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Tiêu đề là bắt buộc";
    }

    if (!description.trim()) {
      newErrors.description = "Mô tả là bắt buộc";
    }

    if (!contentType) {
      newErrors.contentType = "Loại nội dung là bắt buộc";
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
      let response;
      
      if (isUpdateMode && moduleData) {
        const moduleId = moduleData.moduleId || moduleData.ModuleId;
        const updateData = {
          name: name.trim(),
          description: description.trim(),
        };

        // Chỉ thêm contentType nếu có giá trị
        if (contentType) {
          updateData.contentType = parseInt(contentType);
        }

        // Chỉ thêm imageTempKey và imageType nếu có upload ảnh mới
        if (imageTempKey && imageType) {
          updateData.imageTempKey = imageTempKey;
          updateData.imageType = imageType;
        }

        response = isAdmin
          ? await adminService.updateModule(moduleId, updateData)
          : await teacherService.updateModule(moduleId, updateData);
      } else {
        const createData = {
          lessonId: parseInt(lessonId),
          name: name.trim(),
          description: description.trim(),
          contentType: parseInt(contentType),
          orderIndex: 0, // Backend will auto-assign if 0
        };

        // Chỉ thêm imageTempKey và imageType nếu có upload ảnh
        if (imageTempKey && imageType) {
          createData.imageTempKey = imageTempKey;
          createData.imageType = imageType;
        }

        response = isAdmin
          ? await adminService.createModule(createData)
          : await teacherService.createModule(createData);
      }

      if (response.data?.success) {
        // Success
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.data?.message || (isUpdateMode ? "Cập nhật module thất bại" : "Tạo module thất bại"));
      }
    } catch (error) {
      console.error(`Error ${isUpdateMode ? "updating" : "creating"} module:`, error);
      const errorMessage = error.response?.data?.message || error.message || `Có lỗi xảy ra khi ${isUpdateMode ? "cập nhật" : "tạo"} module`;
      setErrors({ ...errors, submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = name.trim() && description.trim() && contentType;

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      className="create-module-modal" 
      dialogClassName="create-module-modal-dialog"
      style={{ zIndex: 1050 }}
    >
      <Modal.Header closeButton>
        <Modal.Title>{isUpdateMode ? "Cập nhật Module" : "Thêm Module"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          {/* Tiêu đề */}
          <div className="form-group">
            <label className="form-label required">Tiêu đề</label>
            <input
              type="text"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, name: null });
              }}
              placeholder="Nhập tiêu đề module"
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
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
              placeholder="Nhập mô tả module"
              rows={4}
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            <div className="form-hint">*Bắt buộc</div>
          </div>

          {/* Content Type */}
          <div className="form-group">
            <label className="form-label required">Loại nội dung</label>
            <select
              className={`form-control ${errors.contentType ? "is-invalid" : ""}`}
              value={contentType}
              onChange={(e) => {
                setContentType(e.target.value);
                setErrors({ ...errors, contentType: null });
              }}
            >
              <option value="">Chọn loại nội dung</option>
              {MODULE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.contentType && <div className="invalid-feedback">{errors.contentType}</div>}
            <div className="form-hint">*Bắt buộc</div>
          </div>

          {/* Ảnh module */}
          <div className="form-group">
            <label className="form-label">Ảnh module</label>
            {imagePreview ? (
              <div className="image-preview-wrapper">
                <img src={imagePreview} alt="Ảnh xem trước module" className="image-preview" />
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
            <div className="form-hint">
              Không bắt buộc{isUpdateMode && existingImageUrl && !imageTempKey ? " (giữ nguyên ảnh hiện tại nếu không chọn ảnh mới)" : ""}
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

