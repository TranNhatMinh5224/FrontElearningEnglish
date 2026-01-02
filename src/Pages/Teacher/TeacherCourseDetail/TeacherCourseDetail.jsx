import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import "./TeacherCourseDetail.css";
import TeacherHeader from "../../../Components/Header/TeacherHeader";
import { useAuth } from "../../../Context/AuthContext";
import { teacherService } from "../../../Services/teacherService";
import { teacherPackageService } from "../../../Services/teacherPackageService";
import { mochiCourseTeacher, mochiLessonTeacher } from "../../../Assets/Logo";
import CreateCourseModal from "../../../Components/Teacher/CreateCourseModal/CreateCourseModal";
import CreateLessonModal from "../../../Components/Teacher/CreateLessonModal/CreateLessonModal";
import SuccessModal from "../../../Components/Common/SuccessModal/SuccessModal";
import LessonLimitModal from "../../../Components/Common/LessonLimitModal/LessonLimitModal";
import { FaPlus } from "react-icons/fa";
import { ROUTE_PATHS } from "../../../Routes/Paths";

export default function TeacherCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, roles, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCreateLessonModal, setShowCreateLessonModal] = useState(false);
  const [showLessonSuccessModal, setShowLessonSuccessModal] = useState(false);
  const [showLessonLimitModal, setShowLessonLimitModal] = useState(false);
  const [maxLessonsLimit, setMaxLessonsLimit] = useState(0);

  const isTeacher = roles.includes("Teacher") || user?.teacherSubscription?.isTeacher === true;

  useEffect(() => {
    if (!isAuthenticated || !isTeacher) {
      navigate("/home");
      return;
    }

    fetchCourseDetail();
    fetchLessons();
  }, [isAuthenticated, isTeacher, navigate, courseId]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await teacherService.getCourseDetail(courseId);

      if (response.data?.success && response.data?.data) {
        const courseData = response.data.data;
        console.log("Course detail response:", courseData);
        console.log("ImageUrl from API:", courseData.imageUrl || courseData.ImageUrl);
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
  };

  const fetchLessons = async () => {
    try {
      const response = await teacherService.getLessonsByCourse(courseId);
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
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    setShowSuccessModal(true);
    fetchCourseDetail(); // Refresh course data
  };

  const handleCreateLesson = async () => {
    // Check lesson limit before opening modal
    try {
      // Get package info
      const packageResponse = await teacherPackageService.getAll();
      const userPackageLevel = user?.teacherSubscription?.packageLevel;

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
          const maxLessons = matchedPackage.maxLessons || 0;

          // Get current lesson count in this course
          const currentLessonCount = lessons.length || totalLessons || 0;

          if (currentLessonCount >= maxLessons) {
            // Show limit modal
            setMaxLessonsLimit(maxLessons);
            setShowLessonLimitModal(true);
            return;
          }
        }
      }
    } catch (error) {
      console.error("Error checking lesson limit:", error);
    }

    setShowCreateLessonModal(true);
  };

  const handleCreateLessonSuccess = () => {
    setShowCreateLessonModal(false);
    setShowLessonSuccessModal(true);
    fetchLessons(); // Refresh lessons list
    fetchCourseDetail(); // Refresh course data to update totalLessons
  };

  if (!isAuthenticated || !isTeacher) {
    return null;
  }

  if (loading) {
    return (
      <>
        <TeacherHeader />
        <div className="teacher-course-detail-container">
          <div className="loading-message">Đang tải thông tin khóa học....</div>
        </div>
      </>
    );
  }

  if (error || !course) {
    return (
      <>
        <TeacherHeader />
        <div className="teacher-course-detail-container">
          <div className="error-message">{error || "Không tìm thấy khóa học"}</div>
        </div>
      </>
    );
  }

  const courseTitle = course.title || course.Title || "Khóa học";
  const courseDescription = course.description || course.Description || "";
  const courseImage = course.imageUrl || course.ImageUrl || mochiCourseTeacher;
  const classCode = course.classCode || course.ClassCode || "";
  const totalLessons = course.totalLessons || course.TotalLessons || 0;
  const totalStudents = course.totalStudents || course.TotalStudents || 0;

  return (
    <>
      <TeacherHeader />
      <div className="teacher-course-detail-container">
        <div className="breadcrumb-section">
          <span className="breadcrumb-text">
            <span
              className="breadcrumb-link"
              onClick={() => navigate(ROUTE_PATHS.TEACHER_COURSE_MANAGEMENT)}
            >
              Quản lý khoá học
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
                </div>
                <div className="course-info-content">
                  <h2 className="course-title">{courseTitle}</h2>
                  <p className="course-description">{courseDescription}</p>

                  <div className="course-details">
                    <div className="course-detail-item">
                      <label>Mã khóa học:</label>
                      <input
                        type="text"
                        value={classCode}
                        readOnly
                        className="course-code-input"
                      />
                    </div>

                    <div className="course-detail-item">
                      <label>Bài học:</label>
                      <span className="course-stat-value">{totalLessons}</span>
                    </div>

                    <div className="course-detail-item">
                      <label>Tổng số học sinh:</label>
                      <div className="course-stat-with-action">
                        <span className="course-stat-value">{totalStudents}</span>
                        <button
                          className="manage-students-btn"
                          onClick={() => navigate(`/teacher/course/${courseId}/students`)}
                        >
                          Quản lý học viên
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    className="update-course-btn"
                    onClick={() => setShowUpdateModal(true)}
                  >
                    Cập nhật
                  </button>
                </div>
              </div>
            </Col>

            {/* Right Column - Lessons List */}
            <Col md={8} className="lessons-column">
              <div className="lessons-section">
                {lessons.length > 0 ? (
                  lessons.map((lesson, index) => {
                    const lessonId = lesson.lessonId || lesson.LessonId;
                    const lessonTitle = lesson.title || lesson.Title || `Lesson ${index + 1}`;
                    const lessonImage = lesson.imageUrl || lesson.ImageUrl || mochiLessonTeacher;
                    return (
                      <div key={lessonId || index} className="lesson-item">
                        <div className="lesson-item-content">
                          <img
                            src={lessonImage}
                            alt={lessonTitle}
                            className="lesson-image"
                          />
                          <span className="lesson-title">{lessonTitle}</span>
                        </div>
                        <button
                          className="add-module-btn"
                          onClick={() => navigate(`/teacher/course/${courseId}/lesson/${lessonId}`)}
                        >
                          <FaPlus className="add-icon" />
                          Thêm Module
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-lessons-message">Chưa có bài học nào</div>
                )}

                <button
                  className="add-lesson-btn"
                  onClick={handleCreateLesson}
                >
                  <FaPlus className="add-icon" />
                  Thêm Lesson
                </button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Update Course Modal */}
      <CreateCourseModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSuccess={handleUpdateSuccess}
        courseData={{
          ...course,
          courseId: course.courseId || course.CourseId || parseInt(courseId)
        }}
        isUpdateMode={true}
      />

      {/* Success Modal for Course Update */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Cập nhật khóa học thành công"
        message="Khóa học của bạn đã được cập nhật thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />

      {/* Create Lesson Modal */}
      <CreateLessonModal
        show={showCreateLessonModal}
        onClose={() => setShowCreateLessonModal(false)}
        onSuccess={handleCreateLessonSuccess}
        courseId={courseId}
      />

      {/* Success Modal for Lesson Creation */}
      <SuccessModal
        isOpen={showLessonSuccessModal}
        onClose={() => setShowLessonSuccessModal(false)}
        title="Thêm bài học thành công"
        message="Bài học của bạn đã được thêm thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />

      {/* Lesson Limit Modal */}
      <LessonLimitModal
        isOpen={showLessonLimitModal}
        onClose={() => setShowLessonLimitModal(false)}
        maxLessons={maxLessonsLimit}
        onUpgrade={() => {
          setShowLessonLimitModal(false);
          navigate("/home");
        }}
      />
    </>
  );
}

