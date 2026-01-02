import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Button, Card, Badge } from "react-bootstrap";
import { FaPlus, FaArrowLeft, FaEdit, FaTrash, FaBook, FaVideo, FaHeadphones, FaFileAlt, FaGamepad } from "react-icons/fa";
import TeacherHeader from "../../../Components/Header/TeacherHeader";
import { useAuth } from "../../../Context/AuthContext";
import { teacherService } from "../../../Services/teacherService";
import { lectureService } from "../../../Services/lectureService";
import CreateLectureModal from "../../../Components/Teacher/CreateLectureModal/CreateLectureModal";
import ConfirmModal from "../../../Components/Common/ConfirmModal/ConfirmModal";
import SuccessModal from "../../../Components/Common/SuccessModal/SuccessModal";
import { ROUTE_PATHS } from "../../../Routes/Paths";
import "./TeacherModuleLectureDetail.css";

const LECTURE_ICONS = {
  1: <FaBook className="text-primary" />,
  2: <FaVideo className="text-danger" />,
  3: <FaHeadphones className="text-warning" />,
  4: <FaFileAlt className="text-secondary" />,
  5: <FaGamepad className="text-success" />,
};

const LECTURE_LABELS = {
  1: "Nội dung",
  2: "Video",
  3: "Audio",
  4: "Tài liệu",
  5: "Tương tác",
};

export default function TeacherModuleLectureDetail() {
  const { courseId, lessonId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user, roles, isAuthenticated } = useAuth();
  
  const [module, setModule] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [lectureToUpdate, setLectureToUpdate] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState(null);
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
      const [moduleRes, lecturesRes] = await Promise.all([
        teacherService.getModuleById(moduleId),
        lectureService.getTeacherLecturesByModule(moduleId)
      ]);

      if (moduleRes.data?.success) setModule(moduleRes.data.data);
      if (lecturesRes.data?.success) setLectures(lecturesRes.data.data || []);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setSuccessMessage("Tạo lecture thành công!");
    setShowSuccessModal(true);
    fetchData();
  };

  const handleUpdateSuccess = () => {
    setSuccessMessage("Cập nhật lecture thành công!");
    setShowSuccessModal(true);
    fetchData();
  };

  const handleDeleteClick = (lecture) => {
    setLectureToDelete(lecture);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!lectureToDelete) return;
    try {
      const lectureId = lectureToDelete.lectureId || lectureToDelete.LectureId;
      const res = await lectureService.deleteLecture(lectureId);
      if (res.data?.success) {
        setSuccessMessage("Xóa lecture thành công!");
        setShowSuccessModal(true);
        setShowDeleteModal(false);
        fetchData();
      } else {
        alert("Xóa thất bại: " + res.data?.message);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa lecture");
    }
  };

  return (
    <>
      <TeacherHeader />
      <div className="teacher-module-lecture-detail-container">
        <Container>
          <div className="d-flex align-items-center justify-content-between mb-4 mt-4">
            <div className="d-flex align-items-center">
                <Button variant="outline-secondary" className="me-3" onClick={() => navigate(ROUTE_PATHS.TEACHER_LESSON_DETAIL(courseId, lessonId))}>
                    <FaArrowLeft /> Quay lại
                </Button>
                <div>
                    <h2 className="mb-0 fw-bold text-primary">Quản lý bài giảng</h2>
                    <div className="text-muted">{module?.name || "Module"}</div>
                </div>
            </div>
            <Button variant="primary" onClick={() => { setLectureToUpdate(null); setShowCreateModal(true); }}>
                <FaPlus className="me-2" /> Tạo Lecture mới
            </Button>
          </div>

          {loading ? (
             <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : lectures.length === 0 ? (
             <div className="text-center py-5 bg-light rounded text-muted">
                 <p>Chưa có bài giảng nào trong module này.</p>
                 <Button variant="primary" onClick={() => { setLectureToUpdate(null); setShowCreateModal(true); }}>Tạo bài giảng đầu tiên</Button>
             </div>
          ) : (
             <div className="lecture-list">
                 {lectures.map((lec, idx) => (
                     <Card key={lec.lectureId || idx} className="mb-3 border-0 shadow-sm lecture-card">
                         <Card.Body className="d-flex align-items-center justify-content-between">
                             <div className="d-flex align-items-center gap-3">
                                 <div className="lecture-icon p-3 bg-light rounded-circle" style={{fontSize: '1.5rem'}}>
                                     {LECTURE_ICONS[lec.type] || <FaBook />}
                                 </div>
                                 <div>
                                     <h5 className="mb-1 fw-bold">{lec.title}</h5>
                                     <Badge bg="info" className="fw-normal">{LECTURE_LABELS[lec.type] || "Không xác định"}</Badge>
                                 </div>
                             </div>
                             <div className="action-buttons">
                                 <Button variant="light" className="me-2" onClick={() => { setLectureToUpdate(lec); setShowCreateModal(true); }}>
                                     <FaEdit className="text-primary"/>
                                 </Button>
                                 <Button variant="light" onClick={() => handleDeleteClick(lec)}>
                                     <FaTrash className="text-danger"/>
                                 </Button>
                             </div>
                         </Card.Body>
                     </Card>
                 ))}
             </div>
          )}
        </Container>
      </div>

      <CreateLectureModal 
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={lectureToUpdate ? handleUpdateSuccess : handleCreateSuccess}
        moduleId={moduleId}
        lectureToUpdate={lectureToUpdate}
      />

      <ConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Xóa Lecture?"
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