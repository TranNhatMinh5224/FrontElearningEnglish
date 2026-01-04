import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { quizService } from "../../../Services/quizService";
import { fileService } from "../../../Services/fileService";
import { FaTimes, FaImage, FaVideo } from "react-icons/fa";
import "./CreateQuizGroupModal.css";

const QUIZ_GROUP_BUCKET = "quizgroups";

export default function CreateQuizGroupModal({ show, onClose, onSuccess, quizSectionId, groupToUpdate = null, isAdmin = false }) {
  const isUpdateMode = !!groupToUpdate;
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [sumScore, setSumScore] = useState("0");
  
  // Image state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageTempKey, setImageTempKey] = useState(null);
  const [imageType, setImageType] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);
  
  // Video state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoTempKey, setVideoTempKey] = useState(null);
  const [videoType, setVideoType] = useState(null);
  const [videoDuration, setVideoDuration] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const videoInputRef = useRef(null);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(false);

  // Load group data when in update mode
  useEffect(() => {
    if (show && isUpdateMode && groupToUpdate) {
      loadGroupData();
    }
  }, [show, isUpdateMode, groupToUpdate]);

  const loadGroupData = async () => {
    if (!groupToUpdate) return;
    
    setLoadingGroup(true);
    try {
      const groupId = groupToUpdate.quizGroupId || groupToUpdate.QuizGroupId;
      const response = await quizService.getQuizGroupById(groupId);
      
      if (response.data?.success && response.data?.data) {
        const group = response.data.data;
        setName(group.name || group.Name || "");
        setDescription(group.description || group.Description || "");
        setTitle(group.title || group.Title || "");
        
        // Safely handle sumScore
        const scoreVal = group.sumScore !== undefined ? group.sumScore : (group.SumScore !== undefined ? group.SumScore : 0);
        setSumScore((scoreVal ?? 0).toString());
        
        // Safely handle videoDuration
        const durationVal = group.videoDuration !== undefined ? group.videoDuration : (group.VideoDuration !== undefined ? group.VideoDuration : "");
        setVideoDuration((durationVal ?? "").toString());
        
        // Handle image - check multiple property cases
        const imageUrl = group.imgUrl || group.ImgUrl || group.imageUrl || group.ImageUrl;
        if (imageUrl) {
          setImagePreview(imageUrl);
        }
        
        // Handle video - check multiple property cases
        const videoUrl = group.videoUrl || group.VideoUrl || group.videoUrl || group.VideoUrl;
        if (videoUrl) {
          setVideoPreview(videoUrl);
        }
      }
    } catch (error) {
      console.error("Error loading group data:", error);
      setErrors({ ...errors, submit: "Không thể tải dữ liệu group" });
    } finally {
      setLoadingGroup(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setName("");
      setDescription("");
      setTitle("");
      setSumScore("0");
      setSelectedImage(null);
      setImagePreview(null);
      setImageTempKey(null);
      setImageType(null);
      setSelectedVideo(null);
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
      setVideoPreview(null);
      setVideoTempKey(null);
      setVideoType(null);
      setVideoDuration("");
      setErrors({});
    }
  }, [show]);

  // Handle image upload
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("📤 [CreateQuizGroupModal] Selected image file:", file.name, file.type, file.size);

    if (!file.type.startsWith("image/")) {
      setErrors({ ...errors, image: "Vui lòng chọn file ảnh" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: "Kích thước ảnh không được vượt quá 5MB" });
      return;
    }

    setUploadingImage(true);
    setErrors({ ...errors, image: null });

    try {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setSelectedImage(file);

      console.log("📤 [CreateQuizGroupModal] Uploading image to bucket:", QUIZ_GROUP_BUCKET);
      
      const uploadResponse = await fileService.uploadTempFile(
        file,
        QUIZ_GROUP_BUCKET,
        "temp"
      );

      console.log("📥 [CreateQuizGroupModal] Upload response:", uploadResponse.data);

      if (uploadResponse.data?.success && uploadResponse.data?.data) {
        const resultData = uploadResponse.data.data;
        const tempKey = resultData.TempKey || resultData.tempKey;
        const imageTypeValue = resultData.ImageType || resultData.imageType || file.type;

        console.log("✅ [CreateQuizGroupModal] Image uploaded successfully. TempKey:", tempKey);

        if (!tempKey) {
          throw new Error("Không nhận được TempKey từ server");
        }

        setImageTempKey(tempKey);
        setImageType(imageTypeValue);
      } else {
        throw new Error(uploadResponse.data?.message || "Upload ảnh thất bại");
      }
    } catch (error) {
      console.error("❌ [CreateQuizGroupModal] Error uploading image:", error);
      console.error("Error details:", error.response?.data);
      setErrors({ ...errors, image: error.response?.data?.message || error.message || "Có lỗi xảy ra khi upload ảnh" });
      setSelectedImage(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageTempKey(null);
    setImageType(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // Handle video upload
  const handleVideoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("📤 [CreateQuizGroupModal] Selected video file:", file.name, file.type, file.size);

    if (!file.type.startsWith("video/")) {
      setErrors({ ...errors, video: "Vui lòng chọn file video" });
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setErrors({ ...errors, video: "Kích thước video không được vượt quá 100MB" });
      return;
    }

    setUploadingVideo(true);
    setErrors({ ...errors, video: null });

    try {
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
      setSelectedVideo(file);

      // Get video duration
      const duration = await new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = videoUrl;
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(videoUrl);
          const durationSeconds = Math.round(video.duration);
          resolve(durationSeconds);
        };
        video.onerror = () => {
          window.URL.revokeObjectURL(videoUrl);
          reject(new Error("Không thể đọc metadata video"));
        };
      });

      setVideoDuration(duration.toString());

      console.log("📤 [CreateQuizGroupModal] Uploading video to bucket:", QUIZ_GROUP_BUCKET);

      const uploadResponse = await fileService.uploadTempFile(
        file,
        QUIZ_GROUP_BUCKET,
        "temp"
      );

      console.log("📥 [CreateQuizGroupModal] Upload response:", uploadResponse.data);

      if (uploadResponse.data?.success && uploadResponse.data?.data) {
        const resultData = uploadResponse.data.data;
        const tempKey = resultData.TempKey || resultData.tempKey;
        const videoTypeValue = resultData.ImageType || resultData.imageType || resultData.VideoType || resultData.videoType || file.type;

        console.log("✅ [CreateQuizGroupModal] Video uploaded successfully. TempKey:", tempKey);

        if (!tempKey) {
          throw new Error("Không nhận được TempKey từ server");
        }

        setVideoTempKey(tempKey);
        setVideoType(videoTypeValue);
      } else {
        throw new Error(uploadResponse.data?.message || "Upload video thất bại");
      }
    } catch (error) {
      console.error("❌ [CreateQuizGroupModal] Error uploading video:", error);
      console.error("Error details:", error.response?.data);
      setErrors({ ...errors, video: error.response?.data?.message || error.message || "Có lỗi xảy ra khi upload video" });
      setSelectedVideo(null);
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
      setVideoPreview(null);
      setVideoDuration("");
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }
    }
  };

  const handleRemoveVideo = () => {
    setSelectedVideo(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    setVideoTempKey(null);
    setVideoType(null);
    setVideoDuration("");
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Tên nhóm là bắt buộc";
    }

    if (!title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    }

    if (!sumScore || parseFloat(sumScore) < 0) {
      newErrors.sumScore = "Tổng điểm phải lớn hơn hoặc bằng 0";
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
        quizSectionId: parseInt(quizSectionId),
        name: name.trim(),
        description: description.trim() || null,
        title: title.trim(),
        sumScore: parseFloat(sumScore),
        imageTempKey: imageTempKey || null,
        imageType: imageType || null,
        videoTempKey: videoTempKey || null,
        videoType: videoType || null,
        videoDuration: videoDuration ? parseInt(videoDuration) : null,
      };

      let response;
      if (isUpdateMode && groupToUpdate) {
        const groupId = groupToUpdate.quizGroupId || groupToUpdate.QuizGroupId;
        const updateData = {
          name: submitData.name,
          description: submitData.description,
          title: submitData.title,
          sumScore: submitData.sumScore,
          imageTempKey: submitData.imageTempKey,
          imageType: submitData.imageType,
          videoTempKey: submitData.videoTempKey,
          videoType: submitData.videoType,
          videoDuration: submitData.videoDuration,
        };
        response = isAdmin
          ? await quizService.updateAdminQuizGroup(groupId, updateData)
          : await quizService.updateQuizGroup(groupId, updateData);
      } else {
        response = isAdmin
          ? await quizService.createAdminQuizGroup(submitData)
          : await quizService.createQuizGroup(submitData);
      }

      if (response.data?.success) {
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.data?.message || (isUpdateMode ? "Cập nhật Group thất bại" : "Tạo Group thất bại"));
      }
    } catch (error) {
      console.error(`Error ${isUpdateMode ? "updating" : "creating"} group:`, error);
      const errorMessage = error.response?.data?.message || error.message || (isUpdateMode ? "Có lỗi xảy ra khi cập nhật Group" : "Có lỗi xảy ra khi tạo Group");
      setErrors({ ...errors, submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = 
    name.trim() && 
    title.trim() && 
    sumScore && 
    parseFloat(sumScore) >= 0;

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      className="create-quiz-group-modal" 
      dialogClassName="create-quiz-group-modal-dialog"
      style={{ zIndex: 1050 }}
    >
      <Modal.Header closeButton>
        <Modal.Title>{isUpdateMode ? "Cập nhật Group" : "Tạo Group mới"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loadingGroup ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Tên nhóm */}
            <div className="mb-3">
              <label className="form-label required">Tên nhóm</label>
              <input
                type="text"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors({ ...errors, name: null });
                }}
                placeholder="Nhập tên nhóm"
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              <div className="form-text">*Bắt buộc</div>
            </div>

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
                placeholder="Nhập tiêu đề"
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
                placeholder="Nhập mô tả (không bắt buộc)"
                rows={2}
              />
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              <div className="form-text">Không bắt buộc</div>
            </div>

            {/* Tổng điểm */}
            <div className="mb-3">
              <label className="form-label required">Tổng điểm</label>
              <input
                type="number"
                className={`form-control ${errors.sumScore ? "is-invalid" : ""}`}
                value={sumScore}
                onChange={(e) => {
                  setSumScore(e.target.value);
                  setErrors({ ...errors, sumScore: null });
                }}
                placeholder="Nhập tổng điểm"
                min="0"
                step="0.01"
              />
              {errors.sumScore && <div className="invalid-feedback">{errors.sumScore}</div>}
              <div className="form-text">*Bắt buộc</div>
            </div>

            <Row>
              {/* Image Upload */}
              <Col md={6}>
                <div className="mb-3">
                  <label className="form-label">Ảnh đính kèm</label>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                  {imagePreview ? (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger remove-image-btn"
                        onClick={handleRemoveImage}
                        disabled={uploadingImage}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`image-upload-area ${errors.image ? "is-invalid" : ""}`}
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <FaImage size={24} />
                      <span>{uploadingImage ? "Đang tải..." : "Chọn ảnh"}</span>
                    </div>
                  )}
                  {errors.image && <div className="invalid-feedback d-block">{errors.image}</div>}
                  <div className="form-text">Không bắt buộc</div>
                </div>
              </Col>

              {/* Video Upload */}
              <Col md={6}>
                <div className="mb-3">
                  <label className="form-label">Video đính kèm</label>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    style={{ display: "none" }}
                  />
                  {videoPreview ? (
                    <div className="video-preview-container">
                      <video controls src={videoPreview} className="video-preview" />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger remove-video-btn"
                        onClick={handleRemoveVideo}
                        disabled={uploadingVideo}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`video-upload-area ${errors.video ? "is-invalid" : ""}`}
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <FaVideo size={24} />
                      <span>{uploadingVideo ? "Đang tải..." : "Chọn video"}</span>
                    </div>
                  )}
                  {errors.video && <div className="invalid-feedback d-block">{errors.video}</div>}
                  <div className="form-text">Không bắt buộc</div>
                </div>
              </Col>
            </Row>

            {/* Submit error */}
            {errors.submit && (
              <div className="alert alert-danger mt-3">{errors.submit}</div>
            )}
          </form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={submitting || loadingGroup}>
          Huỷ
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!isFormValid || submitting || loadingGroup}
        >
          {submitting ? (isUpdateMode ? "Đang cập nhật..." : "Đang tạo...") : (isUpdateMode ? "Cập nhật" : "Tạo")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

