import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MdAdd } from "react-icons/md";
import { adminService } from "../../../Services/adminService";
import CourseFilters from "../../../Components/Admin/CourseManagement/CourseFilters/CourseFilters";
import CourseTable from "../../../Components/Admin/CourseManagement/CourseTable/CourseTable";
import CourseFormModal from "../../../Components/Admin/CourseManagement/CourseFormModal/CourseFormModal";
import SuccessModal from "../../../Components/Common/SuccessModal/SuccessModal";
import ConfirmModal from "../../../Components/Common/ConfirmModal/ConfirmModal";
import UnauthorizedModal from "../../../Components/Common/UnauthorizedModal/UnauthorizedModal";
import { usePermission } from "../../../hooks/usePermission";
import "./AdminCourseList.css";

export default function AdminCourseList() {
  const navigate = useNavigate();
  const { checkPermission, showUnauthorizedModal, unauthorizedFeature, closeUnauthorizedModal } = usePermission();
  const [activeTab, setActiveTab] = useState("all");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0 });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Confirm delete modal state
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        searchTerm: searchTerm
      };

      if (activeTab === 'system') {
          params.type = 1; 
      } else if (activeTab === 'teacher') {
          params.type = 2;
      }

      const response = await adminService.getAllCourses(params);
      if (response.data && response.data.success) {
        setCourses(response.data.data.items || []);
        setPagination(prev => ({
            ...prev,
            totalCount: response.data.data.totalCount
        }));
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.pageNumber, pagination.pageSize, searchTerm]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCreateClick = () => {
    checkPermission("course_create", () => {
      setEditingCourse(null);
      setShowModal(true);
    });
  };

  const handleEditClick = (course) => {
    checkPermission("course_edit", () => {
      setEditingCourse(course);
      setShowModal(true);
    });
  };

  const handleDeleteCourse = (courseId) => {
      checkPermission("course_delete", () => {
        setDeletingCourseId(courseId);
        setShowConfirmDelete(true);
      });
  }

  const handleConfirmDelete = async () => {
    if (!deletingCourseId) return;
    setDeleting(true);
    try {
      const response = await adminService.deleteCourse(deletingCourseId);
      if (response.data && response.data.success) {
        setSuccessMessage("Course deleted successfully");
        setShowSuccessModal(true);
        fetchCourses();
      } else {
        console.error('Delete failed', response);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
      setShowConfirmDelete(false);
      setDeletingCourseId(null);
    }
  };

  const handleFormSubmit = (courseData) => {
    // Modal đã đóng, chỉ cần refresh và hiện success
    const message = editingCourse ? "Cập nhật khóa học thành công!" : "Tạo khóa học thành công!";
    setSuccessMessage(message);
    setShowSuccessModal(true);
    fetchCourses();
  };

  const handleViewCourse = (courseId) => {
    navigate(`/admin/courses/${courseId}`);
  };

  const handlePageChange = (page) => {
    setPagination({ ...pagination, pageNumber: page });
  };

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize);

  return (
    <div className="admin-course-management-container">
      {/* HEADER */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Course Management</h1>
          <p className="page-subtitle">Monitor and manage all system and teacher-created courses.</p>
        </div>
        <button className="btn-create" onClick={handleCreateClick}>
          <MdAdd /> Create New Course
        </button>
      </div>

      {/* FILTERS */}
      <CourseFilters 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={fetchCourses}
      />

      {/* COURSE TABLE */}
      <CourseTable 
        courses={courses}
        loading={loading}
        onView={handleViewCourse}
        onEdit={handleEditClick}
        onDelete={handleDeleteCourse}
        currentPage={pagination.pageNumber}
        totalPages={totalPages}
        totalCount={pagination.totalCount}
        pageSize={pagination.pageSize}
        onPageChange={handlePageChange}
      />

      {/* MODAL */}
      <CourseFormModal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        onSubmit={handleFormSubmit}
        initialData={editingCourse}
      />

      {/* SUCCESS MODAL */}
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Thành công"
        message={successMessage}
        autoClose={true}
        autoCloseDelay={1500}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => { if (!deleting) { setShowConfirmDelete(false); setDeletingCourseId(null); } }}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa khóa học"
        message="Bạn có chắc chắn muốn xóa khóa học này? Hành động không thể hoàn tác."
        confirmText={deleting ? "Đang xóa..." : "Xác nhận"}
        cancelText="Hủy"
        type="delete"
        loading={deleting}
      />

      {/* UNAUTHORIZED MODAL */}
      <UnauthorizedModal 
        show={showUnauthorizedModal}
        onClose={closeUnauthorizedModal}
        feature={unauthorizedFeature}
      />
    </div>
  );
}