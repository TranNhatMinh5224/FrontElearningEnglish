import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import "./TeacherLessonDetail.css";
import TeacherHeader from "../../Components/Header/TeacherHeader";
import { useAuth } from "../../Context/AuthContext";
import { teacherService } from "../../Services/teacherService";
import { lectureService } from "../../Services/lectureService";
import { mochiLessonTeacher, mochiModuleTeacher } from "../../Assets/Logo";
import CreateLessonModal from "../../Components/Teacher/CreateLessonModal/CreateLessonModal";
import CreateModuleModal from "../../Components/Teacher/CreateModuleModal/CreateModuleModal";
import SuccessModal from "../../Components/Common/SuccessModal/SuccessModal";
import { FaPlus, FaArrowLeft, FaEdit } from "react-icons/fa";
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
  const [showUpdateModuleModal, setShowUpdateModuleModal] = useState(false);
  const [moduleToUpdate, setModuleToUpdate] = useState(null);
  const [loadingModuleDetail, setLoadingModuleDetail] = useState(false);
  const [showModuleSuccessModal, setShowModuleSuccessModal] = useState(false);
  const [showUpdateModuleSuccessModal, setShowUpdateModuleSuccessModal] = useState(false);

  // Module content state
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleContent, setModuleContent] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentError, setContentError] = useState("");

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
        const modulesList = Array.isArray(modulesData) ? modulesData : [];

        // Fetch imageUrl cho từng module từ API chi tiết
        const modulesWithImages = await Promise.all(
          modulesList.map(async (module) => {
            try {
              const moduleId = module.moduleId || module.ModuleId;
              const detailResponse = await teacherService.getModuleById(moduleId);

              if (detailResponse.data?.success && detailResponse.data?.data) {
                const detailData = detailResponse.data.data;
                // Merge imageUrl từ detail vào module
                return {
                  ...module,
                  imageUrl: detailData.imageUrl || detailData.ImageUrl || module.imageUrl || module.ImageUrl,
                  ImageUrl: detailData.imageUrl || detailData.ImageUrl || module.imageUrl || module.ImageUrl,
                };
              }
              return module;
            } catch (err) {
              console.error(`Error fetching module ${module.moduleId || module.ModuleId} detail:`, err);
              return module;
            }
          })
        );

        setModules(modulesWithImages);
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

  // Handle module click - fetch lectures if it's a Lecture module
  const handleModuleClick = async (module) => {
    const contentTypeValue = module.contentType || module.ContentType;
    const contentTypeNum = typeof contentTypeValue === 'number' ? contentTypeValue : parseInt(contentTypeValue);

    if (contentTypeNum === 1) {
      // Lecture module - fetch lectures
      setSelectedModule(module);
      setLoadingContent(true);
      setContentError("");

      try {
        const moduleId = module.moduleId || module.ModuleId;
        const response = await lectureService.getTeacherLecturesByModule(moduleId);

        if (response.data?.success && response.data?.data) {
          setModuleContent(response.data.data || []);
        } else {
          setContentError("Không thể tải danh sách lectures");
          setModuleContent([]);
        }
      } catch (error) {
        console.error("Error fetching lectures:", error);
        setContentError("Có lỗi xảy ra khi tải danh sách lectures");
        setModuleContent([]);
      } finally {
        setLoadingContent(false);
      }
    }
  };

  // Handle back to modules list
  const handleBackToModules = () => {
    setSelectedModule(null);
    setModuleContent([]);
    setContentError("");
  };

  // Handle edit lecture
  const handleEditLecture = (lecture) => {
    const lectureId = lecture.lectureId || lecture.LectureId;
    const moduleId = selectedModule.moduleId || selectedModule.ModuleId;
    navigate(ROUTE_PATHS.TEACHER_EDIT_LECTURE(courseId, lessonId, moduleId, lectureId));
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

            {/* Right Column - Modules List or Module Content */}
            <Col md={8} className="modules-column">
              {selectedModule ? (
                // Module Content View (Lectures List)
                <div className="modules-section">
                  <div className="module-content-header">
                    <button
                      className="back-to-modules-btn"
                      onClick={handleBackToModules}
                    >
                      <FaArrowLeft className="back-icon" />
                      Quay lại
                    </button>
                    <h3 className="module-content-title">
                      {selectedModule.name || selectedModule.Name || "Module"}
                    </h3>
                  </div>

                  {loadingContent ? (
                    <div className="loading-message">Đang tải danh sách lectures...</div>
                  ) : contentError ? (
                    <div className="error-message">{contentError}</div>
                  ) : (
                    <>
                      <div className="module-content-list">
                        {moduleContent.length > 0 ? (
                          moduleContent.map((lecture, index) => {
                            const lectureId = lecture.lectureId || lecture.LectureId;
                            const lectureTitle = lecture.title || lecture.Title || `Lecture ${index + 1}`;
                            const lectureDescription = lecture.markdownContent || lecture.MarkdownContent || "";

                            return (
                              <div key={lectureId || index} className="content-item">
                                <div className="content-item-info">
                                  <h4 className="content-item-title">{lectureTitle}</h4>
                                  {lectureDescription && (
                                    <p className="content-item-description">
                                      {lectureDescription.length > 100
                                        ? lectureDescription.substring(0, 100) + "..."
                                        : lectureDescription}
                                    </p>
                                  )}
                                </div>
                                <button
                                  className="content-item-edit-btn"
                                  onClick={() => handleEditLecture(lecture)}
                                  title="Sửa"
                                >
                                  <FaEdit className="edit-icon" />
                                  Sửa
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <div className="no-content-message">
                            Chưa có lecture nào trong module này
                          </div>
                        )}
                      </div>

                      {/* Create Button */}
                      <button
                        className="module-create-btn lecture-btn"
                        onClick={() => {
                          const moduleId = selectedModule.moduleId || selectedModule.ModuleId;
                          navigate(ROUTE_PATHS.TEACHER_CREATE_LECTURE(courseId, lessonId, moduleId));
                        }}
                      >
                        <FaPlus className="add-icon" />
                        Tạo Lecture
                      </button>
                    </>
                  )}
                </div>
              ) : (
                // Modules List View
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

                      // Determine which button to show based on contentType
                      const getCreateButton = () => {
                        const contentTypeNum = typeof contentTypeValue === 'number' ? contentTypeValue : parseInt(contentTypeValue);

                        if (contentTypeNum === 1) {
                          // Lecture
                          return (
                            <button
                              className="module-create-btn lecture-btn"
                              onClick={() => {
                                navigate(ROUTE_PATHS.TEACHER_CREATE_LECTURE(courseId, lessonId, moduleId));
                              }}
                            >
                              <FaPlus className="add-icon" />
                              Tạo Lecture
                            </button>
                          );
                        } else if (contentTypeNum === 4) {
                          // FlashCard
                          return (
                            <button
                              className="module-create-btn flashcard-btn"
                              onClick={() => {
                                navigate(ROUTE_PATHS.TEACHER_CREATE_FLASHCARD(courseId, lessonId, moduleId));
                              }}
                            >
                              <FaPlus className="add-icon" />
                              Tạo Flashcard
                            </button>
                          );
                        } else if (contentTypeNum === 3) {
                          // Assignment/Assessment
                          return (
                            <button
                              className="module-create-btn assessment-btn"
                              onClick={() => {
                                navigate(ROUTE_PATHS.TEACHER_CREATE_ASSESSMENT(courseId, lessonId, moduleId));
                              }}
                            >
                              <FaPlus className="add-icon" />
                              Tạo Assessment
                            </button>
                          );
                        }
                        return null;
                      };

                      const contentTypeNum = typeof contentTypeValue === 'number' ? contentTypeValue : parseInt(contentTypeValue);

                      return (
                        <div
                          key={moduleId || index}
                          className="module-item"
                          onClick={() => {
                            if (contentTypeNum === 1) {
                              handleModuleClick(module);
                            }
                          }}
                          style={{ cursor: contentTypeNum === 1 ? 'pointer' : 'default' }}
                        >
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
                          <div className="module-actions" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="module-update-btn"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  setLoadingModuleDetail(true);
                                  // Gọi API lấy chi tiết module để có đầy đủ thông tin (bao gồm imageUrl)
                                  const moduleId = module.moduleId || module.ModuleId;
                                  const response = await teacherService.getModuleById(moduleId);

                                  if (response.data?.success && response.data?.data) {
                                    setModuleToUpdate(response.data.data);
                                    setShowUpdateModuleModal(true);
                                  } else {
                                    // Fallback: sử dụng dữ liệu từ list nếu API fail
                                    console.warn("Failed to fetch module detail, using list data");
                                    setModuleToUpdate(module);
                                    setShowUpdateModuleModal(true);
                                  }
                                } catch (error) {
                                  console.error("Error fetching module detail:", error);
                                  // Fallback: sử dụng dữ liệu từ list
                                  setModuleToUpdate(module);
                                  setShowUpdateModuleModal(true);
                                } finally {
                                  setLoadingModuleDetail(false);
                                }
                              }}
                              title="Cập nhật module"
                              disabled={loadingModuleDetail}
                            >
                              {loadingModuleDetail ? "Đang tải..." : "Cập nhật"}
                            </button>
                            {getCreateButton()}
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
              )}
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

      {/* Update Module Modal */}
      <CreateModuleModal
        show={showUpdateModuleModal}
        onClose={() => {
          setShowUpdateModuleModal(false);
          setModuleToUpdate(null);
        }}
        onSuccess={() => {
          setShowUpdateModuleModal(false);
          setModuleToUpdate(null);
          setShowUpdateModuleSuccessModal(true);
          fetchModules();
        }}
        lessonId={lessonId}
        moduleData={moduleToUpdate}
        isUpdateMode={true}
      />

      {/* Success Modal for Module Update */}
      <SuccessModal
        isOpen={showUpdateModuleSuccessModal}
        onClose={() => setShowUpdateModuleSuccessModal(false)}
        title="Cập nhật module thành công"
        message="Module của bạn đã được cập nhật thành công!"
        autoClose={true}
        autoCloseDelay={1500}
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

