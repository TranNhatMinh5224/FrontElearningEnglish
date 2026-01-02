import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus, FaList } from "react-icons/fa";
import TeacherHeader from "../../../Components/Header/TeacherHeader";
import { useAuth } from "../../../Context/AuthContext";
import { quizService } from "../../../Services/quizService";
import CreateQuizSectionModal from "../../../Components/Teacher/CreateQuizSectionModal/CreateQuizSectionModal";
import CreateQuizGroupModal from "../../../Components/Teacher/CreateQuizGroupModal/CreateQuizGroupModal";
import SuccessModal from "../../../Components/Common/SuccessModal/SuccessModal";
import ConfirmModal from "../../../Components/Common/ConfirmModal/ConfirmModal";
import { ROUTE_PATHS } from "../../../Routes/Paths";
import "./TeacherQuizSectionManagement.css";

export default function TeacherQuizSectionManagement() {
  const { courseId, lessonId, moduleId, assessmentId, quizId } = useParams();
  const navigate = useNavigate();
  const { user, roles, isAuthenticated } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [sections, setSections] = useState([]);
  const [sectionGroups, setSectionGroups] = useState({}); // { sectionId: [groups] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Section modals
  const [showCreateSectionModal, setShowCreateSectionModal] = useState(false);
  const [showCreateSectionSuccessModal, setShowCreateSectionSuccessModal] = useState(false);
  const [showUpdateSectionModal, setShowUpdateSectionModal] = useState(false);
  const [showUpdateSectionSuccessModal, setShowUpdateSectionSuccessModal] = useState(false);
  const [sectionToUpdate, setSectionToUpdate] = useState(null);
  const [showDeleteSectionModal, setShowDeleteSectionModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [showDeleteSectionSuccessModal, setShowDeleteSectionSuccessModal] = useState(false);
  const [deletingSection, setDeletingSection] = useState(false);

  // Group modals
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [selectedSectionForGroup, setSelectedSectionForGroup] = useState(null);
  const [showCreateGroupSuccessModal, setShowCreateGroupSuccessModal] = useState(false);
  const [showUpdateGroupModal, setShowUpdateGroupModal] = useState(false);
  const [showUpdateGroupSuccessModal, setShowUpdateGroupSuccessModal] = useState(false);
  const [groupToUpdate, setGroupToUpdate] = useState(null);
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [showDeleteGroupSuccessModal, setShowDeleteGroupSuccessModal] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState(false);

  const isTeacher = roles.includes("Teacher") || user?.teacherSubscription?.isTeacher === true;

  useEffect(() => {
    if (!isAuthenticated || !isTeacher) {
      navigate("/home");
      return;
    }

    fetchData();
  }, [isAuthenticated, isTeacher, navigate, quizId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch quiz
      const quizRes = await quizService.getTeacherQuizById(quizId);
      if (quizRes.data?.success && quizRes.data?.data) {
        setQuiz(quizRes.data.data);
      }

      // Fetch sections
      const sectionsRes = await quizService.getQuizSectionsByQuiz(quizId);
      if (sectionsRes.data?.success) {
        const sectionsData = sectionsRes.data.data || [];
        setSections(sectionsData);

        // Fetch groups for each section
        const groupsPromises = sectionsData.map(async (section) => {
          const sectionId = section.quizSectionId || section.QuizSectionId;
          const groupsRes = await quizService.getQuizGroupsBySection(sectionId);
          if (groupsRes.data?.success) {
            return { sectionId, groups: groupsRes.data.data || [] };
          }
          return { sectionId, groups: [] };
        });

        const groupsResults = await Promise.all(groupsPromises);
        const groupsMap = {};
        groupsResults.forEach(({ sectionId, groups }) => {
          groupsMap[sectionId] = groups;
        });
        setSectionGroups(groupsMap);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleManageQuestionsSection = (sectionId) => {
    navigate(ROUTE_PATHS.TEACHER_QUESTION_MANAGEMENT_SECTION(courseId, lessonId, moduleId, assessmentId, quizId, sectionId));
  };

  const handleManageQuestionsGroup = (groupId) => {
    navigate(ROUTE_PATHS.TEACHER_QUESTION_MANAGEMENT_GROUP(courseId, lessonId, moduleId, assessmentId, quizId, groupId));
  };

  // Section handlers
  const handleCreateSectionSuccess = () => {
    setShowCreateSectionModal(false);
    setShowCreateSectionSuccessModal(true);
    fetchData();
  };

  const handleEditSection = (section) => {
    setSectionToUpdate(section);
    setShowUpdateSectionModal(true);
  };

  const handleUpdateSectionSuccess = () => {
    setShowUpdateSectionModal(false);
    setSectionToUpdate(null);
    setShowUpdateSectionSuccessModal(true);
    fetchData();
  };

  const handleDeleteSectionClick = (section) => {
    setSectionToDelete(section);
    setShowDeleteSectionModal(true);
  };

  const handleConfirmDeleteSection = async () => {
    if (!sectionToDelete) return;

    setDeletingSection(true);
    try {
      const sectionId = sectionToDelete.quizSectionId || sectionToDelete.QuizSectionId;
      const response = await quizService.deleteQuizSection(sectionId);

      if (response.data?.success) {
        setShowDeleteSectionModal(false);
        setSectionToDelete(null);
        setShowDeleteSectionSuccessModal(true);
        fetchData();
      } else {
        throw new Error(response.data?.message || "Xóa Section thất bại");
      }
    } catch (error) {
      console.error("Error deleting section:", error);
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi xóa Section";
      alert(errorMessage);
    } finally {
      setDeletingSection(false);
    }
  };

  // Group handlers
  const handleCreateGroupClick = (section) => {
    setSelectedSectionForGroup(section);
    setShowCreateGroupModal(true);
  };

  const handleCreateGroupSuccess = () => {
    setShowCreateGroupModal(false);
    setSelectedSectionForGroup(null);
    setShowCreateGroupSuccessModal(true);
    fetchData();
  };

  const handleEditGroup = (group) => {
    setGroupToUpdate(group);
    setShowUpdateGroupModal(true);
  };

  const handleUpdateGroupSuccess = () => {
    setShowUpdateGroupModal(false);
    setGroupToUpdate(null);
    setShowUpdateGroupSuccessModal(true);
    fetchData();
  };

  const handleDeleteGroupClick = (group) => {
    setGroupToDelete(group);
    setShowDeleteGroupModal(true);
  };

  const handleConfirmDeleteGroup = async () => {
    if (!groupToDelete) return;

    setDeletingGroup(true);
    try {
      const groupId = groupToDelete.quizGroupId || groupToDelete.QuizGroupId;
      const response = await quizService.deleteQuizGroup(groupId);

      if (response.data?.success) {
        setShowDeleteGroupModal(false);
        setGroupToDelete(null);
        setShowDeleteGroupSuccessModal(true);
        fetchData();
      } else {
        throw new Error(response.data?.message || "Xóa Group thất bại");
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi xóa Group";
      alert(errorMessage);
    } finally {
      setDeletingGroup(false);
    }
  };

  if (!isAuthenticated || !isTeacher) {
    return null;
  }

  if (loading) {
    return (
      <>
        <TeacherHeader />
        <div className="teacher-quiz-section-management-container">
          <Container>
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          </Container>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <TeacherHeader />
        <div className="teacher-quiz-section-management-container">
          <Container>
            <div className="alert alert-danger text-center">{error}</div>
          </Container>
        </div>
      </>
    );
  }

  const quizTitle = quiz?.title || quiz?.Title || "Quiz";

  return (
    <>
      <TeacherHeader />
      <div className="teacher-quiz-section-management-container">
        <Container>
          {/* Header */}
          <div className="mb-4">
            <h1 className="mb-0 fw-bold text-primary">Quản lý Quiz: {quizTitle}</h1>
          </div>

          {/* Create Section Button */}
          <div className="mb-4">
            <button
              className="btn btn-primary px-4 py-2"
              onClick={() => setShowCreateSectionModal(true)}
            >
              <FaPlus className="me-2" />
              Tạo Section mới
            </button>
          </div>

          {/* Sections List */}
          {sections.length === 0 ? (
            <div className="text-center text-muted py-5">
              <p>Chưa có Section nào. Hãy tạo Section đầu tiên!</p>
            </div>
          ) : (
            <div className="sections-list">
              {sections.map((section) => {
                const sectionId = section.quizSectionId || section.QuizSectionId;
                const sectionTitle = section.title || section.Title || "Untitled Section";
                const sectionDescription = section.description || section.Description;
                const groups = sectionGroups[sectionId] || [];

                return (
                  <div key={sectionId} className="section-card mb-4">
                    <div className="section-header">
                      <div className="section-info">
                        <h3 
                            className="section-title text-primary cursor-pointer" 
                            onClick={() => handleManageQuestionsSection(sectionId)}
                            style={{cursor: 'pointer'}}
                        >
                            {sectionTitle}
                        </h3>
                        {sectionDescription && (
                          <p className="section-description text-muted">{sectionDescription}</p>
                        )}
                      </div>
                      <div className="section-actions">
                        <button
                          className="btn btn-primary text-white me-2"
                          onClick={() => handleManageQuestionsSection(sectionId)}
                          title="Quản lý nội dung (Câu hỏi & Nhóm)"
                        >
                          <FaList className="me-1" /> Quản lý nội dung
                        </button>
                        <button
                          className="btn btn-edit-section"
                          onClick={() => handleEditSection(section)}
                          title="Sửa Section"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-delete-section"
                          onClick={() => handleDeleteSectionClick(section)}
                          title="Xóa Section"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Container>
      </div>

      {/* Create Section Modal */}
      {quizId && (
        <CreateQuizSectionModal
          show={showCreateSectionModal}
          onClose={() => setShowCreateSectionModal(false)}
          onSuccess={handleCreateSectionSuccess}
          quizId={parseInt(quizId)}
        />
      )}

      {/* Update Section Modal */}
      {quizId && sectionToUpdate && (
        <CreateQuizSectionModal
          show={showUpdateSectionModal}
          onClose={() => {
            setShowUpdateSectionModal(false);
            setSectionToUpdate(null);
          }}
          onSuccess={handleUpdateSectionSuccess}
          quizId={parseInt(quizId)}
          sectionToUpdate={sectionToUpdate}
        />
      )}

      {/* Delete Section Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteSectionModal}
        onClose={() => {
          if (!deletingSection) {
            setShowDeleteSectionModal(false);
            setSectionToDelete(null);
          }
        }}
        onConfirm={handleConfirmDeleteSection}
        title="Bạn chắc chắn muốn xóa section này chứ?"
        message="Hành động này sẽ xóa tất cả groups và questions trong section này. Hành động này không thể hoàn tác."
        confirmText={deletingSection ? "Đang xóa..." : "Xác nhận"}
        cancelText="Hủy"
        type="danger"
        disabled={deletingSection}
      />

      {/* Create Group Modal */}
      {selectedSectionForGroup && (
        <CreateQuizGroupModal
          show={showCreateGroupModal}
          onClose={() => {
            setShowCreateGroupModal(false);
            setSelectedSectionForGroup(null);
          }}
          onSuccess={handleCreateGroupSuccess}
          quizSectionId={selectedSectionForGroup.quizSectionId || selectedSectionForGroup.QuizSectionId}
        />
      )}

      {/* Update Group Modal */}
      {groupToUpdate && (
        <CreateQuizGroupModal
          show={showUpdateGroupModal}
          onClose={() => {
            setShowUpdateGroupModal(false);
            setGroupToUpdate(null);
          }}
          onSuccess={handleUpdateGroupSuccess}
          quizSectionId={groupToUpdate.quizSectionId || groupToUpdate.QuizSectionId}
          groupToUpdate={groupToUpdate}
        />
      )}

      {/* Delete Group Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteGroupModal}
        onClose={() => {
          if (!deletingGroup) {
            setShowDeleteGroupModal(false);
            setGroupToDelete(null);
          }
        }}
        onConfirm={handleConfirmDeleteGroup}
        title="Bạn chắc chắn muốn xóa group này chứ?"
        message="Hành động này sẽ xóa tất cả questions trong group này. Hành động này không thể hoàn tác."
        confirmText={deletingGroup ? "Đang xóa..." : "Xác nhận"}
        cancelText="Hủy"
        type="danger"
        disabled={deletingGroup}
      />

      {/* Success Modals */}
      <SuccessModal
        isOpen={showCreateSectionSuccessModal}
        onClose={() => setShowCreateSectionSuccessModal(false)}
        title="Tạo Section thành công"
        message="Section đã được tạo thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />

      <SuccessModal
        isOpen={showUpdateSectionSuccessModal}
        onClose={() => setShowUpdateSectionSuccessModal(false)}
        title="Cập nhật Section thành công"
        message="Section đã được cập nhật thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />

      <SuccessModal
        isOpen={showDeleteSectionSuccessModal}
        onClose={() => setShowDeleteSectionSuccessModal(false)}
        title="Xóa Section thành công"
        message="Section đã được xóa thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />

      <SuccessModal
        isOpen={showCreateGroupSuccessModal}
        onClose={() => setShowCreateGroupSuccessModal(false)}
        title="Tạo Group thành công"
        message="Group đã được tạo thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />

      <SuccessModal
        isOpen={showUpdateGroupSuccessModal}
        onClose={() => setShowUpdateGroupSuccessModal(false)}
        title="Cập nhật Group thành công"
        message="Group đã được cập nhật thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />

      <SuccessModal
        isOpen={showDeleteGroupSuccessModal}
        onClose={() => setShowDeleteGroupSuccessModal(false)}
        title="Xóa Group thành công"
        message="Group đã được xóa thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />
    </>
  );
}

