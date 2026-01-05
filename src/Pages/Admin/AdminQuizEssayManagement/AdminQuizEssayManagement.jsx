import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useAuth } from "../../../Context/AuthContext";
import { assessmentService } from "../../../Services/assessmentService";
import { quizService } from "../../../Services/quizService";
import { essayService } from "../../../Services/essayService";
import CreateQuizModal from "../../../Components/Teacher/CreateQuizModal/CreateQuizModal";
import CreateEssayModal from "../../../Components/Teacher/CreateEssayModal/CreateEssayModal";
import SuccessModal from "../../../Components/Common/SuccessModal/SuccessModal";
import ConfirmModal from "../../../Components/Common/ConfirmModal/ConfirmModal";
import { ROUTE_PATHS } from "../../../Routes/Paths";
import { useQuizStatus } from "../../../hooks/useQuizStatus";
import "./AdminQuizEssayManagement.css";

export default function AdminQuizEssayManagement() {
  const { courseId, lessonId, moduleId, assessmentId } = useParams();
  const navigate = useNavigate();
  const { user, roles, isAuthenticated } = useAuth();
  const { getStatusLabel } = useQuizStatus();
  const [assessment, setAssessment] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [essays, setEssays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [showCreateQuizSuccessModal, setShowCreateQuizSuccessModal] = useState(false);
  const [showUpdateQuizModal, setShowUpdateQuizModal] = useState(false);
  const [showUpdateQuizSuccessModal, setShowUpdateQuizSuccessModal] = useState(false);
  const [quizToUpdate, setQuizToUpdate] = useState(null);
  const [showDeleteQuizModal, setShowDeleteQuizModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [showDeleteQuizSuccessModal, setShowDeleteQuizSuccessModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Essay modals
  const [showCreateEssayModal, setShowCreateEssayModal] = useState(false);
  const [showCreateEssaySuccessModal, setShowCreateEssaySuccessModal] = useState(false);
  const [showUpdateEssayModal, setShowUpdateEssayModal] = useState(false);
  const [showUpdateEssaySuccessModal, setShowUpdateEssaySuccessModal] = useState(false);
  const [essayToUpdate, setEssayToUpdate] = useState(null);
  const [showDeleteEssayModal, setShowDeleteEssayModal] = useState(false);
  const [essayToDelete, setEssayToDelete] = useState(null);
  const [showDeleteEssaySuccessModal, setShowDeleteEssaySuccessModal] = useState(false);
  const [deletingEssay, setDeletingEssay] = useState(false);

  const isAdmin = roles?.some(role => ["SuperAdmin", "ContentAdmin"].includes(role));

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/home");
      return;
    }

    fetchData();
  }, [isAuthenticated, isAdmin, navigate, assessmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch assessment
      const assessmentRes = await assessmentService.getAdminAssessmentById(assessmentId);
      if (assessmentRes.data?.success && assessmentRes.data?.data) {
        setAssessment(assessmentRes.data.data);
      }

      // Fetch quizzes and essays
      const [quizzesRes, essaysRes] = await Promise.all([
        quizService.getAdminQuizzesByAssessment(assessmentId),
        essayService.getAdminEssaysByAssessment(assessmentId)
      ]);

      if (quizzesRes.data?.success) {
        setQuizzes(quizzesRes.data.data || []);
      }

      if (essaysRes.data?.success) {
        setEssays(essaysRes.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuizSuccess = () => {
    setShowCreateQuizModal(false);
    setShowCreateQuizSuccessModal(true);
    fetchData();
  };

  const handleEditQuiz = (quiz) => {
    setQuizToUpdate(quiz);
    setShowUpdateQuizModal(true);
  };

  const handleUpdateQuizSuccess = () => {
    setShowUpdateQuizModal(false);
    setQuizToUpdate(null);
    setShowUpdateQuizSuccessModal(true);
    fetchData();
  };

  const handleDeleteQuizClick = (quiz) => {
    setQuizToDelete(quiz);
    setShowDeleteQuizModal(true);
  };

  const handleConfirmDeleteQuiz = async () => {
    if (!quizToDelete) return;

    setDeleting(true);
    try {
      const quizId = quizToDelete.quizId || quizToDelete.QuizId;
      const response = await quizService.deleteAdminQuiz(quizId);

      if (response.data?.success) {
        setShowDeleteQuizModal(false);
        setQuizToDelete(null);
        setShowDeleteQuizSuccessModal(true);
        fetchData();
      } else {
        throw new Error(response.data?.message || "Xóa Quiz thất bại");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi xóa Quiz";
      alert(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  // Essay handlers
  const handleCreateEssaySuccess = () => {
    setShowCreateEssayModal(false);
    setShowCreateEssaySuccessModal(true);
    fetchData();
  };

  const handleEditEssay = (essay) => {
    setEssayToUpdate(essay);
    setShowUpdateEssayModal(true);
  };

  const handleUpdateEssaySuccess = () => {
    setShowUpdateEssayModal(false);
    setEssayToUpdate(null);
    setShowUpdateEssaySuccessModal(true);
    fetchData();
  };

  const handleDeleteEssayClick = (essay) => {
    setEssayToDelete(essay);
    setShowDeleteEssayModal(true);
  };

  const handleConfirmDeleteEssay = async () => {
    if (!essayToDelete) return;

    setDeletingEssay(true);
    try {
      const essayId = essayToDelete.essayId || essayToDelete.EssayId;
      const response = await essayService.deleteAdminEssay(essayId);

      if (response.data?.success) {
        setShowDeleteEssayModal(false);
        setEssayToDelete(null);
        setShowDeleteEssaySuccessModal(true);
        fetchData();
      } else {
        throw new Error(response.data?.message || "Xóa Essay thất bại");
      }
    } catch (error) {
      console.error("Error deleting essay:", error);
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi xóa Essay";
      alert(errorMessage);
    } finally {
      setDeletingEssay(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="admin-quiz-essay-management-container">
        <Container>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-quiz-essay-management-container">
        <Container>
          <div className="alert alert-danger text-center">{error}</div>
        </Container>
      </div>
    );
  }

  return (
    <div className="admin-quiz-essay-management-container">
      <Container>
        {/* Header */}
        <div className="mb-5">
          <h1 className="mb-0 fw-bold text-primary text-center">Quản lý bài kiểm tra</h1>
        </div>

        {/* Create Buttons */}
        <div className="d-flex justify-content-center gap-4 mb-5 flex-wrap">
          <button
            className="btn create-quiz-button px-5 py-3 text-white border-0 rounded-4 shadow-lg fw-semibold"
            style={{ fontSize: "16px", minWidth: "200px" }}
            onClick={() => setShowCreateQuizModal(true)}
          >
            Tạo Quiz mới
          </button>
          <button
            className="btn create-essay-button px-5 py-3 text-white border-0 rounded-4 shadow-lg fw-semibold"
            style={{ fontSize: "16px", minWidth: "200px" }}
            onClick={() => setShowCreateEssayModal(true)}
          >
            Tạo Essay mới
          </button>
        </div>

        {/* Content Sections */}
        <Row className="g-4">
          {/* Quizzes Section */}
          <Col md={6}>
            <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
              <h2 className="h4 fw-bold text-primary mb-4">Các bài Quiz đã tạo</h2>
              <div className="d-flex flex-column gap-3">
                {quizzes.length > 0 ? (
                  quizzes.map((quiz) => {
                    const quizId = quiz.quizId || quiz.QuizId;
                    const quizTitle = quiz.title || quiz.Title || "Untitled Quiz";
                    const quizStatus = quiz.status !== undefined ? quiz.status : quiz.Status;
                    const statusInfo = getStatusLabel(quizStatus);

                    return (
                      <div 
                        key={quizId} 
                        className="card border rounded-3 p-3 hover-card"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/admin/courses/${courseId}/lesson/${lessonId}/module/${moduleId}/assessment/${assessmentId}/quiz/${quizId}/sections`)}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h5 className="mb-2 fw-semibold">{quizTitle}</h5>
                            <span
                              className="badge rounded-pill px-3 py-1"
                              style={{
                                color: statusInfo.color,
                                backgroundColor: statusInfo.bg,
                              }}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="d-flex gap-2 ms-3" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="btn btn-edit-quiz d-flex align-items-center justify-content-center"
                              title="Sửa Quiz"
                              onClick={() => handleEditQuiz(quiz)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-delete-quiz d-flex align-items-center justify-content-center"
                              title="Xóa Quiz"
                              onClick={() => handleDeleteQuizClick(quiz)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-muted py-5">Chưa có Quiz nào</div>
                )}
              </div>
            </div>
          </Col>

          {/* Essays Section */}
          <Col md={6}>
            <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
              <h2 className="h4 fw-bold text-primary mb-4">Các bài Essay đã tạo</h2>
              <div className="d-flex flex-column gap-3">
                {essays.length > 0 ? (
                  essays.map((essay) => {
                    const essayId = essay.essayId || essay.EssayId;
                    const essayTitle = essay.title || essay.Title || "Untitled Essay";
                    const essayStatus = essay.status !== undefined ? essay.status : essay.Status;
                    const statusInfo = getStatusLabel(essayStatus);

                    return (
                      <div key={essayId} className="card border rounded-3 p-3 hover-card">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h5 className="mb-2 fw-semibold">{essayTitle}</h5>
                            <span
                              className="badge rounded-pill px-3 py-1"
                              style={{
                                color: statusInfo.color,
                                backgroundColor: statusInfo.bg,
                              }}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="d-flex gap-2 ms-3">
                            <button
                              className="btn btn-edit-essay d-flex align-items-center justify-content-center"
                              title="Sửa Essay"
                              onClick={() => handleEditEssay(essay)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-delete-essay d-flex align-items-center justify-content-center"
                              title="Xóa Essay"
                              onClick={() => handleDeleteEssayClick(essay)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-muted py-5">Chưa có Essay nào</div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Create Quiz Modal */}
      {assessmentId && (
        <CreateQuizModal
          show={showCreateQuizModal}
          onClose={() => setShowCreateQuizModal(false)}
          onSuccess={handleCreateQuizSuccess}
          assessmentId={parseInt(assessmentId)}
          isAdmin={true}
        />
      )}

      {/* Update Quiz Modal */}
      {assessmentId && quizToUpdate && (
        <CreateQuizModal
          show={showUpdateQuizModal}
          onClose={() => {
            setShowUpdateQuizModal(false);
            setQuizToUpdate(null);
          }}
          onSuccess={handleUpdateQuizSuccess}
          assessmentId={parseInt(assessmentId)}
          quizToUpdate={quizToUpdate}
          isAdmin={true}
        />
      )}

      {/* Delete Quiz Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteQuizModal}
        onClose={() => {
          if (!deleting) {
            setShowDeleteQuizModal(false);
            setQuizToDelete(null);
          }
        }}
        onConfirm={handleConfirmDeleteQuiz}
        title="Bạn chắc chắn muốn xóa quiz này chứ?"
        message="Hành động này không thể hoàn tác."
        confirmText={deleting ? "Đang xóa..." : "Xác nhận"}
        cancelText="Hủy"
        type="danger"
        disabled={deleting}
      />

      {/* Success Modals */}
      <SuccessModal
        isOpen={showCreateQuizSuccessModal}
        onClose={() => setShowCreateQuizSuccessModal(false)}
        title="Tạo Quiz thành công"
        message="Quiz của bạn đã được tạo thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />

      <SuccessModal
        isOpen={showUpdateQuizSuccessModal}
        onClose={() => setShowUpdateQuizSuccessModal(false)}
        title="Cập nhật Quiz thành công"
        message="Quiz của bạn đã được cập nhật thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />

      <SuccessModal
        isOpen={showDeleteQuizSuccessModal}
        onClose={() => setShowDeleteQuizSuccessModal(false)}
        title="Xóa Quiz thành công"
        message="Quiz đã được xóa thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />

      {/* Create Essay Modal */}
      {assessmentId && (
        <CreateEssayModal
          show={showCreateEssayModal}
          onClose={() => setShowCreateEssayModal(false)}
          onSuccess={handleCreateEssaySuccess}
          assessmentId={parseInt(assessmentId)}
          isAdmin={true}
        />
      )}

      {/* Update Essay Modal */}
      {assessmentId && essayToUpdate && (
        <CreateEssayModal
          show={showUpdateEssayModal}
          onClose={() => {
            setShowUpdateEssayModal(false);
            setEssayToUpdate(null);
          }}
          onSuccess={handleUpdateEssaySuccess}
          assessmentId={parseInt(assessmentId)}
          essayToUpdate={essayToUpdate}
          isAdmin={true}
        />
      )}

      {/* Delete Essay Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteEssayModal}
        onClose={() => {
          if (!deletingEssay) {
            setShowDeleteEssayModal(false);
            setEssayToDelete(null);
          }
        }}
        onConfirm={handleConfirmDeleteEssay}
        title="Bạn chắc chắn muốn xóa essay này chứ?"
        message="Hành động này không thể hoàn tác."
        confirmText={deletingEssay ? "Đang xóa..." : "Xác nhận"}
        cancelText="Hủy"
        type="danger"
        disabled={deletingEssay}
      />

      {/* Essay Success Modals */}
      <SuccessModal
        isOpen={showCreateEssaySuccessModal}
        onClose={() => setShowCreateEssaySuccessModal(false)}
        title="Tạo Essay thành công"
        message="Essay của bạn đã được tạo thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />

      <SuccessModal
        isOpen={showUpdateEssaySuccessModal}
        onClose={() => setShowUpdateEssaySuccessModal(false)}
        title="Cập nhật Essay thành công"
        message="Essay của bạn đã được cập nhật thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />

      <SuccessModal
        isOpen={showDeleteEssaySuccessModal}
        onClose={() => setShowDeleteEssaySuccessModal(false)}
        title="Xóa Essay thành công"
        message="Essay đã được xóa thành công!"
        autoClose={true}
        autoCloseDelay={1500}
      />
    </div>
  );
}
