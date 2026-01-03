import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { essayService } from "../../../Services/essayService";
import { fileService } from "../../../Services/fileService";
import { FaTimes, FaImage, FaMusic } from "react-icons/fa";
import "./CreateEssayModal.css";

const ESSAY_BUCKET = "essays"; // Backend uses "essays" bucket for both images and audios

export default function CreateEssayModal({ show, onClose, onSuccess, assessmentId, essayToUpdate = null, isAdmin = false }) {
  const isUpdateMode = !!essayToUpdate;
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalPoints, setTotalPoints] = useState("100");
  
  // Image state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageTempKey, setImageTempKey] = useState(null);
  const [imageType, setImageType] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);
  
  // Audio state
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [audioTempKey, setAudioTempKey] = useState(null);
  const [audioType, setAudioType] = useState(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const audioInputRef = useRef(null);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [loadingEssay, setLoadingEssay] = useState(false);

  // Load essay data when in update mode
  useEffect(() => {
    if (show && isUpdateMode && essayToUpdate) {
      loadEssayData();
    }
  }, [show, isUpdateMode, essayToUpdate]);

  const loadEssayData = async () => {
    if (!essayToUpdate) return;
    
    setLoadingEssay(true);
    try {
      const essayId = essayToUpdate.essayId || essayToUpdate.EssayId;
      const response = isAdmin 
        ? await essayService.getAdminEssayById(essayId)
        : await essayService.getTeacherEssayById(essayId);
      
      if (response.data?.success && response.data?.data) {
        const essay = response.data.data;
        setTitle(essay.title || essay.Title || "");
        setDescription(essay.description || essay.Description || "");
        setTotalPoints((essay.totalPoints !== undefined ? essay.totalPoints : (essay.TotalPoints !== undefined ? essay.TotalPoints : 100)).toString());
        
        // Handle image
        const imageUrl = essay.imageUrl || essay.ImageUrl;
        if (imageUrl) {
          setImagePreview(imageUrl);
        }
        // Note: In update mode, we don't set imageTempKey from existing data
        // User needs to upload new image if they want to change it
        
        // Handle audio
        const audioUrl = essay.audioUrl || essay.AudioUrl;
        if (audioUrl) {
          setAudioPreview(audioUrl);
        }
      }
    } catch (error) {
      console.error("Error loading essay data:", error);
      setErrors({ ...errors, submit: "Không thể tải dữ liệu essay" });
    } finally {
      setLoadingEssay(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setTitle("");
      setDescription("");
      setTotalPoints("100");
      setSelectedImage(null);
      setImagePreview(null);
      setImageTempKey(null);
      setImageType(null);
      setSelectedAudio(null);
      if (audioPreview) {
        URL.revokeObjectURL(audioPreview);
      }
      setAudioPreview(null);
      setAudioTempKey(null);
      setAudioType(null);
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

    console.log("📤 [CreateEssayModal] Selected image file:", file.name, file.type, file.size);

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
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setSelectedImage(file);

      console.log("📤 [CreateEssayModal] Uploading image to bucket:", ESSAY_BUCKET);
      
      // Upload file to temp storage
      // Backend uses "essays" bucket, files will be committed to "images" folder later
      const uploadResponse = await fileService.uploadTempFile(
        file,
        ESSAY_BUCKET,
        "temp"
      );

      console.log("📥 [CreateEssayModal] Upload response:", uploadResponse.data);

      if (uploadResponse.data?.success && uploadResponse.data?.data) {
        const resultData = uploadResponse.data.data;
        const tempKey = resultData.TempKey || resultData.tempKey;
        const imageTypeValue = resultData.ImageType || resultData.imageType || file.type;

        console.log("✅ [CreateEssayModal] Image uploaded successfully. TempKey:", tempKey);

        if (!tempKey) {
          throw new Error("Không nhận được TempKey từ server");
        }

        setImageTempKey(tempKey);
        setImageType(imageTypeValue);
      } else {
        throw new Error(uploadResponse.data?.message || "Upload ảnh thất bại");
      }
    } catch (error) {
      console.error("❌ [CreateEssayModal] Error uploading image:", error);
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
    setImagePreview(null);
    setImageTempKey(null);
    setImageType(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // Handle audio upload
  const handleAudioChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("📤 [CreateEssayModal] Selected audio file:", file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith("audio/")) {
      setErrors({ ...errors, audio: "Vui lòng chọn file âm thanh" });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors({ ...errors, audio: "Kích thước file âm thanh không được vượt quá 10MB" });
      return;
    }

    setUploadingAudio(true);
    setErrors({ ...errors, audio: null });

    try {
      // Create preview URL
      const audioUrl = URL.createObjectURL(file);
      setAudioPreview(audioUrl);
      setSelectedAudio(file);

      console.log("📤 [CreateEssayModal] Uploading audio to bucket:", ESSAY_BUCKET);

      // Upload file to temp storage
      // Backend uses "essays" bucket, files will be committed to "audios" folder later
      const uploadResponse = await fileService.uploadTempFile(
        file,
        ESSAY_BUCKET,
        "temp"
      );

      console.log("📥 [CreateEssayModal] Upload response:", uploadResponse.data);

      if (uploadResponse.data?.success && uploadResponse.data?.data) {
        const resultData = uploadResponse.data.data;
        const tempKey = resultData.TempKey || resultData.tempKey;
        const audioTypeValue = resultData.ImageType || resultData.imageType || resultData.AudioType || resultData.audioType || file.type;

        console.log("✅ [CreateEssayModal] Audio uploaded successfully. TempKey:", tempKey);

        if (!tempKey) {
          throw new Error("Không nhận được TempKey từ server");
        }

        setAudioTempKey(tempKey);
        setAudioType(audioTypeValue);
      } else {
        throw new Error(uploadResponse.data?.message || "Upload âm thanh thất bại");
      }
    } catch (error) {
      console.error("❌ [CreateEssayModal] Error uploading audio:", error);
      console.error("Error details:", error.response?.data);
      setErrors({ ...errors, audio: error.response?.data?.message || error.message || "Có lỗi xảy ra khi upload âm thanh" });
      setSelectedAudio(null);
      if (audioPreview) {
        URL.revokeObjectURL(audioPreview);
      }
      setAudioPreview(null);
    } finally {
      setUploadingAudio(false);
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAudio = () => {
    setSelectedAudio(null);
    if (audioPreview) {
      URL.revokeObjectURL(audioPreview);
    }
    setAudioPreview(null);
    setAudioTempKey(null);
    setAudioType(null);
    if (audioInputRef.current) {
      audioInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    }

    if (!totalPoints || parseFloat(totalPoints) <= 0) {
      newErrors.totalPoints = "Tổng điểm phải lớn hơn 0";
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
        assessmentId: parseInt(assessmentId),
        title: title.trim(),
        description: description.trim() || null,
        totalPoints: parseFloat(totalPoints),
        imageTempKey: imageTempKey || null,
        imageType: imageType || null,
        audioTempKey: audioTempKey || null,
        audioType: audioType || null,
      };

      let response;
      if (isUpdateMode && essayToUpdate) {
        const essayId = essayToUpdate.essayId || essayToUpdate.EssayId;
        // UpdateEssayDto doesn't have totalPoints
        const updateData = {
          title: submitData.title,
          description: submitData.description,
          imageTempKey: submitData.imageTempKey,
          imageType: submitData.imageType,
          audioTempKey: submitData.audioTempKey,
          audioType: submitData.audioType,
        };
        response = isAdmin
          ? await essayService.updateAdminEssay(essayId, updateData)
          : await essayService.updateEssay(essayId, updateData);
      } else {
        response = isAdmin
          ? await essayService.createAdminEssay(submitData)
          : await essayService.createEssay(submitData);
      }

      if (response.data?.success) {
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.data?.message || (isUpdateMode ? "Cập nhật Essay thất bại" : "Tạo Essay thất bại"));
      }
    } catch (error) {
      console.error(`Error ${isUpdateMode ? "updating" : "creating"} essay:`, error);
      const errorMessage = error.response?.data?.message || error.message || (isUpdateMode ? "Có lỗi xảy ra khi cập nhật Essay" : "Có lỗi xảy ra khi tạo Essay");
      setErrors({ ...errors, submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = 
    title.trim() && 
    totalPoints && 
    parseFloat(totalPoints) > 0;

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      className="create-essay-modal" 
      dialogClassName="create-essay-modal-dialog"
      style={{ zIndex: 1050 }}
    >
      <Modal.Header closeButton>
        <Modal.Title>{isUpdateMode ? "Cập nhật Essay" : "Tạo Essay mới"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loadingEssay ? (
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
                placeholder="Nhập tiêu đề Essay"
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
                placeholder="Nhập mô tả Essay (không bắt buộc)"
                rows={3}
              />
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              <div className="form-text">Không bắt buộc</div>
            </div>

            {/* Tổng điểm */}
            <div className="mb-3">
              <label className="form-label required">Tổng điểm</label>
              <input
                type="number"
                className={`form-control ${errors.totalPoints ? "is-invalid" : ""}`}
                value={totalPoints}
                onChange={(e) => {
                  setTotalPoints(e.target.value);
                  setErrors({ ...errors, totalPoints: null });
                }}
                placeholder="Nhập tổng điểm"
                min="0.01"
                step="0.01"
                disabled={isUpdateMode}
              />
              {errors.totalPoints && <div className="invalid-feedback">{errors.totalPoints}</div>}
              <div className="form-text">*Bắt buộc{isUpdateMode ? " (không thể thay đổi khi cập nhật)" : ""}</div>
            </div>

            {/* Image Upload */}
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

            {/* Audio Upload */}
            <div className="mb-3">
              <label className="form-label">Âm thanh đính kèm</label>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                style={{ display: "none" }}
              />
              {audioPreview ? (
                <div className="audio-preview-container">
                  <audio controls src={audioPreview} className="audio-preview" />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger remove-audio-btn"
                    onClick={handleRemoveAudio}
                    disabled={uploadingAudio}
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div
                  className={`audio-upload-area ${errors.audio ? "is-invalid" : ""}`}
                  onClick={() => audioInputRef.current?.click()}
                >
                  <FaMusic size={24} />
                  <span>{uploadingAudio ? "Đang tải..." : "Chọn file âm thanh"}</span>
                </div>
              )}
              {errors.audio && <div className="invalid-feedback d-block">{errors.audio}</div>}
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
        <Button variant="secondary" onClick={onClose} disabled={submitting || loadingEssay}>
          Huỷ
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!isFormValid || submitting || loadingEssay}
        >
          {submitting ? (isUpdateMode ? "Đang cập nhật..." : "Đang tạo...") : (isUpdateMode ? "Cập nhật" : "Tạo")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

