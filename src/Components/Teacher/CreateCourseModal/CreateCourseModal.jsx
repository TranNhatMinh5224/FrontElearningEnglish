import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { fileService } from "../../../Services/fileService";
import { teacherService } from "../../../Services/teacherService";
import { teacherPackageService } from "../../../Services/teacherPackageService";
import { useAuth } from "../../../Context/AuthContext";
import { FaFileUpload, FaTimes } from "react-icons/fa";
import "./CreateCourseModal.css";

const COURSE_IMAGE_BUCKET = "courses"; // Bucket name for course images

export default function CreateCourseModal({ show, onClose, onSuccess }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxStudent, setMaxStudent] = useState("");
  const [type] = useState(2); // Mặc định type = 2 (khóa học của giáo viên)

  // Image upload state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageTempKey, setImageTempKey] = useState(null);
  const [imageType, setImageType] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Package info state
  const [packageInfo, setPackageInfo] = useState(null);
  const [loadingPackage, setLoadingPackage] = useState(true);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Submit state
  const [submitting, setSubmitting] = useState(false);

  // Load teacher package info
  useEffect(() => {
    const loadPackageInfo = async () => {
      try {
        setLoadingPackage(true);
        const response = await teacherPackageService.getAll();
        
        if (response.data?.success && response.data?.data) {
          const packages = response.data.data;
          
          // Tìm package phù hợp với user's subscription
          // Match theo packageLevel (Basic hoặc Premium)
          const userPackageLevel = user?.teacherSubscription?.packageLevel;
          let matchedPackage = null;

          if (userPackageLevel) {
            // Tìm package có Level khớp với packageLevel
            // Level từ backend là enum: 0=Basic, 1=Standard, 2=Premium, 3=Professional
            // userPackageLevel là string: "Basic", "Standard", "Premium", "Professional"
            matchedPackage = packages.find(
              (pkg) => {
                const pkgLevel = pkg.level !== undefined ? pkg.level : (pkg.Level !== undefined ? pkg.Level : null);
                // Map string to enum number
                const levelMap = {
                  "Basic": 0,
                  "Standard": 1,
                  "Premium": 2,
                  "Professional": 3
                };
                const expectedLevel = levelMap[userPackageLevel];
                
                // So sánh: nếu pkgLevel là số thì so với expectedLevel, nếu là string thì so với userPackageLevel
                return (
                  pkgLevel === expectedLevel ||
                  pkgLevel?.toString() === userPackageLevel ||
                  (typeof pkgLevel === "string" && pkgLevel === userPackageLevel)
                );
              }
            );
          }

          // Nếu không tìm thấy, lấy package đầu tiên (fallback)
          if (!matchedPackage && packages.length > 0) {
            matchedPackage = packages[0];
          }

          if (matchedPackage) {
            setPackageInfo({
              maxCourses: matchedPackage.maxCourses || 0,
              maxLessons: matchedPackage.maxLessons || 0,
              maxStudents: matchedPackage.maxStudents || 0,
            });
          }
        }
      } catch (error) {
        console.error("Error loading package info:", error);
      } finally {
        setLoadingPackage(false);
      }
    };

    if (show && user?.teacherSubscription) {
      loadPackageInfo();
    }
  }, [show, user]);

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setTitle("");
      setDescription("");
      setMaxStudent("");
      setSelectedImage(null);
      setImagePreview(null);
      setImageTempKey(null);
      setImageType(null);
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
        COURSE_IMAGE_BUCKET,
        "temp"
      );

      console.log("Upload response:", uploadResponse.data);

      if (uploadResponse.data?.success && uploadResponse.data?.data) {
        const resultData = uploadResponse.data.data;
        // Backend trả về PascalCase: TempKey, ImageUrl, ImageType
        // Axios có thể convert thành camelCase: tempKey, imageUrl, imageType
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

    if (!title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    }

    if (!description.trim()) {
      newErrors.description = "Mô tả là bắt buộc";
    }

    if (!maxStudent || maxStudent <= 0) {
      newErrors.maxStudent = "Số học sinh tối đa phải lớn hơn 0";
    } else if (packageInfo && parseInt(maxStudent) > packageInfo.maxStudents) {
      newErrors.maxStudent = `Số học sinh tối đa không được vượt quá ${packageInfo.maxStudents} (giới hạn của gói hiện tại)`;
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
      const courseData = {
        title: title.trim(),
        description: description.trim(),
        maxStudent: parseInt(maxStudent),
        type: type,
      };

      // Chỉ thêm imageTempKey và imageType nếu có upload ảnh
      if (imageTempKey && imageType) {
        courseData.imageTempKey = imageTempKey;
        courseData.imageType = imageType;
      }

      const response = await teacherService.createCourse(courseData);

      if (response.data?.success) {
        // Success
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.data?.message || "Tạo khóa học thất bại");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi tạo khóa học";
      setErrors({ ...errors, submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = title.trim() && description.trim() && maxStudent && parseInt(maxStudent) > 0;

  return (
    <Modal show={show} onHide={onClose} centered className="create-course-modal">
      <Modal.Header closeButton>
        <Modal.Title>Tạo lớp học</Modal.Title>
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
              placeholder="Nhập tiêu đề khóa học"
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
              placeholder="Nhập mô tả khóa học"
              rows={4}
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            <div className="form-hint">*Bắt buộc</div>
          </div>

          {/* Max Student */}
          <div className="form-group">
            <label className="form-label required">Max student</label>
            <input
              type="number"
              className={`form-control ${errors.maxStudent ? "is-invalid" : ""}`}
              value={maxStudent}
              onChange={(e) => {
                setMaxStudent(e.target.value);
                setErrors({ ...errors, maxStudent: null });
              }}
              placeholder="Nhập số học sinh tối đa"
              min="1"
              max={packageInfo?.maxStudents || 10000}
            />
            {errors.maxStudent && <div className="invalid-feedback">{errors.maxStudent}</div>}
            {packageInfo && (
              <div className="form-hint">
                *Bắt buộc. Tối đa: {packageInfo.maxStudents} học sinh (theo gói hiện tại)
              </div>
            )}
            {!packageInfo && !loadingPackage && (
              <div className="form-hint">*Bắt buộc</div>
            )}
            {packageInfo && loadingPackage && (
              <div className="form-hint">*Bắt buộc. Đang tải thông tin gói...</div>
            )}
          </div>

          {/* Ảnh khóa học */}
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
                  {uploadingImage ? "Đang upload..." : "Chọn ảnh"}
                </span>
              </div>
            )}
            {errors.image && <div className="error-message">{errors.image}</div>}
            <div className="form-hint">Không bắt buộc</div>
          </div>

          {/* Type (hidden, mặc định 2) */}
          <input type="hidden" value={type} />

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
          {submitting ? "Đang tạo..." : "Tạo"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

