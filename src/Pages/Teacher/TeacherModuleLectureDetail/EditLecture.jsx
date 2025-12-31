import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import "./TeacherModuleLectureDetail.css";
import TeacherHeader from "../../../Components/Header/TeacherHeader";
import { useAuth } from "../../../Context/AuthContext";
import { teacherService } from "../../../Services/teacherService";
import { lectureService } from "../../../Services/lectureService";
import { ROUTE_PATHS } from "../../../Routes/Paths";
import SuccessModal from "../../../Components/Common/SuccessModal/SuccessModal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const LECTURE_TYPES = [
  { value: 1, label: "Content" },
  { value: 2, label: "Video" },
  { value: 3, label: "Audio" },
  { value: 4, label: "Document" },
  { value: 5, label: "Interactive" },
];

export default function EditLecture() {
  const { courseId, lessonId, moduleId, lectureId } = useParams();
  const navigate = useNavigate();
  const { user, roles, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [lectureType, setLectureType] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isTeacher = roles.includes("Teacher") || user?.teacherSubscription?.isTeacher === true;

  useEffect(() => {
    if (!isAuthenticated || !isTeacher) {
      navigate("/home");
      return;
    }

    fetchData();
  }, [isAuthenticated, isTeacher, navigate, courseId, lessonId, moduleId, lectureId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [courseRes, lessonRes, moduleRes, lectureRes] = await Promise.all([
        teacherService.getCourseDetail(courseId),
        teacherService.getLessonById(lessonId),
        teacherService.getModuleById(moduleId),
        lectureService.getTeacherLectureById(lectureId),
      ]);

      if (courseRes.data?.success && courseRes.data?.data) {
        setCourse(courseRes.data.data);
      }

      if (lessonRes.data?.success && lessonRes.data?.data) {
        setLesson(lessonRes.data.data);
      }

      if (moduleRes.data?.success && moduleRes.data?.data) {
        setModule(moduleRes.data.data);
      } else {
        setError("Không thể tải thông tin module");
      }

      // Load lecture data
      if (lectureRes.data?.success && lectureRes.data?.data) {
        const lectureData = lectureRes.data.data;
        setTitle(lectureData.title || lectureData.Title || "");
        setMarkdownContent(lectureData.markdownContent || lectureData.MarkdownContent || "");
        setLectureType(lectureData.type || lectureData.Type || 1);
      } else {
        setError("Không thể tải thông tin lecture");
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
    if (!title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const lectureData = {
        title: title.trim(),
        markdownContent: markdownContent.trim() || null,
        type: lectureType,
      };

      const response = await lectureService.updateLecture(lectureId, lectureData);

      if (response.data?.success) {
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate(ROUTE_PATHS.TEACHER_LESSON_DETAIL(courseId, lessonId));
        }, 1500);
      } else {
        throw new Error(response.data?.message || "Cập nhật lecture thất bại");
      }
    } catch (error) {
      console.error("Error updating lecture:", error);
      setErrors({ submit: error.response?.data?.message || error.message || "Có lỗi xảy ra khi cập nhật lecture" });
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
        <div className="teacher-module-lecture-detail-container">
          <div className="loading-message">Đang tải thông tin...</div>
        </div>
      </>
    );
  }

  if (error || !module) {
    return (
      <>
        <TeacherHeader />
        <div className="teacher-module-lecture-detail-container">
          <div className="error-message">{error || "Không tìm thấy module"}</div>
        </div>
      </>
    );
  }

  const courseTitle = course?.title || course?.Title || courseId;
  const lessonTitle = lesson?.title || lesson?.Title || "Bài học";
  const moduleName = module.name || module.Name || "Module";

  return (
    <>
      <TeacherHeader />
      <div className="teacher-module-lecture-detail-container">
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
            <span className="breadcrumb-current">Sửa Lecture</span>
          </span>
        </div>

        <Container fluid className="create-lecture-content">
          <div className="create-lecture-card">
            <h1 className="page-title">Sửa Lecture</h1>

            <form onSubmit={handleSubmit}>
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
                  placeholder="Nhập tiêu đề lecture"
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                <div className="form-hint">*Bắt buộc</div>
              </div>

              <div className="form-group">
                <label className="form-label">Loại lecture</label>
                <select
                  className="form-control"
                  value={lectureType}
                  onChange={(e) => setLectureType(parseInt(e.target.value))}
                >
                  {LECTURE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nội dung (Markdown)</label>
                <div className="markdown-editor-container">
                  <div className="markdown-editor-left">
                    <textarea
                      className={`markdown-textarea ${errors.markdownContent ? "is-invalid" : ""}`}
                      value={markdownContent}
                      onChange={(e) => {
                        setMarkdownContent(e.target.value);
                        setErrors({ ...errors, markdownContent: null });
                      }}
                      placeholder={`Nhập nội dung lecture bằng Markdown

Ví dụ:
# Tiêu đề

Đây là nội dung lecture...

- Điểm 1
- Điểm 2`}
                    />
                  </div>
                  <div className="markdown-editor-right">
                    <div className="markdown-preview">
                      {markdownContent.trim() ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {markdownContent}
                        </ReactMarkdown>
                      ) : (
                        <div className="markdown-preview-empty">
                          <p>Xem trước nội dung sẽ hiển thị ở đây...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-hint">Không bắt buộc. Sử dụng Markdown để định dạng văn bản</div>
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
                  disabled={!title.trim() || submitting}
                >
                  {submitting ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </Container>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Cập nhật lecture thành công"
        message="Lecture của bạn đã được cập nhật thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />
    </>
  );
}

