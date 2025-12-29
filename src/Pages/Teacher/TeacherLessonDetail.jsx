import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import "./TeacherLessonDetail.css";
import TeacherHeader from "../../Components/Header/TeacherHeader";
import { useAuth } from "../../Context/AuthContext";
import { teacherService } from "../../Services/teacherService";
import { mochiLessonTeacher, mochiModuleTeacher } from "../../Assets/Logo";
import CreateLessonModal from "../../Components/Teacher/CreateLessonModal/CreateLessonModal";
import CreateModuleModal from "../../Components/Teacher/CreateModuleModal/CreateModuleModal";
import SuccessModal from "../../Components/Common/SuccessModal/SuccessModal";
import { FaPlus } from "react-icons/fa";
import { ROUTE_PATHS } from "../../Routes/Paths";

export default function TeacherLessonDetail() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user, roles, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
  const [showModuleSuccessModal, setShowModuleSuccessModal] = useState(false);

  const isTeacher = roles.includes("Teacher") || user?.teacherSubscription?.isTeacher === true;

  useEffect(() => {
    if (!isAuthenticated || !isTeacher) {
      navigate("/home");
      return;
    }

    fetchCourseDetail();
    fetchLessonDetail();
    fetchModules();
  }, [isAuthenticated, isTeacher, navigate, courseId, lessonId]);

  const fetchCourseDetail = async () => {
    try {
      const response = await teacherService.getCourseDetail(courseId);
      if (response.data?.success && response.data?.data) {
        setCourse(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching course detail:", err);
    }
  };

  const fetchLessonDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await teacherService.getLessonById(lessonId);

      if (response.data?.success && response.data?.data) {
        setLesson(response.data.data);
      } else {
        setError("Không thể tải thông tin bài học");
      }
    } catch (err) {
      console.error("Error fetching lesson detail:", err);
      setError("Không thể tải thông tin bài học");
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await teacherService.getModulesByLesson(lessonId);
      if (response.data?.success && response.data?.data) {
        const modulesData = response.data.data;
        setModules(Array.isArray(modulesData) ? modulesData : []);
      } else {
        setModules([]);
      }
    } catch (err) {
      console.error("Error fetching modules:", err);
      setModules([]);
    }
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    setShowSuccessModal(true);
    fetchLessonDetail(); // Refresh lesson data
  };

  const handleCreateModuleSuccess = () => {
    setShowCreateModuleModal(false);
    setShowModuleSuccessModal(true);
    fetchModules(); // Refresh modules list
  };

  if (!isAuthenticated || !isTeacher) {
    return null;
  }

  if (loading) {
    return (
      <>
        <TeacherHeader />
        <div className="teacher-lesson-detail-container">
          <div className="loading-message">Đang tải thông tin bài học...</div>
        </div>
      </>
    );
  }

  if (error || !lesson) {
    return (
      <>
        <TeacherHeader />
        <div className="teacher-lesson-detail-container">
          <div className="error-message">{error || "Không tìm thấy bài học"}</div>
        </div>
      </>
    );
  }

  const lessonTitle = lesson.title || lesson.Title || "Bài học";
  const lessonDescription = lesson.description || lesson.Description || "";
  const lessonImage = lesson.imageUrl || lesson.ImageUrl || mochiLessonTeacher;

  return (
    <>
      <TeacherHeader />
      <div className="teacher-lesson-detail-container">
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
              {course?.title || course?.Title || courseId}
            </span>
            {" / "}
            <span className="breadcrumb-current">{lessonTitle}</span>
          </span>
        </div>

        <Container fluid className="lesson-detail-content">
          <Row>
            {/* Left Column - Lesson Info */}
            <Col md={4} className="lesson-info-column">
              <div className="lesson-info-card">
                <div className="lesson-image-wrapper">
                  <img 
                    src={lessonImage} 
                    alt={lessonTitle}
                    className="lesson-image-main"
                  />
                </div>
                <div className="lesson-info-content">
                  <h2 className="lesson-title">{lessonTitle}</h2>
                  <p className="lesson-description">{lessonDescription}</p>
                  
                  <button 
                    className="update-lesson-btn"
                    onClick={() => setShowUpdateModal(true)}
                  >
                    Cập nhật
                  </button>
                </div>
              </div>
            </Col>

            {/* Right Column - Modules List */}
            <Col md={8} className="modules-column">
              <div className="modules-section">
                {modules.length > 0 ? (
                  modules.map((module, index) => {
                    const moduleId = module.moduleId || module.ModuleId;
                    const moduleName = module.name || module.Name || `Module ${index + 1}`;
                    const moduleImage = module.imageUrl || module.ImageUrl || mochiModuleTeacher;
                    
                    // Get contentType - could be number (enum) or string (ContentTypeName)
                    const contentTypeValue = module.contentType || module.ContentType;
                    const contentTypeName = module.contentTypeName || module.ContentTypeName;
                    
                    // Map enum number to name if needed
                    const contentTypeMap = {
                      1: "Lecture",
                      2: "Quiz",
                      3: "Assignment",
                      4: "FlashCard",
                      5: "Video",
                      6: "Reading"
                    };
                    
                    const displayContentType = contentTypeName || contentTypeMap[contentTypeValue] || contentTypeValue || "Unknown";
                    
                    return (
                      <div key={moduleId || index} className="module-item">
                        <div className="module-item-content">
                          <img 
                            src={moduleImage} 
                            alt={moduleName}
                            className="module-image"
                          />
                          <div className="module-info">
                            <span className="module-name">{moduleName}</span>
                            <span className="module-type">{displayContentType}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-modules-message">Chưa có module nào</div>
                )}
                
                <button 
                  className="add-module-btn-main"
                  onClick={() => setShowCreateModuleModal(true)}
                >
                  <FaPlus className="add-icon" />
                  Thêm Module
                </button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Update Lesson Modal */}
      <CreateLessonModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSuccess={handleUpdateSuccess}
        courseId={courseId}
        lessonData={{
          ...lesson,
          lessonId: lesson.lessonId || lesson.LessonId || parseInt(lessonId)
        }}
        isUpdateMode={true}
      />

      {/* Success Modal for Lesson Update */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Cập nhật bài học thành công"
        message="Bài học của bạn đã được cập nhật thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />

      {/* Create Module Modal */}
      <CreateModuleModal
        show={showCreateModuleModal}
        onClose={() => setShowCreateModuleModal(false)}
        onSuccess={handleCreateModuleSuccess}
        lessonId={lessonId}
      />

      {/* Success Modal for Module Creation */}
      <SuccessModal
        isOpen={showModuleSuccessModal}
        onClose={() => setShowModuleSuccessModal(false)}
        title="Thêm module thành công"
        message="Module của bạn đã được thêm thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />
    </>
  );
}

