import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Button, Card, Badge, Form } from "react-bootstrap";
import { FaPlus, FaArrowLeft, FaEdit, FaTrash, FaCopy } from "react-icons/fa";
import TeacherHeader from "../../../Components/Header/TeacherHeader";
import CreateQuestionModal from "../../../Components/Teacher/CreateQuestionModal/CreateQuestionModal";
import ConfirmModal from "../../../Components/Common/ConfirmModal/ConfirmModal";
import SuccessModal from "../../../Components/Common/SuccessModal/SuccessModal";
import { questionService } from "../../../Services/questionService";
import { quizService } from "../../../Services/quizService";
import "./TeacherQuestionManagement.css";

const QUESTION_TYPES_LABEL = {
  1: "Trắc nghiệm (1 đáp án)",
  2: "Trắc nghiệm (Nhiều đáp án)",
  3: "Đúng / Sai",
  4: "Điền từ",
  5: "Nối từ",
  6: "Sắp xếp",
};

export default function TeacherQuestionManagement() {
  const { courseId, lessonId, moduleId, assessmentId, quizId, sectionId, groupId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [contextData, setContextData] = useState({ title: "", subtitle: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Bulk Mode states
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkQuestions, setBulkQuestions] = useState([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [questionToUpdate, setQuestionToUpdate] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  
  // Success Modal states
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [sectionId, groupId]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      let questionsRes;
      let title = "";
      let subtitle = "";

      if (groupId) {
        // Fetch group info and questions
        const groupRes = await quizService.getQuizGroupById(groupId);
        if (groupRes.data?.success) {
           title = `Group: ${groupRes.data.data.name || "Untitled Group"}`;
           subtitle = groupRes.data.data.title;
        }
        questionsRes = await questionService.getQuestionsByGroup(groupId);
      } else if (sectionId) {
        // Fetch section info and questions
        const sectionRes = await quizService.getQuizSectionById(sectionId);
        if (sectionRes.data?.success) {
            title = `Section: ${sectionRes.data.data.title || "Untitled Section"}`;
        }
        questionsRes = await questionService.getQuestionsBySection(sectionId);
      }

      if (questionsRes?.data?.success) {
        setQuestions(questionsRes.data.data || []);
      }
      setContextData({ title, subtitle });

    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu câu hỏi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = (newQuestion) => {
    setSuccessMessage("Tạo câu hỏi thành công!");
    setShowSuccessModal(true);
    fetchData(); // Reload list
  };

  const handleUpdateSuccess = (updatedQuestion) => {
    setSuccessMessage("Cập nhật câu hỏi thành công!");
    setShowSuccessModal(true);
    fetchData(); // Reload list
  };

  // --- Bulk Mode Handlers ---
  const handleSaveDraft = (draftQuestion) => {
      if (questionToUpdate) {
          // Update existing draft
          const updatedBulk = bulkQuestions.map(q => 
              q.tempId === questionToUpdate.tempId ? { ...draftQuestion, tempId: q.tempId } : q
          );
          setBulkQuestions(updatedBulk);
      } else {
          // Add new draft
          setBulkQuestions([...bulkQuestions, { ...draftQuestion, tempId: Date.now() }]);
      }
  };

  const handleDeleteDraft = (tempId) => {
      setBulkQuestions(bulkQuestions.filter(q => q.tempId !== tempId));
  };

  const handleBulkSubmit = async () => {
      if (bulkQuestions.length === 0) return;
      
      try {
          // Format payload for bulk create API
          // API expects: { questions: [ ... ] }
          const payload = {
              questions: bulkQuestions.map(({ tempId, ...q }) => q) // Remove tempId
          };

          const res = await questionService.bulkCreateQuestions(payload);
          if (res.data?.success) {
              setSuccessMessage(`Đã tạo thành công ${bulkQuestions.length} câu hỏi!`);
              setShowSuccessModal(true);
              setBulkQuestions([]);
              setIsBulkMode(false);
              fetchData();
          } else {
              alert(res.data?.message || "Tạo hàng loạt thất bại");
          }
      } catch (err) {
          console.error(err);
          alert("Lỗi khi tạo hàng loạt");
      }
  };

  // --- Common Handlers ---
  const handleEditClick = (question) => {
    setQuestionToUpdate(question);
    setShowCreateModal(true);
  };

  const handleDeleteClick = (question) => {
    setQuestionToDelete(question);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;
    try {
      const res = await questionService.deleteQuestion(questionToDelete.questionId);
      if (res.data?.success) {
        setSuccessMessage("Xóa câu hỏi thành công!");
        setShowSuccessModal(true);
        setShowDeleteModal(false);
        setQuestionToDelete(null);
        fetchData();
      } else {
        alert(res.data?.message || "Xóa thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa câu hỏi");
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page (Section Management)
  };

  return (
    <>
      <TeacherHeader />
      <div className="teacher-question-management-container">
        <Container>
          {/* Header */}
          <div className="question-header-section">
            <div className="d-flex align-items-center">
              <Button variant="outline-secondary" className="me-3" onClick={handleBack}>
                <FaArrowLeft /> Quay lại
              </Button>
              <div>
                <h2 className="mb-0 text-primary fw-bold">Quản lý câu hỏi</h2>
                <div className="text-muted">
                  {contextData.title} {contextData.subtitle && `- ${contextData.subtitle}`}
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-3">
                 <span className="fw-bold align-self-center">
                     {isBulkMode ? `Đang soạn: ${bulkQuestions.length} câu` : `Tổng số: ${questions.length} câu hỏi`}
                 </span>
              </div>
              <div className="d-flex gap-2">
                {!isBulkMode ? (
                    <>
                        <Button variant="primary" onClick={() => { setQuestionToUpdate(null); setShowCreateModal(true); }}>
                        <FaPlus className="me-2" /> Thêm câu hỏi
                        </Button>
                        <Button variant="outline-primary" onClick={() => setIsBulkMode(true)}>
                        ++ Chế độ tạo nhiều
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="outline-secondary" onClick={() => setIsBulkMode(false)}>
                            Hủy bỏ
                        </Button>
                        <Button variant="success" onClick={() => { setQuestionToUpdate(null); setShowCreateModal(true); }}>
                             <FaPlus className="me-2" /> Thêm vào DS
                        </Button>
                        <Button variant="primary" onClick={handleBulkSubmit} disabled={bulkQuestions.length === 0}>
                            Lưu tất cả ({bulkQuestions.length})
                        </Button>
                    </>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Content */}
          {loading ? (
             <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
             </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <div className="question-list">
                {isBulkMode && bulkQuestions.length === 0 && (
                    <div className="alert alert-info text-center">
                        Bạn đang ở chế độ <strong>Tạo hàng loạt</strong>. Hãy bấm "Thêm vào DS" để bắt đầu soạn câu hỏi. 
                        Các câu hỏi sẽ được lưu tạm thời tại đây trước khi gửi lên hệ thống.
                    </div>
                )}
                
                {/* List Logic depends on Mode */}
                {(isBulkMode ? bulkQuestions : questions).map((q, index) => (
                    <Card key={isBulkMode ? q.tempId : q.questionId} className={`mb-3 border-0 shadow-sm question-card ${isBulkMode ? 'border-start border-4 border-warning' : ''}`}>
                    <Card.Body>
                        <div className="d-flex justify-content-between">
                        <div className="d-flex gap-3">
                            <div className="question-index text-center">
                                <span className={`badge rounded-pill ${isBulkMode ? 'bg-warning text-dark' : 'bg-secondary'}`}>#{index + 1}</span>
                            </div>
                            <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <Badge bg="info">{QUESTION_TYPES_LABEL[q.type] || "Unknown"}</Badge>
                                <span className="text-muted small">Points: {q.points}</span>
                                {isBulkMode && <Badge bg="warning" className="text-dark">Draft</Badge>}
                            </div>
                            <h5 className="question-stem mb-3">{q.stemText}</h5>
                            
                            {/* Expanded details */}
                            <ul className="list-unstyled options-preview">
                                {q.options?.map((opt, idx) => (
                                    <li key={idx} className={`mb-1 ${opt.isCorrect ? "text-success fw-bold" : "text-muted"}`}>
                                        {opt.isCorrect && "✓ "} {opt.text}
                                    </li>
                                ))}
                            </ul>
                            </div>
                        </div>

                        <div className="action-buttons d-flex flex-column gap-2">
                            <Button variant="light" size="sm" onClick={() => handleEditClick(q)} title="Sửa">
                            <FaEdit className="text-primary" />
                            </Button>
                            <Button variant="light" size="sm" onClick={() => isBulkMode ? handleDeleteDraft(q.tempId) : handleDeleteClick(q)} title="Xóa">
                            <FaTrash className="text-danger" />
                            </Button>
                        </div>
                        </div>
                    </Card.Body>
                    </Card>
                ))}
                
                {!isBulkMode && questions.length === 0 && (
                    <div className="text-center py-5 text-muted bg-light rounded">
                    <p className="mb-3">Chưa có câu hỏi nào trong mục này.</p>
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        Tạo câu hỏi đầu tiên
                    </Button>
                    </div>
                )}
            </div>
          )}
        </Container>
      </div>

      {/* Create/Edit Modal */}
      <CreateQuestionModal 
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={questionToUpdate ? handleUpdateSuccess : handleCreateSuccess}
        sectionId={sectionId ? parseInt(sectionId) : null}
        groupId={groupId ? parseInt(groupId) : null}
        questionToUpdate={questionToUpdate}
        isBulkMode={isBulkMode}
        onSaveDraft={handleSaveDraft}
      />

      {/* Delete Confirmation */}
      <ConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Xóa câu hỏi?"
        message="Bạn có chắc chắn muốn xóa câu hỏi này không? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />

      {/* Success Notification */}
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Thành công"
        message={successMessage}
        autoClose={true}
      />
    </>
  );
}
