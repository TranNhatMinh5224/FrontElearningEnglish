import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Button, Card, Row, Col } from "react-bootstrap";
import { FaPlus, FaArrowLeft, FaEdit, FaTrash, FaVolumeUp } from "react-icons/fa";
import TeacherHeader from "../../../Components/Header/TeacherHeader";
import { useAuth } from "../../../Context/AuthContext";
import { teacherService } from "../../../Services/teacherService";
import { flashcardService } from "../../../Services/flashcardService";
import CreateFlashCardModal from "../../../Components/Teacher/CreateFlashCardModal/CreateFlashCardModal";
import ConfirmModal from "../../../Components/Common/ConfirmModal/ConfirmModal";
import SuccessModal from "../../../Components/Common/SuccessModal/SuccessModal";
import { ROUTE_PATHS } from "../../../Routes/Paths";
import "./TeacherModuleFlashCardDetail.css";

export default function TeacherModuleFlashCardDetail() {
  const { courseId, lessonId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user, roles, isAuthenticated } = useAuth();
  
  const [module, setModule] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [flashcardToUpdate, setFlashcardToUpdate] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flashcardToDelete, setFlashcardToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const isTeacher = roles.includes("Teacher") || user?.teacherSubscription?.isTeacher === true;

  useEffect(() => {
    if (!isAuthenticated || !isTeacher) {
      navigate("/home");
      return;
    }
    fetchData();
  }, [moduleId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [moduleRes, flashcardsRes] = await Promise.all([
        teacherService.getModuleById(moduleId),
        flashcardService.getTeacherFlashcardsByModule(moduleId)
      ]);

      if (moduleRes.data?.success) setModule(moduleRes.data.data);
      if (flashcardsRes.data?.success) setFlashcards(flashcardsRes.data.data || []);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setSuccessMessage("Tạo flashcard thành công!");
    setShowSuccessModal(true);
    fetchData();
  };

  const handleUpdateSuccess = () => {
    setSuccessMessage("Cập nhật flashcard thành công!");
    setShowSuccessModal(true);
    fetchData();
  };

  const handleDeleteClick = (card) => {
    setFlashcardToDelete(card);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!flashcardToDelete) return;
    try {
      // Backend returns FlashCardId (capital C)
      const cardId = flashcardToDelete.flashCardId || flashcardToDelete.FlashCardId || flashcardToDelete.flashcardId;
      
      if (!cardId) {
        console.error("Flashcard ID not found. Available keys:", Object.keys(flashcardToDelete));
        alert("Không tìm thấy ID của flashcard. Vui lòng thử lại.");
        return;
      }
      
      const res = await flashcardService.deleteFlashcard(cardId);
      if (res.data?.success) {
        setSuccessMessage("Xóa flashcard thành công!");
        setShowSuccessModal(true);
        setShowDeleteModal(false);
        fetchData();
      } else {
        alert("Xóa thất bại: " + res.data?.message);
      }
    } catch (err) {
      console.error("Error deleting flashcard:", err);
      alert("Lỗi khi xóa flashcard: " + (err.response?.data?.message || err.message));
    }
  };

  const playAudio = (url) => {
      if(!url) return;
      new Audio(url).play();
  };

  return (
    <>
      <TeacherHeader />
      <div className="teacher-module-flashcard-detail-container">
        <Container>
          <div className="d-flex align-items-center justify-content-between mb-4 mt-4">
            <div className="d-flex align-items-center">
                <Button variant="outline-secondary" className="me-3" onClick={() => navigate(ROUTE_PATHS.TEACHER_LESSON_DETAIL(courseId, lessonId))}>
                    <FaArrowLeft /> Quay lại
                </Button>
                <div>
                    <h2 className="mb-0 fw-bold text-primary">Quản lý từ vựng</h2>
                    <div className="text-muted">{module?.name || "Module"} ({flashcards.length} từ)</div>
                </div>
            </div>
            <Button variant="primary" onClick={() => { setFlashcardToUpdate(null); setShowCreateModal(true); }}>
                <FaPlus className="me-2" /> Thêm Flashcard
            </Button>
          </div>

          {loading ? (
             <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : flashcards.length === 0 ? (
             <div className="text-center py-5 bg-light rounded text-muted">
                 <p>Chưa có từ vựng nào trong bộ này.</p>
                 <Button variant="primary" onClick={() => { setFlashcardToUpdate(null); setShowCreateModal(true); }}>Tạo từ vựng đầu tiên</Button>
             </div>
          ) : (
             <Row xs={1} md={2} lg={3} className="g-4">
                 {flashcards.map((card, idx) => (
                     <Col key={card.flashcardId || idx}>
                        <Card className="h-100 border-0 shadow-sm flashcard-item">
                            <div className="position-relative">
                                <Card.Img 
                                    variant="top" 
                                    src={card.imageUrl || card.ImageUrl || "https://via.placeholder.com/300x200?text=No+Image"} 
                                    style={{height: '200px', objectFit: 'cover'}}
                                />
                                {(card.audioUrl || card.AudioUrl) && (
                                    <Button 
                                        variant="light" 
                                        className="position-absolute bottom-0 end-0 m-2 rounded-circle p-2 shadow-sm"
                                        onClick={() => playAudio(card.audioUrl || card.AudioUrl)}
                                    >
                                        <FaVolumeUp />
                                    </Button>
                                )}
                            </div>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h5 className="fw-bold mb-0 text-primary">{card.word}</h5>
                                    <span className="badge bg-secondary">{card.partOfSpeech}</span>
                                </div>
                                <div className="text-muted fst-italic mb-2">{card.pronunciation}</div>
                                <p className="card-text border-top pt-2 mt-2">{card.meaning}</p>
                                
                                <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
                                    <Button variant="outline-primary" size="sm" onClick={() => { setFlashcardToUpdate(card); setShowCreateModal(true); }}>
                                        <FaEdit /> Sửa
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(card)}>
                                        <FaTrash /> Xóa
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                     </Col>
                 ))}
             </Row>
          )}
        </Container>
      </div>

      <CreateFlashCardModal 
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={flashcardToUpdate ? handleUpdateSuccess : handleCreateSuccess}
        moduleId={moduleId}
        flashcardToUpdate={flashcardToUpdate}
      />

      <ConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Xóa Flashcard?"
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
        autoCloseDelay={1500}
      />
    </>
  );
}