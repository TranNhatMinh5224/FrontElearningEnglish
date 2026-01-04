import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Button, Card, Badge, Row, Col } from "react-bootstrap";
import { FaPlus, FaArrowLeft, FaEdit, FaTrash, FaLayerGroup, FaList } from "react-icons/fa";
import TeacherHeader from "../../../Components/Header/TeacherHeader";
import CreateQuestionModal from "../../../Components/Teacher/CreateQuestionModal/CreateQuestionModal";
import CreateQuizGroupModal from "../../../Components/Teacher/CreateQuizGroupModal/CreateQuizGroupModal"; // Import Group Modal
import ConfirmModal from "../../../Components/Common/ConfirmModal/ConfirmModal";
import SuccessModal from "../../../Components/Common/SuccessModal/SuccessModal";
import { questionService } from "../../../Services/questionService";
import { quizService } from "../../../Services/quizService";
import { useQuestionTypes } from "../../../hooks/useQuestionTypes";
import "./TeacherQuestionManagement.css";

export default function TeacherQuestionManagement() {
  const { getQuestionTypeLabel } = useQuestionTypes();
  const { courseId, lessonId, moduleId, assessmentId, quizId, sectionId, groupId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [groups, setGroups] = useState([]); // Store groups list
  const [contextData, setContextData] = useState({ title: "", subtitle: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Bulk Mode states
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkQuestions, setBulkQuestions] = useState([]);

  // Question Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [questionToUpdate, setQuestionToUpdate] = useState(null);
  const [targetGroupId, setTargetGroupId] = useState(null); // Which group adding question to?

  // Question Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  
  // Group Modals (Edit/Delete)
  const [showGroupEditModal, setShowGroupEditModal] = useState(false);
  const [groupToUpdate, setGroupToUpdate] = useState(null);
  const [showGroupDeleteModal, setShowGroupDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

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
        // [Legacy/Specific Group View] - though user wants unified view, keep this logic safe
        const groupRes = await quizService.getQuizGroupById(groupId);
        if (groupRes.data?.success) {
           title = `Group: ${groupRes.data.data.name || "Untitled Group"}`;
           subtitle = groupRes.data.data.title;
        }
        questionsRes = await questionService.getQuestionsByGroup(groupId);
      } else if (sectionId) {
        // [Section View] - Fetch Section Info, Questions AND Groups
        const sectionRes = await quizService.getQuizSectionById(sectionId);
        if (sectionRes.data?.success) {
            title = `Section: ${sectionRes.data.data.title || "Untitled Section"}`;
        }
        
        // Parallel fetch
        const [qRes, gRes] = await Promise.all([
            questionService.getQuestionsBySection(sectionId),
            quizService.getQuizGroupsBySection(sectionId)
        ]);

        questionsRes = qRes;
        if (gRes.data?.success) {
            setGroups(gRes.data.data || []);
        }
      }

      if (questionsRes?.data?.success) {
        setQuestions(questionsRes.data.data || []);
      }
      setContextData({ title, subtitle });

    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = (newQuestion) => {
    setSuccessMessage("Tạo câu hỏi thành công!");
    setShowSuccessModal(true);
    fetchData(); 
  };

  const handleUpdateSuccess = (updatedQuestion) => {
    setSuccessMessage("Cập nhật câu hỏi thành công!");
    setShowSuccessModal(true);
    fetchData();
  };

  // --- Group Handlers ---
  const handleGroupEditSuccess = () => {
      setSuccessMessage("Cập nhật Group thành công!");
      setShowSuccessModal(true);
      fetchData();
  };

  const confirmDeleteGroup = async () => {
      if (!groupToDelete) return;
      try {
          const res = await quizService.deleteQuizGroup(groupToDelete.quizGroupId);
          if (res.data?.success) {
              setSuccessMessage("Xóa Group thành công!");
              setShowSuccessModal(true);
              setShowGroupDeleteModal(false);
              fetchData();
          } else {
              alert(res.data?.message || "Xóa thất bại");
          }
      } catch (err) {
          console.error(err);
          alert("Lỗi khi xóa Group");
      }
  };

  // --- Bulk Mode Handlers ---
  const handleSaveDraft = (draftQuestion) => {
      if (questionToUpdate) {
          const updatedBulk = bulkQuestions.map(q => 
              q.tempId === questionToUpdate.tempId ? { ...draftQuestion, tempId: q.tempId } : q
          );
          setBulkQuestions(updatedBulk);
      } else {
          setBulkQuestions([...bulkQuestions, { ...draftQuestion, tempId: Date.now() }]);
      }
  };

  const handleDeleteDraft = (tempId) => {
      setBulkQuestions(bulkQuestions.filter(q => q.tempId !== tempId));
  };

  const handleBulkSubmit = async () => {
      if (bulkQuestions.length === 0) return;
      try {
          const payload = { questions: bulkQuestions.map(({ tempId, ...q }) => q) };
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
  const handleAddQuestion = (targetGroup = null) => {
      setTargetGroupId(targetGroup ? targetGroup.quizGroupId : null); // If null, it's standalone (or new group creation context)
      setQuestionToUpdate(null);
      setShowCreateModal(true);
  };

  const handleEditQuestion = (question) => {
    setQuestionToUpdate(question);
    setTargetGroupId(question.quizGroupId); 
    setShowCreateModal(true);
  };

  const handleDeleteQuestion = (question) => {
    setQuestionToDelete(question);
    setShowDeleteModal(true);
  };

  const confirmDeleteQuestion = async () => {
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

  // --- Helpers for Display ---
  const standaloneQuestions = questions.filter(q => !q.quizGroupId);
  const questionsByGroup = {};
  questions.forEach(q => {
      if (q.quizGroupId) {
          if (!questionsByGroup[q.quizGroupId]) questionsByGroup[q.quizGroupId] = [];
          questionsByGroup[q.quizGroupId].push(q);
      }
  });

  const renderQuestionCard = (q, index, isGrouped = false) => {
      // Helper to render body content based on type
      const renderQuestionBody = () => {
          if (q.type === 5) { // Matching
              let pairs = [];
              try {
                  if (q.matchingPairs) pairs = q.matchingPairs; // from draft
                  else if (q.correctAnswersJson) pairs = JSON.parse(q.correctAnswersJson);
              } catch (e) { console.error("Error parsing matching pairs", e); }

              if (pairs.length > 0) {
                  return (
                      <div className="mt-2 bg-light p-2 rounded small">
                          {pairs.map((p, i) => (
                              <div key={i} className="d-flex align-items-center gap-2 mb-1">
                                  <span className="fw-bold text-dark">{p.key}</span>
                                  <span className="text-muted">➡</span>
                                  <span className="text-dark">{p.value}</span>
                              </div>
                          ))}
                      </div>
                  );
              }
          }
          
          if (q.type === 6) { // Ordering
              return (
                  <ol className="mt-2 ps-3 mb-0 small">
                      {q.options?.map((opt, idx) => (
                          <li key={idx} className="mb-1 text-dark">
                              {opt.text}
                          </li>
                      ))}
                  </ol>
              );
          }

          // Default (MCQ, FillBlank, etc.)
          return (
            <ul className="list-unstyled options-preview mb-0 small text-muted mt-2">
                {q.options?.map((opt, idx) => (
                    <li key={idx} className={`mb-1 ${opt.isCorrect ? "text-success fw-bold" : ""}`}>
                        {opt.isCorrect && "✓ "} {opt.text}
                    </li>
                ))}
            </ul>
          );
      };

      return (
        <Card key={isBulkMode ? q.tempId : q.questionId} className={`mb-3 border-0 shadow-sm question-card ${isBulkMode ? 'border-start border-4 border-warning' : ''}`}>
            <Card.Body className="p-3">
                <div className="d-flex justify-content-between">
                <div className="d-flex gap-3 w-100">
                    <div className="question-index text-center pt-1">
                        <span className={`badge rounded-pill ${isBulkMode ? 'bg-warning text-dark' : 'bg-secondary'}`}>#{index + 1}</span>
                    </div>
                    <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <Badge bg="info">{getQuestionTypeLabel(q.type)}</Badge>
                            <span className="text-muted small">Points: {q.points}</span>
                            {isBulkMode && <Badge bg="warning" className="text-dark">Draft</Badge>}
                        </div>
                        <h6 className="question-stem mb-1 fw-bold text-break">{q.stemText}</h6>
                        {renderQuestionBody()}
                    </div>
                </div>

                <div className="action-buttons d-flex flex-column gap-2 justify-content-start ms-2">
                    <Button variant="light" size="sm" onClick={() => handleEditQuestion(q)} title="Sửa">
                    <FaEdit className="text-primary" />
                    </Button>
                    <Button variant="light" size="sm" onClick={() => isBulkMode ? handleDeleteDraft(q.tempId) : handleDeleteQuestion(q)} title="Xóa">
                    <FaTrash className="text-danger" />
                    </Button>
                </div>
                </div>
            </Card.Body>
        </Card>
      );
  };

  return (
    <>
      <TeacherHeader />
      <div className="teacher-question-management-container">
        <Container>
          {/* Header */}
          <div className="question-header-section mb-4">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                  <Button variant="outline-secondary" className="me-3" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Quay lại
                  </Button>
                  <div>
                    <h2 className="mb-0 text-primary fw-bold">Quản lý câu hỏi</h2>
                    <div className="text-muted small">
                      {contextData.title}
                    </div>
                  </div>
              </div>
              <div>
                  {/* Global Actions */}
                  {!isBulkMode ? (
                        <div className="d-flex gap-2">
                            <Button variant="primary" onClick={() => handleAddQuestion(null)}>
                                <FaPlus className="me-2" /> Tạo mới (Câu hỏi/Group)
                            </Button>
                            <Button variant="outline-primary" onClick={() => setIsBulkMode(true)}>
                                ++ Soạn nhiều câu
                            </Button>
                        </div>
                    ) : (
                        <div className="d-flex gap-2">
                            <Button variant="outline-secondary" onClick={() => setIsBulkMode(false)}>Hủy bỏ</Button>
                            <Button variant="success" onClick={() => handleAddQuestion(null)}><FaPlus className="me-2" /> Thêm vào DS</Button>
                            <Button variant="primary" onClick={handleBulkSubmit} disabled={bulkQuestions.length === 0}>
                                Lưu tất cả ({bulkQuestions.length})
                            </Button>
                        </div>
                    )}
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
             <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <div className="question-content-area">
                
                {/* 1. Standalone Questions */}
                {standaloneQuestions.length > 0 && (
                    <div className="mb-4">
                        <h5 className="text-muted border-bottom pb-2 mb-3">Câu hỏi lẻ ({standaloneQuestions.length})</h5>
                        {standaloneQuestions.map((q, idx) => renderQuestionCard(q, idx))}
                    </div>
                )}

                {/* 2. Groups Display */}
                {groups.map((group) => {
                    const groupQuestions = questionsByGroup[group.quizGroupId] || [];
                    return (
                        <div key={group.quizGroupId} className="mb-5 group-container">
                            {/* Group Header Bar */}
                            <div className="group-header-bar bg-light border rounded p-3 mb-3 d-flex justify-content-between align-items-center shadow-sm" style={{borderLeft: '5px solid #0d6efd'}}>
                                <div>
                                    <div className="d-flex align-items-center gap-2">
                                        <FaLayerGroup className="text-primary"/>
                                        <h5 className="mb-0 fw-bold text-primary">{group.name}</h5>
                                        <Badge bg="secondary">Total: {group.sumScore} pts</Badge>
                                    </div>
                                    <div className="text-muted small mt-1">{group.title}</div>
                                </div>
                                <div className="d-flex gap-2">
                                    <Button variant="outline-primary" size="sm" onClick={() => handleAddQuestion(group)}>
                                        <FaPlus className="me-1"/> Thêm câu hỏi vào nhóm
                                    </Button>
                                    <Button variant="outline-secondary" size="sm" onClick={() => { setGroupToUpdate(group); setShowGroupEditModal(true); }}>
                                        <FaEdit />
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => { setGroupToDelete(group); setShowGroupDeleteModal(true); }}>
                                        <FaTrash />
                                    </Button>
                                </div>
                            </div>

                            {/* Group Questions List (Indented) */}
                            <div className="group-questions-list ps-4 ms-2 border-start border-3 border-light">
                                {groupQuestions.length === 0 ? (
                                    <div className="text-muted fst-italic py-2 ps-3">Chưa có câu hỏi nào trong nhóm này.</div>
                                ) : (
                                    groupQuestions.map((q, idx) => renderQuestionCard(q, idx, true))
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Bulk Drafts */}
                {isBulkMode && bulkQuestions.length > 0 && (
                     <div className="mt-5 pt-3 border-top border-warning">
                        <h5 className="text-warning fw-bold">Bản nháp ({bulkQuestions.length})</h5>
                        {bulkQuestions.map((q, idx) => renderQuestionCard(q, idx))}
                     </div>
                )}

                {!isBulkMode && questions.length === 0 && groups.length === 0 && (
                    <div className="text-center py-5 text-muted bg-light rounded">
                        <p className="mb-3">Chưa có nội dung nào.</p>
                        <Button variant="primary" onClick={() => handleAddQuestion(null)}>Tạo nội dung đầu tiên</Button>
                    </div>
                )}
            </div>
          )}
        </Container>
      </div>

      {/* Question Modal */}
      <CreateQuestionModal 
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={questionToUpdate ? handleUpdateSuccess : handleCreateSuccess}
        sectionId={sectionId ? parseInt(sectionId) : null}
        groupId={targetGroupId || (groupId ? parseInt(groupId) : null)}
        questionToUpdate={questionToUpdate}
        isBulkMode={isBulkMode}
        onSaveDraft={handleSaveDraft}
      />
      
      {/* Group Modals */}
      <CreateQuizGroupModal
          show={showGroupEditModal}
          onClose={() => setShowGroupEditModal(false)}
          onSuccess={handleGroupEditSuccess}
          quizSectionId={sectionId}
          groupToUpdate={groupToUpdate}
      />

      <ConfirmModal 
        isOpen={showGroupDeleteModal}
        onClose={() => setShowGroupDeleteModal(false)}
        onConfirm={confirmDeleteGroup}
        title="Xóa Group?"
        message="Bạn có chắc chắn muốn xóa Group này? Tất cả câu hỏi trong Group cũng sẽ bị xóa."
        confirmText="Xóa Group"
        cancelText="Hủy"
        type="danger"
      />

      {/* Question Delete */}
      <ConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteQuestion}
        title="Xóa câu hỏi?"
        message="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />

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
