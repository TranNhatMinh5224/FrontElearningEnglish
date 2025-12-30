import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { fileService } from "../../../Services/fileService";
import { teacherService } from "../../../Services/teacherService";
import { teacherPackageService } from "../../../Services/teacherPackageService";
import { useAuth } from "../../../Context/AuthContext";
import { FaFileUpload, FaTimes } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./CreateCourseModal.css";

const COURSE_IMAGE_BUCKET = "courses"; // Bucket name for course images

export default function CreateCourseModal({ show, onClose, onSuccess, courseData, isUpdateMode = false }) {
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type] = useState(2); // Mặc định type = 2 (khóa học của giáo viên)
  const [maxStudent, setMaxStudent] = useState(0); // Max students từ package

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
  const [loadingPackage, setLoadingPackage] = useState(false);

  // Load maxStudent from teacher package
  useEffect(() => {
    const loadMaxStudent = async () => {
      if (!show || !user?.teacherSubscription?.packageLevel) {
        setMaxStudent(0);
        return;
      }

      try {
        setLoadingPackage(true);
        const packageResponse = await teacherPackageService.getAll();
        const userPackageLevel = user.teacherSubscription.packageLevel;

        if (packageResponse.data?.success && packageResponse.data?.data && userPackageLevel) {
          const packages = packageResponse.data.data;
          const levelMap = {
            "Basic": 0,
            "Standard": 1,
            "Premium": 2,
            "Professional": 3
          };
          const expectedLevel = levelMap[userPackageLevel];

          const matchedPackage = packages.find(
            (pkg) => {
              const pkgLevel = pkg.level !== undefined ? pkg.level : (pkg.Level !== undefined ? pkg.Level : null);
              return (
                pkgLevel === expectedLevel ||
                pkgLevel?.toString() === userPackageLevel ||
                (typeof pkgLevel === "string" && pkgLevel === userPackageLevel)
              );
            }
          );

          if (matchedPackage) {
            const maxStudents = matchedPackage.maxStudents || matchedPackage.MaxStudents || 0;
            setMaxStudent(maxStudents);
          } else {
            setMaxStudent(0);
          }
        } else {
          setMaxStudent(0);
        }
      } catch (error) {
        console.error("Error loading teacher package:", error);
        setMaxStudent(0);
      } finally {
        setLoadingPackage(false);
      }
    };

    if (show) {
      loadMaxStudent();
    }
  }, [show, user]);

  // Pre-fill form when in update mode
  useEffect(() => {
    if (show && isUpdateMode && courseData) {
      const courseTitle = courseData.title || courseData.Title || "";
      const courseDescription = courseData.description || courseData.Description || "";
      const courseImageUrl = courseData.imageUrl || courseData.ImageUrl || null;
      
      setTitle(courseTitle);
      setDescription(courseDescription);
      setExistingImageUrl(courseImageUrl);
      // Không set maxStudent từ course data - sẽ dùng giá trị từ package (được load ở useEffect khác)
      
      // Set preview to existing image if available
      if (courseImageUrl) {
        setImagePreview(courseImageUrl);
      } else {
        setImagePreview(null);
      }
      
      // Reset new upload fields
      setSelectedImage(null);
      setImageTempKey(null);
      setImageType(null);
    }
  }, [show, isUpdateMode, courseData]);

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
      let submitData;
      
      if (isUpdateMode && courseData) {
        // Update mode: chỉ gửi các trường có thể cập nhật (không gửi type)
        submitData = {
          title: title.trim(),
          description: description.trim(),
          maxStudent: maxStudent, // Từ gói giáo viên hiện tại
        };

        // Chỉ thêm imageTempKey và imageType nếu có upload ảnh mới
        if (imageTempKey && imageType) {
          submitData.imageTempKey = imageTempKey;
          submitData.imageType = imageType;
        }
        
        const courseId = courseData.courseId || courseData.CourseId;
        if (!courseId) {
          throw new Error("Không tìm thấy ID khóa học");
        }
        const response = await teacherService.updateCourse(courseId, submitData);
        
        if (response.data?.success) {
          onSuccess?.();
          onClose();
        } else {
          throw new Error(response.data?.message || "Cập nhật khóa học thất bại");
        }
      } else {
        // Create mode: gửi đầy đủ thông tin
        submitData = {
          title: title.trim(),
          description: description.trim(),
          type: type,
          maxStudent: maxStudent, // Từ gói giáo viên hiện tại
        };

        // Chỉ thêm imageTempKey và imageType nếu có upload ảnh mới
        if (imageTempKey && imageType) {
          submitData.imageTempKey = imageTempKey;
          submitData.imageType = imageType;
        }
        
        const response = await teacherService.createCourse(submitData);
        
        if (response.data?.success) {
          onSuccess?.();
          onClose();
        } else {
          throw new Error(response.data?.message || "Tạo khóa học thất bại");
        }
      }

    } catch (error) {
      console.error(`Error ${isUpdateMode ? "updating" : "creating"} course:`, error);
      const errorMessage = error.response?.data?.message || error.message || (isUpdateMode ? "Có lỗi xảy ra khi cập nhật khóa học" : "Có lỗi xảy ra khi tạo khóa học");
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
      className="create-course-modal" 
      dialogClassName="create-course-modal-dialog"
      style={{ zIndex: 1050 }}
    >
      <Modal.Header closeButton>
        <Modal.Title>{isUpdateMode ? "Cập nhật lớp học" : "Tạo lớp học"}</Modal.Title>
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

          {/* Số học viên tối đa (từ gói giáo viên) */}
          <div className="form-group">
            <label className="form-label">Số học viên tối đa</label>
            <input
              type="number"
              className="form-control"
              value={maxStudent}
              readOnly
              disabled
              style={{ 
                backgroundColor: "#f5f5f5", 
                cursor: "not-allowed",
                opacity: 0.7
              }}
              placeholder={loadingPackage ? "Đang tải..." : "Tự động từ gói giáo viên"}
            />
            <div className="form-hint">
              Giá trị này được lấy từ gói giáo viên hiện tại của bạn ! Không thể thay đổi.
            </div>
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
                  {uploadingImage ? "Đang upload..." : isUpdateMode ? "Thay đổi ảnh" : "Chọn ảnh"}
                </span>
              </div>
            )}
            {errors.image && <div className="error-message">{errors.image}</div>}
            <div className="form-hint">Không bắt buộc{isUpdateMode && existingImageUrl && !imageTempKey ? " (giữ nguyên ảnh hiện tại nếu không chọn ảnh mới)" : ""}</div>
          </div>

          {/* Mô tả - Markdown Editor */}
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
          {submitting ? (isUpdateMode ? "Đang cập nhật..." : "Đang tạo...") : (isUpdateMode ? "Cập nhật" : "Tạo")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

