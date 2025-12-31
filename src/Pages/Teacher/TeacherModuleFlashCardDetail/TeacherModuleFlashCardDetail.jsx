import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import "./TeacherModuleFlashCardDetail.css";
import TeacherHeader from "../../../Components/Header/TeacherHeader";
import { useAuth } from "../../../Context/AuthContext";
import { teacherService } from "../../../Services/teacherService";
import { flashcardService } from "../../../Services/flashcardService";
import { ROUTE_PATHS } from "../../../Routes/Paths";
import SuccessModal from "../../../Components/Common/SuccessModal/SuccessModal";

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
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
            <h1 className="page-title">{isEditMode ? "Sửa Flashcard" : "Tạo Flashcard"}</h1>

            <form onSubmit={handleSubmit}>
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
                  rows={3}
                />
                {errors.meaning && <div className="invalid-feedback">{errors.meaning}</div>}
                <div className="form-hint">*Bắt buộc</div>
              </div>

              <div className="form-group">
                <label className="form-label">Phiên âm</label>
                <input
                  type="text"
                  className="form-control"
                  value={pronunciation}
                  onChange={(e) => setPronunciation(e.target.value)}
                  placeholder="Nhập phiên âm (ví dụ: /wɜːrd/)"
                />
                <div className="form-hint">Không bắt buộc</div>
              </div>

              <div className="form-group">
                <label className="form-label">Từ loại</label>
                <input
                  type="text"
                  className="form-control"
                  value={partOfSpeech}
                  onChange={(e) => setPartOfSpeech(e.target.value)}
                  placeholder="Nhập từ loại (ví dụ: noun, verb, adjective)"
                />
                <div className="form-hint">Không bắt buộc</div>
              </div>

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
                  disabled={!word.trim() || !meaning.trim() || submitting}
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
    </>
  );
}

