import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import "./AdminLessonDetail.css";
import { useAuth } from "../../../Context/AuthContext";
import { useModuleTypes } from "../../../hooks/useModuleTypes";
import { adminService } from "../../../Services/adminService";
import { lectureService } from "../../../Services/lectureService";
import { flashcardService } from "../../../Services/flashcardService";
import { assessmentService } from "../../../Services/assessmentService";
import { quizService } from "../../../Services/quizService";
import { essayService } from "../../../Services/essayService";
import { mochiLessonTeacher, mochiModuleTeacher } from "../../../Assets/Logo";
import CreateLessonModal from "../../../Components/Teacher/CreateLessonModal/CreateLessonModal";
import CreateModuleModal from "../../../Components/Teacher/CreateModuleModal/CreateModuleModal";
import CreateAssessmentModal from "../../../Components/Teacher/CreateAssessmentModal/CreateAssessmentModal";
import SuccessModal from "../../../Components/Common/SuccessModal/SuccessModal";
import ConfirmModal from "../../../Components/Common/ConfirmModal/ConfirmModal";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

export default function AdminLessonDetail() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { roles, isAuthenticated } = useAuth();
  const { isLecture, isFlashCard, isAssessment, isClickable, getModuleTypePath } = useModuleTypes();
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
  const [showCreateAssessmentModal, setShowCreateAssessmentModal] = useState(false);
  const [showCreateAssessmentSuccessModal, setShowCreateAssessmentSuccessModal] = useState(false);
  const [showUpdateAssessmentModal, setShowUpdateAssessmentModal] = useState(false);
  const [showUpdateAssessmentSuccessModal, setShowUpdateAssessmentSuccessModal] = useState(false);
  const [assessmentToUpdate, setAssessmentToUpdate] = useState(null);
  const [showDeleteModuleModal, setShowDeleteModuleModal] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [deletingModule, setDeletingModule] = useState(false);
  const [showDeleteModuleSuccessModal, setShowDeleteModuleSuccessModal] = useState(false);

  // Module content state
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleContent, setModuleContent] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentError, setContentError] = useState("");
  const [assessmentTypes, setAssessmentTypes] = useState({}); // { assessmentId: { hasQuiz: boolean, hasEssay: boolean } }

  const isAdmin = roles.some(role => ["SuperAdmin", "ContentAdmin"].includes(role));

  const fetchCourseDetail = useCallback(async () => {
    try {
      const response = await adminService.getCourseContent(courseId);
      if (response.data?.success && response.data?.data) {
        setCourse(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching course detail:", err);
    }
  }, [courseId]);

  const fetchLessonDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminService.getLessonDetail(lessonId);

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
  }, [lessonId]);

  const fetchModules = useCallback(async () => {
    try {
      const response = await adminService.getModulesByLesson(lessonId);
      if (response.data?.success && response.data?.data) {
        const modulesData = response.data.data;
        const modulesList = Array.isArray(modulesData) ? modulesData : [];

        // Fetch imageUrl cho từng module từ API chi tiết
        const modulesWithImages = await Promise.all(
          modulesList.map(async (module) => {
            try {
              const moduleId = module.moduleId || module.ModuleId;
              const detailResponse = await adminService.getModuleById(moduleId);

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
  }, [lessonId]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/home");
      return;
    }

    fetchCourseDetail();
    fetchLessonDetail();
    fetchModules();
  }, [isAuthenticated, isAdmin, navigate, fetchCourseDetail, fetchLessonDetail, fetchModules]);

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

  // Handle module click - fetch content based on module type
  const handleModuleClick = async (module) => {
    const contentTypeValue = module.contentType || module.ContentType;
    const contentTypeNum = typeof contentTypeValue === 'number' ? contentTypeValue : parseInt(contentTypeValue);

    setSelectedModule(module);
    setLoadingContent(true);
    setContentError("");

    try {
      const moduleId = module.moduleId || module.ModuleId;

      if (isLecture(contentTypeNum)) {
        // Lecture module - fetch lectures
        const response = await lectureService.getAdminLecturesByModule(moduleId);

        if (response.data?.success && response.data?.data) {
          setModuleContent(response.data.data || []);
        } else {
          setContentError("Không thể tải danh sách lectures");
          setModuleContent([]);
        }
      } else if (isFlashCard(contentTypeNum)) {
        // FlashCard module - fetch flashcards
        const response = await flashcardService.getAdminFlashcardsByModule(moduleId);

        if (response.data?.success && response.data?.data) {
          setModuleContent(response.data.data || []);
        } else {
          setContentError("Không thể tải danh sách flashcards");
          setModuleContent([]);
        }
      } else if (isAssessment(contentTypeNum)) {
        // Assessment module - fetch assessments
        const response = await assessmentService.getAdminAssessmentsByModule(moduleId);

        if (response.data?.success && response.data?.data) {
          const assessments = response.data.data || [];
          setModuleContent(assessments);

          // Fetch quiz and essay info for each assessment
          const typePromises = assessments.map(async (assessment) => {
            const assessmentId = assessment.assessmentId || assessment.AssessmentId;
            if (!assessmentId) return null;

            try {
              const [quizRes, essayRes] = await Promise.all([
                quizService.getAdminQuizzesByAssessment(assessmentId),
                essayService.getAdminEssaysByAssessment(assessmentId)
              ]);

              const hasQuiz = quizRes.data?.success && quizRes.data?.data && quizRes.data.data.length > 0;
              const hasEssay = essayRes.data?.success && essayRes.data?.data && essayRes.data.data.length > 0;

              return { assessmentId, hasQuiz, hasEssay };
            } catch (error) {
              console.error(`Error fetching types for assessment ${assessmentId}:`, error);
              return { assessmentId, hasQuiz: false, hasEssay: false };
            }
          });

          const types = await Promise.all(typePromises);
          const typesMap = {};
          types.forEach(type => {
            if (type) {
              typesMap[type.assessmentId] = { hasQuiz: type.hasQuiz, hasEssay: type.hasEssay };
            }
          });
          setAssessmentTypes(typesMap);
        } else {
          setContentError("Không thể tải danh sách assessments");
          setModuleContent([]);
        }
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      setContentError("Có lỗi xảy ra khi tải danh sách");
      setModuleContent([]);
    } finally {
      setLoadingContent(false);
    }
  };

  // Handle edit lecture
  const handleEditLecture = (lecture) => {
    const lectureId = lecture.lectureId || lecture.LectureId;
    const moduleId = selectedModule.moduleId || selectedModule.ModuleId;
    navigate(`/admin/courses/${courseId}/lesson/${lessonId}/module/${moduleId}/lecture/${lectureId}/edit`);
  };

  // Handle edit flashcard
  const handleEditFlashcard = (flashcard) => {
    // Backend returns flashCardId (camelCase with capital C)
    const flashcardId = flashcard.flashCardId || flashcard.flashcardId || flashcard.FlashcardId || flashcard.FlashCardId || flashcard.id || flashcard.Id;
    const moduleId = selectedModule.moduleId || selectedModule.ModuleId;

    if (!flashcardId) {
      console.error("Flashcard ID not found. Available keys:", Object.keys(flashcard));
      alert("Không tìm thấy ID của flashcard. Vui lòng thử lại.");
      return;
    }

    navigate(`/admin/courses/${courseId}/lesson/${lessonId}/module/${moduleId}/flashcard/${flashcardId}/edit`);
  };

  const handleDeleteModuleClick = (module) => {
    setModuleToDelete(module);
    setShowDeleteModuleModal(true);
  };

  const confirmDeleteModule = async () => {
    if (!moduleToDelete) return;

    try {
      setDeletingModule(true);
      const moduleId = moduleToDelete.moduleId || moduleToDelete.ModuleId;
      const response = await adminService.deleteModule(moduleId);

      if (response.status === 204 || response.data?.success) {
        setShowDeleteModuleModal(false);
        setShowDeleteModuleSuccessModal(true);
        setModuleToDelete(null);
        fetchModules();
        fetchLessonDetail();
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi xóa module";
      alert(errorMessage);
    } finally {
      setDeletingModule(false);
    }
  };


  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="admin-lesson-detail-container">
        <div className="loading-message">Đang tải thông tin bài học...</div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="admin-lesson-detail-container">
        <div className="error-message">{error || "Không tìm thấy bài học"}</div>
      </div>
    );
  }

  const lessonTitle = lesson.title || lesson.Title || "Bài học";
  const lessonDescription = lesson.description || lesson.Description || "";
  const lessonImage = lesson.imageUrl || lesson.ImageUrl || mochiLessonTeacher;

  return (
    <>
      <div className="admin-lesson-detail-container">
        <div className="breadcrumb-section">
          <span className="breadcrumb-text">
            <span
              className="breadcrumb-link"
              onClick={() => navigate("/admin/course-management")}
            >
              Quản lý khoá học
            </span>
            {" / "}
            <span
              className="breadcrumb-link"
              onClick={() => navigate(`/admin/courses/${courseId}`)}
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
                // Module Content View (Lectures/Flashcards List)
                <div className="modules-section">
                  <div className="module-content-header">
                    <h3 className="module-content-title">
                      {selectedModule.name || selectedModule.Name || "Module"}
                    </h3>
                  </div>

                  {loadingContent ? (
                    <div className="loading-message">
                      Đang tải danh sách {(() => {
                        const contentTypeValue = selectedModule.contentType || selectedModule.ContentType;
                        const contentTypeNum = typeof contentTypeValue === 'number' ? contentTypeValue : parseInt(contentTypeValue);
                        return getModuleTypePath(contentTypeNum);
                      })()}...
                    </div>
                  ) : contentError ? (
                    <div className="error-message">{contentError}</div>
                  ) : (
                    <>
                      <div className="module-content-list">
                        {moduleContent.length > 0 ? (
                          moduleContent.map((item, index) => {
                            const contentTypeValue = selectedModule.contentType || selectedModule.ContentType;
                            const contentTypeNum = typeof contentTypeValue === 'number' ? contentTypeValue : parseInt(contentTypeValue);

                            if (isLecture(contentTypeNum)) {
                              // Lecture
                              const lectureId = item.lectureId || item.LectureId;
                              const lectureTitle = item.title || item.Title || `Lecture ${index + 1}`;
                              const lectureDescription = item.markdownContent || item.MarkdownContent || "";

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
                                    onClick={() => handleEditLecture(item)}
                                    title="Sửa"
                                  >
                                    <FaEdit className="edit-icon" />
                                    Sửa
                                  </button>
                                </div>
                              );
                            } else if (isFlashCard(contentTypeNum)) {
                              // FlashCard - backend returns flashCardId (camelCase with capital C)
                              const flashcardId = item.flashCardId || item.flashcardId || item.FlashcardId || item.FlashCardId;
                              const word = item.word || item.Word || `Flashcard ${index + 1}`;
                              const meaning = item.meaning || item.Meaning || "";
                              const pronunciation = item.pronunciation || item.Pronunciation || "";
                              const partOfSpeech = item.partOfSpeech || item.PartOfSpeech || "";

                              return (
                                <div key={flashcardId || index} className="content-item">
                                  <div className="content-item-info">
                                    <h4 className="content-item-title">{word}</h4>
                                    {pronunciation && (
                                      <p className="content-item-description" style={{ fontStyle: 'italic', color: '#6b7280' }}>
                                        {pronunciation}
                                      </p>
                                    )}
                                    {meaning && (
                                      <p className="content-item-description">
                                        <strong>Nghĩa:</strong> {meaning}
                                      </p>
                                    )}
                                    {partOfSpeech && (
                                      <p className="content-item-description" style={{ fontSize: '12px', color: '#9ca3af' }}>
                                        {partOfSpeech}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    className="content-item-edit-btn"
                                    onClick={() => handleEditFlashcard(item)}
                                    title="Sửa"
                                  >
                                    <FaEdit className="edit-icon" />
                                    Sửa
                                  </button>
                                </div>
                              );
                            } else if (isAssessment(contentTypeNum)) {
                              // Assessment - backend returns AssessmentId (PascalCase)
                              const assessmentId = item.assessmentId || item.AssessmentId;
                              const title = item.title || item.Title || `Assessment ${index + 1}`;
                              const description = item.description || item.Description || "";
                              const timeLimit = item.timeLimit || item.TimeLimit || "";
                              const totalPoints = item.totalPoints || item.TotalPoints || 0;
                              const passingScore = item.passingScore || item.PassingScore || 0;
                              const isPublished = item.isPublished || item.IsPublished || false;
                              const moduleId = selectedModule.moduleId || selectedModule.ModuleId;

                              // Get quiz/essay info
                              const typeInfo = assessmentTypes[assessmentId] || { hasQuiz: false, hasEssay: false };

                              return (
                                <div
                                  key={assessmentId || index}
                                  className="content-item"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    navigate(`/admin/courses/${courseId}/lesson/${lessonId}/module/${moduleId}/assessment/${assessmentId}`);
                                  }}
                                >
                                  <div className="content-item-info">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                      <h4 className="content-item-title" style={{ margin: 0 }}>{title}</h4>
                                      <div style={{ display: 'flex', gap: '8px' }}>
                                        {typeInfo.hasQuiz && (
                                          <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            backgroundColor: '#e3f2fd',
                                            color: '#1976d2'
                                          }}>
                                            Quiz
                                          </span>
                                        )}
                                        {typeInfo.hasEssay && (
                                          <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            backgroundColor: '#f3e5f5',
                                            color: '#7b1fa2'
                                          }}>
                                            Essay
                                          </span>
                                        )}
                                        {!typeInfo.hasQuiz && !typeInfo.hasEssay && (
                                          <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            backgroundColor: '#f5f5f5',
                                            color: '#757575'
                                          }}>
                                            Chưa có nội dung
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {description && (
                                      <p className="content-item-description">
                                        {description.length > 100
                                          ? description.substring(0, 100) + "..."
                                          : description}
                                      </p>
                                    )}
                                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                                      {timeLimit && (
                                        <span><strong>Thời gian:</strong> {timeLimit}</span>
                                      )}
                                      {totalPoints > 0 && (
                                        <span><strong>Tổng điểm:</strong> {totalPoints}</span>
                                      )}
                                      {passingScore > 0 && (
                                        <span><strong>Điểm đạt:</strong> {passingScore}%</span>
                                      )}
                                      <span><strong>Trạng thái:</strong> {isPublished ? 'Đã xuất bản' : 'Chưa xuất bản'}</span>
                                    </div>
                                  </div>
                                  <button
                                    className="content-item-edit-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAssessmentToUpdate(item);
                                      setShowUpdateAssessmentModal(true);
                                    }}
                                    title="Sửa Assessment"
                                  >
                                    <FaEdit className="edit-icon" />
                                    Sửa
                                  </button>
                                </div>
                              );
                            }
                            return null;
                          })
                        ) : (
                          <div className="no-content-message">
                            {(() => {
                              const contentTypeValue = selectedModule.contentType || selectedModule.ContentType;
                              const contentTypeNum = typeof contentTypeValue === 'number' ? contentTypeValue : parseInt(contentTypeValue);
                              if (isLecture(contentTypeNum)) {
                                return "Chưa có lecture nào trong module này";
                              } else if (isFlashCard(contentTypeNum)) {
                                return "Chưa có flashcard nào trong module này";
                              } else if (isAssessment(contentTypeNum)) {
                                return "Chưa có assessment nào trong module này";
                              }
                              return "Chưa có nội dung nào trong module này";
                            })()}
                          </div>
                        )}
                      </div>

                      {/* Create Button */}
                      {(() => {
                        const contentTypeValue = selectedModule.contentType || selectedModule.ContentType;
                        const contentTypeNum = typeof contentTypeValue === 'number' ? contentTypeValue : parseInt(contentTypeValue);
                        const moduleId = selectedModule.moduleId || selectedModule.ModuleId;

                        if (isLecture(contentTypeNum)) {
                          return (
                            <button
                              className="module-create-btn lecture-btn"
                              onClick={() => {
                                navigate(`/admin/courses/${courseId}/lesson/${lessonId}/module/${moduleId}/lecture/create`);
                              }}
                            >
                              <FaPlus className="add-icon" />
                              Tạo Lecture
                            </button>
                          );
                        } else if (isFlashCard(contentTypeNum)) {
                          return (
                            <button
                              className="module-create-btn flashcard-btn"
                              onClick={() => {
                                navigate(`/admin/courses/${courseId}/lesson/${lessonId}/module/${moduleId}/flashcard/create`);
                              }}
                            >
                              <FaPlus className="add-icon" />
                              Tạo Flashcard
                            </button>
                          );
                        } else if (isAssessment(contentTypeNum)) {
                          return (
                            <button
                              className="module-create-btn assessment-btn"
                              onClick={() => {
                                setShowCreateAssessmentModal(true);
                              }}
                            >
                              <FaPlus className="add-icon" />
                              Thêm Assessment
                            </button>
                          );
                        }
                        return null;
                      })()}
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

                      // Map enum number to name if needed (matching backend ModuleType enum)
                      const contentTypeMap = {
                        1: "Lecture",
                        2: "FlashCard",
                        3: "Assessment"
                      };

                      const displayContentType = contentTypeName || contentTypeMap[contentTypeValue] || contentTypeValue || "Unknown";

                      const contentTypeNum = typeof contentTypeValue === 'number' ? contentTypeValue : parseInt(contentTypeValue);

                      // Handle module click - navigate to corresponding screen based on module type
                      const handleModuleItemClick = () => {
                        if (!isClickable(contentTypeNum)) return;
                        
                        const moduleIdValue = module.moduleId || module.ModuleId;
                        
                        if (isLecture(contentTypeNum)) {
                          // Navigate to create lecture page
                          navigate(`/admin/courses/${courseId}/lesson/${lessonId}/module/${moduleIdValue}/lecture/create`);
                        } else if (isFlashCard(contentTypeNum)) {
                          // Navigate to create flashcard page
                          navigate(`/admin/courses/${courseId}/lesson/${lessonId}/module/${moduleIdValue}/flashcard/create`);
                        } else if (isAssessment(contentTypeNum)) {
                          // For Assessment, show content list in current screen (existing behavior)
                          handleModuleClick(module);
                        }
                      };

                      return (
                        <div
                          key={moduleId || index}
                          className="module-item"
                          onClick={handleModuleItemClick}
                          style={{ cursor: isClickable(contentTypeNum) ? 'pointer' : 'default' }}
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
                                  const response = await adminService.getModuleById(moduleId);

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
                            <button
                              className="module-delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteModuleClick(module);
                              }}
                              title="Xóa module"
                            >
                              <FaTrash />
                            </button>
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
        isAdmin={true}
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
        isAdmin={true}
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
        isAdmin={true}
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

      {/* Create Assessment Modal */}
      {selectedModule && (
        <CreateAssessmentModal
          show={showCreateAssessmentModal}
          onClose={() => setShowCreateAssessmentModal(false)}
          onSuccess={() => {
            setShowCreateAssessmentModal(false);
            setShowCreateAssessmentSuccessModal(true);
            // Reload assessments list
            if (selectedModule) {
              handleModuleClick(selectedModule);
            }
          }}
          moduleId={selectedModule.moduleId || selectedModule.ModuleId}
          isAdmin={true}
        />
      )}

      {/* Success Modal for Assessment Creation */}
      <SuccessModal
        isOpen={showCreateAssessmentSuccessModal}
        onClose={() => setShowCreateAssessmentSuccessModal(false)}
        title="Tạo Assessment thành công"
        message="Assessment của bạn đã được tạo thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />

      {/* Update Assessment Modal */}
      {selectedModule && assessmentToUpdate && (
        <CreateAssessmentModal
          show={showUpdateAssessmentModal}
          onClose={() => {
            setShowUpdateAssessmentModal(false);
            setAssessmentToUpdate(null);
          }}
          onSuccess={() => {
            setShowUpdateAssessmentModal(false);
            setAssessmentToUpdate(null);
            setShowUpdateAssessmentSuccessModal(true);
            // Reload assessments list
            if (selectedModule) {
              handleModuleClick(selectedModule);
            }
          }}
          moduleId={selectedModule.moduleId || selectedModule.ModuleId}
          assessmentData={assessmentToUpdate}
          isUpdateMode={true}
          isAdmin={true}
        />
      )}

      {/* Success Modal for Assessment Update */}
      <SuccessModal
        isOpen={showUpdateAssessmentSuccessModal}
        onClose={() => setShowUpdateAssessmentSuccessModal(false)}
        title="Cập nhật Assessment thành công"
        message="Assessment của bạn đã được cập nhật thành công!"
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

      {/* Confirm Delete Module Modal */}
      <ConfirmModal
        isOpen={showDeleteModuleModal}
        onClose={() => {
          setShowDeleteModuleModal(false);
          setModuleToDelete(null);
        }}
        onConfirm={confirmDeleteModule}
        title="Xác nhận xóa module"
        message="Bạn có chắc chắn muốn xóa module này không?"
        itemName={moduleToDelete ? (moduleToDelete.name || moduleToDelete.Name) : ""}
        type="delete"
        confirmText="Xác nhận xóa"
        loading={deletingModule}
      />

      {/* Success Modal for Delete Module */}
      <SuccessModal
        isOpen={showDeleteModuleSuccessModal}
        onClose={() => setShowDeleteModuleSuccessModal(false)}
        title="Xóa module thành công"
        message="Module đã được xóa thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />
    </>
  );
}
