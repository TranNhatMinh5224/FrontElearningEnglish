import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import "./TeacherModuleAssessmentDetail.css";
import TeacherHeader from "../../../Components/Header/TeacherHeader";
import { useAuth } from "../../../Context/AuthContext";
import { teacherService } from "../../../Services/teacherService";
import { assessmentService } from "../../../Services/assessmentService";
import { ROUTE_PATHS } from "../../../Routes/Paths";
import SuccessModal from "../../../Components/Common/SuccessModal/SuccessModal";

export default function TeacherModuleAssessmentDetail() {
  const { courseId, lessonId, moduleId, assessmentId } = useParams();
  const navigate = useNavigate();
  const { user, roles, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [totalPoints, setTotalPoints] = useState(100);
  const [passingScore, setPassingScore] = useState(60);
  const [isPublished, setIsPublished] = useState(false);
  const [openAt, setOpenAt] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAssessmentId, setCreatedAssessmentId] = useState(null);

  const isTeacher = roles.includes("Teacher") || user?.teacherSubscription?.isTeacher === true;
  const isEditMode = !!assessmentId;

  useEffect(() => {
    if (!isAuthenticated || !isTeacher) {
      navigate("/home");
      return;
    }

    fetchData();
  }, [isAuthenticated, isTeacher, navigate, courseId, lessonId, moduleId, assessmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const promises = [
        teacherService.getCourseDetail(courseId),
        teacherService.getLessonById(lessonId),
        teacherService.getModuleById(moduleId),
      ];

      // If edit mode, fetch assessment data
      if (isEditMode) {
        promises.push(assessmentService.getTeacherAssessmentById(assessmentId));
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

      // If edit mode, pre-fill form with assessment data
      if (isEditMode && results[3]?.data?.success && results[3]?.data?.data) {
        const assessment = results[3].data.data;
        setTitle(assessment.title || assessment.Title || "");
        setDescription(assessment.description || assessment.Description || "");
        setTimeLimit(assessment.timeLimit || assessment.TimeLimit || "");
        setTotalPoints(assessment.totalPoints || assessment.TotalPoints || 100);
        setPassingScore(assessment.passingScore || assessment.PassingScore || 60);
        setIsPublished(assessment.isPublished || assessment.IsPublished || false);

        // Format dates for input fields (YYYY-MM-DDTHH:mm)
        if (assessment.openAt || assessment.OpenAt) {
          const openDate = new Date(assessment.openAt || assessment.OpenAt);
          setOpenAt(openDate.toISOString().slice(0, 16));
        }
        if (assessment.dueAt || assessment.DueAt) {
          const dueDate = new Date(assessment.dueAt || assessment.DueAt);
          setDueAt(dueDate.toISOString().slice(0, 16));
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
    if (!title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    }
    if (totalPoints <= 0) {
      newErrors.totalPoints = "Tổng điểm phải lớn hơn 0";
    }
    if (passingScore < 0 || passingScore > 100) {
      newErrors.passingScore = "Điểm đạt phải từ 0 đến 100";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const assessmentData = {
        moduleId: parseInt(moduleId), // Required for both create and update
        title: title.trim(),
        description: description.trim() || null,
        timeLimit: timeLimit.trim() || null,
        totalPoints: totalPoints,
        passingScore: passingScore,
        isPublished: isPublished,
        openAt: openAt ? new Date(openAt).toISOString() : null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      };

      let response;
      if (isEditMode) {
        // Update assessment
        response = await assessmentService.updateAssessment(assessmentId, assessmentData);
      } else {
        // Create assessment
        response = await assessmentService.createAssessment(assessmentData);
      }

      if (response.data?.success) {
        if (isEditMode) {
          setShowSuccessModal(true);
          setTimeout(() => {
            navigate(ROUTE_PATHS.TEACHER_LESSON_DETAIL(courseId, lessonId));
          }, 1500);
        } else {
          const newAssessmentId = response.data.data?.assessmentId || response.data.data?.AssessmentId;
          setCreatedAssessmentId(newAssessmentId);
          setShowSuccessModal(true);
          // Sau khi tạo thành công, chuyển đến trang chọn Essay/Quiz
          setTimeout(() => {
            navigate(ROUTE_PATHS.TEACHER_ASSESSMENT_TYPE_SELECTION(courseId, lessonId, moduleId, newAssessmentId));
          }, 1500);
        }
      } else {
        throw new Error(response.data?.message || (isEditMode ? "Cập nhật assessment thất bại" : "Tạo assessment thất bại"));
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} assessment:`, error);
      setErrors({ submit: error.response?.data?.message || error.message || `Có lỗi xảy ra khi ${isEditMode ? 'cập nhật' : 'tạo'} assessment` });
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
        <div className="teacher-module-assessment-detail-container">
          <div className="loading-message">Đang tải thông tin...</div>
        </div>
      </>
    );
  }

  if (error || !module) {
    return (
      <>
        <TeacherHeader />
        <div className="teacher-module-assessment-detail-container">
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
      <div className="teacher-module-assessment-detail-container">
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
            <span className="breadcrumb-current">{isEditMode ? "Sửa Assessment" : "Tạo Assessment"}</span>
          </span>
        </div>

        <Container fluid className="create-assessment-content">
          <div className="create-assessment-card">
            <h1 className="page-title">{isEditMode ? "Sửa Assessment" : "Tạo Assessment"}</h1>

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
                  placeholder="Nhập tiêu đề assessment"
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                <div className="form-hint">*Bắt buộc</div>
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả assessment"
                  rows={4}
                />
                <div className="form-hint">Không bắt buộc</div>
              </div>

              <div className="form-group">
                <label className="form-label">Thời gian giới hạn (HH:MM:SS)</label>
                <input
                  type="text"
                  className="form-control"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  placeholder="Ví dụ: 01:30:00 (1 giờ 30 phút)"
                />
                <div className="form-hint">Không bắt buộc. Định dạng: HH:MM:SS</div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Tổng điểm</label>
                  <input
                    type="number"
                    className={`form-control ${errors.totalPoints ? "is-invalid" : ""}`}
                    value={totalPoints}
                    onChange={(e) => {
                      setTotalPoints(parseFloat(e.target.value) || 0);
                      setErrors({ ...errors, totalPoints: null });
                    }}
                    min="0"
                    step="0.1"
                  />
                  {errors.totalPoints && <div className="invalid-feedback">{errors.totalPoints}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label required">Điểm đạt (%)</label>
                  <input
                    type="number"
                    className={`form-control ${errors.passingScore ? "is-invalid" : ""}`}
                    value={passingScore}
                    onChange={(e) => {
                      setPassingScore(parseInt(e.target.value) || 0);
                      setErrors({ ...errors, passingScore: null });
                    }}
                    min="0"
                    max="100"
                  />
                  {errors.passingScore && <div className="invalid-feedback">{errors.passingScore}</div>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Đã xuất bản
                </label>
                <div className="form-hint">Đánh dấu nếu assessment đã sẵn sàng để học sinh làm</div>
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
                  disabled={!title.trim() || totalPoints <= 0 || passingScore < 0 || passingScore > 100 || submitting}
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
        title={isEditMode ? "Cập nhật assessment thành công" : "Tạo assessment thành công"}
        message={isEditMode ? "Assessment của bạn đã được cập nhật thành công!" : "Assessment của bạn đã được tạo thành công!"}
        autoClose={true}
        autoCloseDelay={1500}
      />
    </>
  );
}

