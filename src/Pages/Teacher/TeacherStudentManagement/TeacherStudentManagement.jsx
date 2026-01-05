import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Pagination } from "react-bootstrap";
import "./TeacherStudentManagement.css";
import TeacherHeader from "../../../Components/Header/TeacherHeader";
import { useAuth } from "../../../Context/AuthContext";
import { teacherService } from "../../../Services/teacherService";
import { ROUTE_PATHS } from "../../../Routes/Paths";
import StudentDetailModal from "../../../Components/Teacher/StudentDetailModal/StudentDetailModal";
import AddStudentModal from "../../../Components/Teacher/AddStudentModal/AddStudentModal";
import SuccessModal from "../../../Components/Common/SuccessModal/SuccessModal";
import { FaPlus, FaUser } from "react-icons/fa";

export default function TeacherStudentManagement() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, roles, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const isTeacher = roles.includes("Teacher") || user?.teacherSubscription?.isTeacher === true;

  const fetchCourseDetail = useCallback(async () => {
    try {
      const response = await teacherService.getCourseDetail(courseId);
      if (response.data?.success && response.data?.data) {
        setCourse(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching course detail:", err);
    }
  }, [courseId]);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
        ...(searchTerm && { searchTerm: searchTerm })
      };

      const response = await teacherService.getCourseStudents(courseId, params);
      
      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        const items = data.items || data.Items || [];
        const total = data.totalCount || data.TotalCount || 0;
        const pages = data.totalPages || data.TotalPages || 1;
        
        setStudents(items);
        setTotalCount(total);
        setTotalPages(pages);
      } else {
        setError(response.data?.message || response.data?.Message || "Không thể tải danh sách học viên");
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Không thể tải danh sách học viên");
    } finally {
      setLoading(false);
    }
  }, [courseId, currentPage, pageSize, searchTerm]);

  useEffect(() => {
    if (!isAuthenticated || !isTeacher) {
      navigate("/home");
      return;
    }

    fetchCourseDetail();
    fetchStudents();
  }, [isAuthenticated, isTeacher, navigate, fetchCourseDetail, fetchStudents]);

  const handleStudentClick = async (studentId) => {
    try {
      const response = await teacherService.getStudentDetail(courseId, studentId);
      if (response.data?.success && response.data?.data) {
        setSelectedStudent(response.data.data);
        setShowStudentDetailModal(true);
      }
    } catch (err) {
      console.error("Error fetching student detail:", err);
    }
  };

  const handleAddStudentSuccess = () => {
    setShowAddStudentModal(false);
    setSuccessMessage("Đã thêm học viên vào khóa học thành công!");
    setShowSuccessModal(true);
    fetchStudents();
    fetchCourseDetail(); // Refresh course to update totalStudents
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    // fetchStudents will be called by useEffect when currentPage changes
  };

  if (!isAuthenticated || !isTeacher) {
    return null;
  }

  const courseTitle = course?.title || course?.Title || "Khóa học";

  return (
    <>
      <TeacherHeader />
      <div className="teacher-student-management-container">
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
              {courseTitle}
            </span>
            {" / "}
            <span className="breadcrumb-current">Quản lý học viên</span>
          </span>
        </div>

        <Container fluid className="student-management-content">
          <div className="student-management-header">
            <h2 className="page-title">Quản lý học viên</h2>
            <button 
              className="add-student-btn"
              onClick={() => setShowAddStudentModal(true)}
            >
              <FaPlus className="add-icon" />
              Thêm học viên
            </button>
          </div>

          {loading ? (
            <div className="loading-message">Đang tải danh sách học viên...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <>
              <div className="students-list">
                {students.length > 0 ? (
                  students.map((student) => {
                    const studentId = student.userId || student.UserId;
                    const displayName = student.displayName || student.DisplayName || 
                      `${student.firstName || student.FirstName || ""} ${student.lastName || student.LastName || ""}`.trim();
                    const email = student.email || student.Email || "";
                    const avatarUrl = student.avatarUrl || student.AvatarUrl;
                    
                    return (
                      <div 
                        key={studentId} 
                        className="student-card"
                        onClick={() => handleStudentClick(studentId)}
                      >
                        <div className="student-avatar">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={displayName} />
                          ) : (
                            <div className="avatar-placeholder">
                              <FaUser />
                            </div>
                          )}
                        </div>
                        <div className="student-info">
                          <h3 className="student-name">{displayName || "Chưa có tên"}</h3>
                          <p className="student-email">{email}</p>
                        </div>
                        <div className="student-arrow">
                          <span>›</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-students-message">
                    {searchTerm ? "Không tìm thấy học viên nào" : "Chưa có học viên nào trong khóa học"}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-wrapper">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => handlePageChange(1)} 
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => handlePageChange(currentPage - 1)} 
                      disabled={currentPage === 1}
                    />
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Pagination.Item
                            key={page}
                            active={page === currentPage}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Pagination.Item>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <Pagination.Ellipsis key={page} />;
                      }
                      return null;
                    })}
                    
                    <Pagination.Next 
                      onClick={() => handlePageChange(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last 
                      onClick={() => handlePageChange(totalPages)} 
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                  
                  <div className="pagination-info">
                    Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} / {totalCount} học viên
                  </div>
                </div>
              )}
            </>
          )}
        </Container>
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal
        show={showStudentDetailModal}
        onClose={() => setShowStudentDetailModal(false)}
        student={selectedStudent}
        courseId={courseId}
        onStudentRemoved={fetchStudents}
      />

      {/* Add Student Modal */}
      <AddStudentModal
        show={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        onSuccess={handleAddStudentSuccess}
        courseId={courseId}
      />

      {/* Success Modal */}
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

