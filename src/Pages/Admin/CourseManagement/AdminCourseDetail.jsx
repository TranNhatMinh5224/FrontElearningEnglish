import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import "./AdminCourseDetail.css";
import { useAuth } from "../../../Context/AuthContext";
import { adminService } from "../../../Services/adminService";
import { mochiCourseTeacher, mochiLessonTeacher } from "../../../Assets/Logo";
import CourseFormModal from "../../../Components/Admin/CourseManagement/CourseFormModal/CourseFormModal";
import CreateLessonModal from "../../../Components/Teacher/CreateLessonModal/CreateLessonModal";
import SuccessModal from "../../../Components/Common/SuccessModal/SuccessModal";
import ConfirmModal from "../../../Components/Common/ConfirmModal/ConfirmModal";
import CourseDescription from "../../../Components/Courses/CourseDescription/CourseDescription";
import { FaPlus, FaTrash } from "react-icons/fa";

export default function AdminCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, roles } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showCreateLessonModal, setShowCreateLessonModal] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [deletingLesson, setDeletingLesson] = useState(false);

  const isAdmin = roles.some(role => ["SuperAdmin", "ContentAdmin"].includes(role));

  const fetchCourseDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Sử dụng endpoint public để lấy thông tin chi tiết course
      const response = await adminService.getCourseContent(courseId);

      if (response.data?.success && response.data?.data) {
        const courseData = response.data.data;
        setCourse(courseData);
      } else {
        setError("Không thể tải thông tin khóa học");
      }
    } catch (err) {
      console.error("Error fetching course detail:", err);
      setError("Không thể tải thông tin khóa học");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const fetchLessons = useCallback(async () => {
    try {
      const response = await adminService.getLessonsByCourse(courseId);
      if (response.data?.success && response.data?.data) {
        const lessonsData = response.data.data;
        setLessons(Array.isArray(lessonsData) ? lessonsData : []);
      } else {
        setLessons([]);
      }
    } catch (err) {
      console.error("Error fetching lessons:", err);
      setLessons([]);
    }
  }, [courseId]);

  const fetchStudentCount = useCallback(async () => {
    try {
      const response = await adminService.getCourseStudents(courseId, { pageNumber: 1, pageSize: 1 });
      if (response.data?.success && response.data?.data) {
        const totalCount = response.data.data.totalCount || response.data.data.TotalCount || 0;
        setStudentCount(totalCount);
      }
    } catch (err) {
      console.error("Error fetching student count:", err);
      setStudentCount(0);
    }
  }, [courseId]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/home");
      return;
    }

    fetchCourseDetail();
    fetchLessons();
    fetchStudentCount();
  }, [isAuthenticated, isAdmin, navigate, courseId, fetchCourseDetail, fetchLessons, fetchStudentCount]);

  const handleUpdateSuccess = () => {
    setSuccessMessage("Cập nhật khóa học thành công!");
    setShowSuccessModal(true);
    fetchCourseDetail();
  };

  const handleCreateLessonSuccess = () => {
    setSuccessMessage("Thêm bài học thành công!");
    setShowSuccessModal(true);
    fetchLessons();
    fetchCourseDetail();
  };

  const handleLessonClick = (lessonId) => {
    navigate(`/admin/courses/${courseId}/lesson/${lessonId}`);
  };

  const handleDeleteLesson = (lesson, e) => {
    e.stopPropagation();
    setLessonToDelete(lesson);
    setShowDeleteModal(true);
  };

  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) return;

    try {
      setDeletingLesson(true);
      const lessonId = lessonToDelete.lessonId || lessonToDelete.LessonId;
      const response = await adminService.deleteLesson(lessonId);

      if (response.status === 204 || response.data?.success) {
        setShowDeleteModal(false);
        setSuccessMessage("Đã xóa bài học thành công!");
        setShowSuccessModal(true);
        fetchLessons();
        fetchCourseDetail();
      }
    } catch (err) {
      console.error("Error deleting lesson:", err);
      alert("Không thể xóa bài học. Vui lòng thử lại.");
    } finally {
      setDeletingLesson(false);
      setLessonToDelete(null);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="admin-course-detail-container">
        <div className="loading-message">Đang tải thông tin khóa học...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="admin-course-detail-container">
        <div className="error-message">{error || "Không tìm thấy khóa học"}</div>
      </div>
    );
  }

  const courseTitle = course.title || course.Title || "Khóa học";
  const courseDescription = course.description || course.Description || "";
  const courseImage = course.imageUrl || course.ImageUrl || mochiCourseTeacher;
  const coursePrice = course.price || course.Price || 0;
  const totalLessons = course.totalLessons || course.TotalLessons || 0;
  const isFeatured = course.isFeatured || course.IsFeatured || false;

  return (
    <div className="admin-course-detail-container">
      <div className="breadcrumb-section">
        <span className="breadcrumb-text">
          <span className="breadcrumb-link" onClick={() => navigate("/admin/courses")}>
            Quản lý khóa học
          </span>
          {" / "}
          <span className="breadcrumb-current">{courseTitle}</span>
        </span>
      </div>

      <Container fluid className="course-detail-content">
        <Row>
          {/* Left Column - Course Info */}
          <Col md={4} className="course-info-column">
            <div className="course-info-card">
              <div className="course-image-wrapper">
                <img
                  src={courseImage}
                  alt={courseTitle}
                  className="course-image"
                />
                {isFeatured && <span className="featured-badge">Nổi bật</span>}
              </div>
              <div className="course-info-content">
                <h2 className="course-title">{courseTitle}</h2>
                <div className="course-info-subsection">
                  <CourseDescription description={courseDescription} />
                </div>

                <div className="course-details">
                  <div className="course-detail-item">
                    <label>Giá:</label>
                    <span className="course-stat-value">
                      {coursePrice === 0 ? "Miễn phí" : `${coursePrice.toLocaleString()} đ`}
                    </span>
                  </div>

                  <div className="course-detail-item">
                    <label>Bài học:</label>
                    <span className="course-stat-value">{totalLessons}</span>
                  </div>

                  <div className="course-detail-item">
                    <label>Tổng số học sinh:</label>
                    <span className="course-stat-value">{studentCount}</span>
                  </div>
                </div>

                <button
                  className="update-course-btn"
                  onClick={() => setShowUpdateModal(true)}
                >
                  Cập nhật khóa học
                </button>
                
                <button
                  className="manage-students-btn"
                  onClick={() => navigate(`/admin/courses/${courseId}/students`)}
                >
                  Quản lý học viên
                </button>
              </div>
            </div>
          </Col>

          {/* Right Column - Lessons List */}
          <Col md={8} className="lessons-column">
            <div className="lessons-section">
              <div className="lessons-header">
                <h3>Danh sách bài học</h3>
              </div>

              {lessons.length > 0 ? (
                <div className="lessons-list">
                  {lessons.map((lesson, index) => {
                    const lessonId = lesson.lessonId || lesson.LessonId;
                    const lessonTitle = lesson.title || lesson.Title || `Lesson ${index + 1}`;
                    const lessonImage = lesson.imageUrl || lesson.ImageUrl || mochiLessonTeacher;
                    const moduleCount = lesson.totalModules || lesson.TotalModules || 0;

                    return (
                      <div key={lessonId || index} className="lesson-item">
                        <div className="lesson-item-content" onClick={() => handleLessonClick(lessonId)}>
                          <img
                            src={lessonImage}
                            alt={lessonTitle}
                            className="lesson-image"
                          />
                          <div className="lesson-info">
                            <span className="lesson-title">{lessonTitle}</span>
                            {moduleCount > 0 && <span className="lesson-modules">{moduleCount} modules</span>}
                          </div>
                        </div>
                        <div className="lesson-actions">
                          <button
                            className="add-module-btn"
                            onClick={() => handleLessonClick(lessonId)}
                          >
                            <FaPlus className="add-icon" />
                            Quản lý Modules
                          </button>
                          <button
                            className="delete-lesson-btn"
                            onClick={(e) => handleDeleteLesson(lesson, e)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-lessons-message">
                  <p>Chưa có bài học nào</p>
                </div>
              )}

              <button
                className="add-lesson-btn"
                onClick={() => setShowCreateLessonModal(true)}
              >
                <FaPlus className="add-icon" />
                Thêm Lesson
              </button>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Update Course Modal */}
      <CourseFormModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateSuccess}
        initialData={{
          ...course,
          courseId: course.courseId || course.CourseId || parseInt(courseId)
        }}
      />

      {/* Create Lesson Modal - Reuse Teacher component */}
      <CreateLessonModal
        show={showCreateLessonModal}
        onClose={() => setShowCreateLessonModal(false)}
        onSuccess={handleCreateLessonSuccess}
        courseId={courseId}
        isAdmin={true}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Thành công"
        message={successMessage}
        autoClose={true}
        autoCloseDelay={2000}
      />
      {/* Confirm Delete Lesson Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setLessonToDelete(null);
        }}
        onConfirm={confirmDeleteLesson}
        title="Xác nhận xóa bài học"
        message="Bạn có chắc chắn muốn xóa bài học này không?"
        itemName={lessonToDelete ? (lessonToDelete.title || lessonToDelete.Title) : ""}
        type="delete"
        confirmText="Xác nhận xóa"
        loading={deletingLesson}
      />    </div>
  );
}
