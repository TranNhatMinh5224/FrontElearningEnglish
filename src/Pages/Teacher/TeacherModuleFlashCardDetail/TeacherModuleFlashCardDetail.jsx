import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import "./TeacherModuleFlashCardDetail.css";
import TeacherHeader from "../../../Components/Header/TeacherHeader";
import { useAuth } from "../../../Context/AuthContext";
import { teacherService } from "../../../Services/teacherService";
import { flashcardService } from "../../../Services/flashcardService";
import { fileService } from "../../../Services/fileService";
import { ROUTE_PATHS } from "../../../Routes/Paths";
import SuccessModal from "../../../Components/Common/SuccessModal/SuccessModal";
import GenerateFlashcardModal from "../../../Components/Teacher/GenerateFlashcardModal/GenerateFlashcardModal";
import LookupWordModal from "../../../Components/Teacher/LookupWordModal/LookupWordModal";
import { FaImage, FaMusic, FaMagic, FaSearch, FaTimes } from "react-icons/fa";

const FLASHCARD_IMAGE_BUCKET = "flashcards";
const FLASHCARD_AUDIO_BUCKET = "flashcard-audio";

export default function TeacherModuleFlashCardDetail() {
  const { courseId, lessonId, moduleId, flashcardId } = useParams();
  const navigate = useNavigate();
  const { user, roles, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [example, setExample] = useState("");
  const [exampleTranslation, setExampleTranslation] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Generate flashcard state
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Lookup word state
  const [showLookupModal, setShowLookupModal] = useState(false);

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

  const isTeacher = roles.includes("Teacher") || user?.teacherSubscription?.isTeacher === true;
  const isEditMode = !!flashcardId;

  useEffect(() => {
    if (!isAuthenticated || !isTeacher) {
      navigate("/home");
      return;
    }

    fetchData();
  }, [isAuthenticated, isTeacher, navigate, courseId, lessonId, moduleId, flashcardId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const promises = [
        teacherService.getCourseDetail(courseId),
        teacherService.getLessonById(lessonId),
        teacherService.getModuleById(moduleId),
      ];

      // If edit mode, fetch flashcard data
      if (isEditMode) {
        promises.push(flashcardService.getTeacherFlashcardById(flashcardId));
      }

      const results = await Promise.all(promises);

      if (results[0].data?.success && results[0].data?.data) {
        setCourse(results[0].data.data);
      }

      if (results[1].data?.success && results[1].data?.data) {
        setLesson(results[1].data.data);
      }

      if (results[2].data?.success && results[2].data?.data) {
        setModule(results[2].data.data);
      } else {
        setError("Không thể tải thông tin module");
      }

      // If edit mode, pre-fill form with flashcard data
      if (isEditMode && results[3]?.data?.success && results[3]?.data?.data) {
        const flashcard = results[3].data.data;
        // Backend returns camelCase field names
        setWord(flashcard.word || flashcard.Word || "");
        setMeaning(flashcard.meaning || flashcard.Meaning || "");
        setPronunciation(flashcard.pronunciation || flashcard.Pronunciation || "");
        setPartOfSpeech(flashcard.partOfSpeech || flashcard.PartOfSpeech || "");
        setExample(flashcard.example || flashcard.Example || "");
        setExampleTranslation(flashcard.exampleTranslation || flashcard.ExampleTranslation || "");
        
        // Set image preview if exists
        if (flashcard.imageUrl || flashcard.ImageUrl) {
          setImagePreview(flashcard.imageUrl || flashcard.ImageUrl);
        }
        
        // Set audio preview if exists
        if (flashcard.audioUrl || flashcard.AudioUrl) {
          setAudioPreview(flashcard.audioUrl || flashcard.AudioUrl);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải thông tin");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!word.trim()) {
      newErrors.word = "Từ vựng là bắt buộc";
    }
    if (!meaning.trim()) {
      newErrors.meaning = "Nghĩa của từ là bắt buộc";
    }
    if (!pronunciation.trim()) {
      newErrors.pronunciation = "Phiên âm là bắt buộc";
    }
    if (!partOfSpeech.trim()) {
      newErrors.partOfSpeech = "Từ loại là bắt buộc";
    }
    if (!imageTempKey && !imagePreview) {
      newErrors.image = "Ảnh là bắt buộc";
    }
    if (!audioTempKey && !audioPreview) {
      newErrors.audio = "Âm thanh là bắt buộc";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle image upload
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
        FLASHCARD_IMAGE_BUCKET,
        "temp"
      );

      if (uploadResponse.data?.success && uploadResponse.data?.data) {
        const resultData = uploadResponse.data.data;
        const tempKey = resultData.TempKey || resultData.tempKey;
        const imageTypeValue = resultData.ImageType || resultData.imageType || file.type;

        if (!tempKey) {
          throw new Error("Không nhận được TempKey từ server");
        }

        setImageTempKey(tempKey);
        setImageType(imageTypeValue);
      } else {
        throw new Error(uploadResponse.data?.message || "Upload ảnh thất bại");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrors({ ...errors, image: error.response?.data?.message || "Có lỗi xảy ra khi upload ảnh" });
      setSelectedImage(null);
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
    if (!file) return;

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

      // Upload file to temp storage
      const uploadResponse = await fileService.uploadTempFile(
        file,
        FLASHCARD_AUDIO_BUCKET,
        "temp"
      );

      if (uploadResponse.data?.success && uploadResponse.data?.data) {
        const resultData = uploadResponse.data.data;
        const tempKey = resultData.TempKey || resultData.tempKey;
        const audioTypeValue = resultData.ImageType || resultData.imageType || resultData.AudioType || resultData.audioType || file.type;

        if (!tempKey) {
          throw new Error("Không nhận được TempKey từ server");
        }

        setAudioTempKey(tempKey);
        setAudioType(audioTypeValue);
      } else {
        throw new Error(uploadResponse.data?.message || "Upload âm thanh thất bại");
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
      setErrors({ ...errors, audio: error.response?.data?.message || "Có lỗi xảy ra khi upload âm thanh" });
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

  // Handle generate flashcard success - fill form with generated data
  const handleGenerateSuccess = (generatedData) => {
    // Auto-fill form with generated data (only if not null/empty)
    if (generatedData.word) setWord(generatedData.word);
    if (generatedData.meaning) setMeaning(generatedData.meaning);
    if (generatedData.pronunciation) setPronunciation(generatedData.pronunciation);
    if (generatedData.partOfSpeech) setPartOfSpeech(generatedData.partOfSpeech);
    if (generatedData.example) setExample(generatedData.example);
    if (generatedData.exampleTranslation) setExampleTranslation(generatedData.exampleTranslation);

    // Handle image
    if (generatedData.imageUrl || generatedData.imageTempKey) {
      setImagePreview(generatedData.imageUrl || generatedData.ImageUrl);
      if (generatedData.imageTempKey || generatedData.ImageTempKey) {
        setImageTempKey(generatedData.imageTempKey || generatedData.ImageTempKey);
        setImageType(generatedData.imageType || generatedData.ImageType || "image/jpeg");
      }
    }

    // Handle audio
    if (generatedData.audioUrl || generatedData.audioTempKey) {
      setAudioPreview(generatedData.audioUrl || generatedData.AudioUrl);
      if (generatedData.audioTempKey || generatedData.AudioTempKey) {
        setAudioTempKey(generatedData.audioTempKey || generatedData.AudioTempKey);
        setAudioType(generatedData.audioType || generatedData.AudioType || "audio/mpeg");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const flashcardData = {
        word: word.trim(),
        meaning: meaning.trim(),
        pronunciation: pronunciation.trim() || null,
        partOfSpeech: partOfSpeech.trim() || null,
        example: example.trim() || null,
        exampleTranslation: exampleTranslation.trim() || null,
        imageTempKey: imageTempKey || null,
        audioTempKey: audioTempKey || null,
        imageType: imageType || null,
        audioType: audioType || null,
      };

      let response;
      if (isEditMode) {
        // Update flashcard
        response = await flashcardService.updateFlashcard(flashcardId, flashcardData);
      } else {
        // Create flashcard
        flashcardData.moduleId = parseInt(moduleId);
        response = await flashcardService.createFlashcard(flashcardData);
      }

      if (response.data?.success) {
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate(ROUTE_PATHS.TEACHER_LESSON_DETAIL(courseId, lessonId));
        }, 1500);
      } else {
        throw new Error(response.data?.message || (isEditMode ? "Cập nhật flashcard thất bại" : "Tạo flashcard thất bại"));
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} flashcard:`, error);
      setErrors({ submit: error.response?.data?.message || error.message || `Có lỗi xảy ra khi ${isEditMode ? 'cập nhật' : 'tạo'} flashcard` });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated || !isTeacher) {
    return null;
  }

  if (loading) {
    return (
      <>
        <TeacherHeader />
        <div className="teacher-module-flashcard-detail-container">
          <div className="loading-message">Đang tải thông tin...</div>
        </div>
      </>
    );
  }

  if (error || !module) {
    return (
      <>
        <TeacherHeader />
        <div className="teacher-module-flashcard-detail-container">
          <div className="error-message">{error || "Không tìm thấy module"}</div>
        </div>
      </>
    );
  }

  const courseTitle = course?.title || course?.Title || courseId;
  const lessonTitle = lesson?.title || lesson?.Title || "Bài học";

  return (
    <>
      <TeacherHeader />
      <div className="teacher-module-flashcard-detail-container">
        <div className="breadcrumb-section">
          <span className="breadcrumb-text">
            <span
              className="breadcrumb-link"
              onClick={() => navigate(ROUTE_PATHS.TEACHER_COURSE_MANAGEMENT)}
            >
              Quản lý khoá học
            </span>
            {" / "}
            <span
              className="breadcrumb-link"
              onClick={() => navigate(`/teacher/course/${courseId}`)}
            >
              {courseTitle}
            </span>
            {" / "}
            <span
              className="breadcrumb-link"
              onClick={() => navigate(ROUTE_PATHS.TEACHER_LESSON_DETAIL(courseId, lessonId))}
            >
              {lessonTitle}
            </span>
            {" / "}
            <span className="breadcrumb-current">{isEditMode ? "Sửa Flashcard" : "Tạo Flashcard"}</span>
          </span>
        </div>

        <Container fluid className="create-flashcard-content">
          <div className="create-flashcard-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="page-title mb-0">{isEditMode ? "Sửa Flashcard" : "Tạo Flashcard"}</h1>
              {!isEditMode && (
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-info d-flex align-items-center gap-2"
                    onClick={() => setShowLookupModal(true)}
                  >
                    <FaSearch /> Tra từ
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                    onClick={() => setShowGenerateModal(true)}
                  >
                    <FaMagic /> Gen Flashcard
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <div className="form-group">
                    <label className="form-label required">Từ vựng</label>
                    <input
                      type="text"
                      className={`form-control ${errors.word ? "is-invalid" : ""}`}
                      value={word}
                      onChange={(e) => {
                        setWord(e.target.value);
                        setErrors({ ...errors, word: null });
                      }}
                      placeholder="Nhập từ vựng"
                    />
                    {errors.word && <div className="invalid-feedback">{errors.word}</div>}
                    <div className="form-hint">*Bắt buộc</div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="form-group">
                    <label className="form-label required">Phiên âm</label>
                    <input
                      type="text"
                      className={`form-control ${errors.pronunciation ? "is-invalid" : ""}`}
                      value={pronunciation}
                      onChange={(e) => {
                        setPronunciation(e.target.value);
                        setErrors({ ...errors, pronunciation: null });
                      }}
                      placeholder="Nhập phiên âm (ví dụ: /wɜːrd/)"
                    />
                    {errors.pronunciation && <div className="invalid-feedback">{errors.pronunciation}</div>}
                    <div className="form-hint">*Bắt buộc</div>
                  </div>
                </Col>
              </Row>

              <div className="form-group">
                <label className="form-label required">Nghĩa</label>
                <textarea
                  className={`form-control ${errors.meaning ? "is-invalid" : ""}`}
                  value={meaning}
                  onChange={(e) => {
                    setMeaning(e.target.value);
                    setErrors({ ...errors, meaning: null });
                  }}
                  placeholder="Nhập nghĩa của từ"
                  rows={2}
                />
                {errors.meaning && <div className="invalid-feedback">{errors.meaning}</div>}
                <div className="form-hint">*Bắt buộc</div>
              </div>

              <Row>
                <Col md={6}>
                  <div className="form-group">
                    <label className="form-label required">Từ loại</label>
                    <input
                      type="text"
                      className={`form-control ${errors.partOfSpeech ? "is-invalid" : ""}`}
                      value={partOfSpeech}
                      onChange={(e) => {
                        setPartOfSpeech(e.target.value);
                        setErrors({ ...errors, partOfSpeech: null });
                      }}
                      placeholder="Nhập từ loại (ví dụ: noun, verb, adjective)"
                    />
                    {errors.partOfSpeech && <div className="invalid-feedback">{errors.partOfSpeech}</div>}
                    <div className="form-hint">*Bắt buộc</div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="form-group">
                    <label className="form-label required">Ảnh</label>
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
                    <div className="form-hint">*Bắt buộc</div>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <div className="form-group">
                    <label className="form-label required">Âm thanh</label>
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
                    <div className="form-hint">*Bắt buộc</div>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <div className="form-group">
                    <label className="form-label">Ví dụ</label>
                    <textarea
                      className="form-control"
                      value={example}
                      onChange={(e) => setExample(e.target.value)}
                      placeholder="Nhập câu ví dụ"
                      rows={2}
                    />
                    <div className="form-hint">Không bắt buộc</div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="form-group">
                    <label className="form-label">Nghĩa ví dụ</label>
                    <textarea
                      className="form-control"
                      value={exampleTranslation}
                      onChange={(e) => setExampleTranslation(e.target.value)}
                      placeholder="Nhập nghĩa của câu ví dụ"
                      rows={2}
                    />
                    <div className="form-hint">Không bắt buộc</div>
                  </div>
                </Col>
              </Row>

              {errors.submit && (
                <div className="alert alert-danger mt-3">{errors.submit}</div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate(ROUTE_PATHS.TEACHER_LESSON_DETAIL(courseId, lessonId))}
                  disabled={submitting}
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    !word.trim() || 
                    !meaning.trim() || 
                    !pronunciation.trim() || 
                    !partOfSpeech.trim() || 
                    (!imageTempKey && !imagePreview) || 
                    (!audioTempKey && !audioPreview) || 
                    submitting ||
                    uploadingImage ||
                    uploadingAudio
                  }
                >
                  {submitting ? (isEditMode ? "Đang cập nhật..." : "Đang tạo...") : (isEditMode ? "Cập nhật" : "Tạo")}
                </button>
              </div>
            </form>
          </div>
        </Container>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={isEditMode ? "Cập nhật flashcard thành công" : "Tạo flashcard thành công"}
        message={isEditMode ? "Flashcard của bạn đã được cập nhật thành công!" : "Flashcard của bạn đã được tạo thành công!"}
        autoClose={true}
        autoCloseDelay={1500}
      />

      {/* Generate Flashcard Modal */}
      <GenerateFlashcardModal
        show={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleGenerateSuccess}
      />

      {/* Lookup Word Modal */}
      <LookupWordModal
        show={showLookupModal}
        onClose={() => setShowLookupModal(false)}
      />
    </>
  );
}

