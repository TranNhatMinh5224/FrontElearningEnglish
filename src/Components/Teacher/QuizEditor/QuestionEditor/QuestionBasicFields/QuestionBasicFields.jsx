import React, { useRef, useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import { fileService } from "../../../../../Services/fileService";
import { FaFileUpload, FaTimes, FaImage } from "react-icons/fa";
import "./QuestionBasicFields.css";

const QUESTION_MEDIA_BUCKET = "questions"; // Bucket name for question media

export default function QuestionBasicFields({
  stemText,
  onStemTextChange,
  points,
  onPointsChange,
  explanation,
  onExplanationChange,
  mediaTempKey,
  onMediaTempKeyChange,
  mediaType,
  onMediaTypeChange,
  existingMediaUrl,
}) {
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Set preview from existing media URL or reset when question changes
  useEffect(() => {
    // Always reset first
    setImagePreview(null);
    setUploadError(null);

    // Then set from existing URL if available
    if (existingMediaUrl) {
      setImagePreview(existingMediaUrl);
    }
  }, [existingMediaUrl]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    setUploadingImage(true);
    setUploadError(null);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload file to temp storage
      const uploadResponse = await fileService.uploadTempFile(
        file,
        QUESTION_MEDIA_BUCKET,
        "temp"
      );

      if (uploadResponse.data?.success && uploadResponse.data?.data) {
        const resultData = uploadResponse.data.data;
        const tempKey = resultData.TempKey || resultData.tempKey;
        const imageTypeValue = resultData.ImageType || resultData.imageType || file.type;

        if (!tempKey) {
          throw new Error("Không nhận được TempKey từ server");
        }

        onMediaTempKeyChange(tempKey);
        onMediaTypeChange(imageTypeValue);
      } else {
        const errorMsg = uploadResponse.data?.message || "Upload ảnh thất bại";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError(error.response?.data?.message || "Có lỗi xảy ra khi upload ảnh");
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
    setImagePreview(null);
    onMediaTempKeyChange(null);
    onMediaTypeChange(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      {/* Question Text */}
      <Form.Group className="mb-4">
        <Form.Label>
          Nội dung câu hỏi <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={stemText}
          onChange={(e) => onStemTextChange(e.target.value)}
          placeholder="Nhập nội dung câu hỏi..."
          className="question-stem-textarea"
        />
      </Form.Group>

      {/* Media Upload */}
      <Form.Group className="mb-4">
        <Form.Label>Media (Tùy chọn)</Form.Label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          style={{ display: "none" }}
        />
        {imagePreview ? (
          <div className="media-preview-container">
            <div className="media-preview">
              <img src={imagePreview} alt="Preview" className="media-preview-image" />
              <button
                type="button"
                className="media-remove-btn"
                onClick={handleRemoveImage}
                title="Xóa ảnh"
              >
                <FaTimes />
              </button>
            </div>
            {uploadError && <div className="text-danger small mt-2">{uploadError}</div>}
          </div>
        ) : (
          <div
            className={`media-upload-placeholder ${uploadingImage ? "uploading" : ""}`}
            onClick={handleImageClick}
          >
            {uploadingImage ? (
              <div>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span>Đang upload...</span>
              </div>
            ) : (
              <div>
                <FaImage className="upload-icon" />
                <p className="text-muted mb-0">Nhấn để upload ảnh</p>
                <small className="text-muted">(Tối đa 5MB)</small>
              </div>
            )}
            {uploadError && <div className="text-danger small mt-2">{uploadError}</div>}
          </div>
        )}
      </Form.Group>

      {/* Points */}
      <Form.Group className="mb-4">
        <Form.Label>Điểm</Form.Label>
        <Form.Control
          type="number"
          min="0"
          step="0.1"
          value={points}
          onChange={(e) => onPointsChange(e.target.value)}
          placeholder="10"
        />
      </Form.Group>

      {/* Explanation */}
      <Form.Group className="mb-4">
        <Form.Label>Giải thích</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={explanation}
          onChange={(e) => onExplanationChange(e.target.value)}
          placeholder="Giải thích đáp án (không bắt buộc)"
        />
      </Form.Group>
    </>
  );
}

