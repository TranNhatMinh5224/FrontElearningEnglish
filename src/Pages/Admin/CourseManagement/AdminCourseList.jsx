import React, { useState, useEffect } from "react";
import { MdAdd, MdFilterList, MdSearch, MdEdit, MdDelete, MdVisibility, MdMenuBook } from "react-icons/md";
import { adminService } from "../../../Services/adminService";
import CourseFormModal from "./CourseFormModal";

export default function AdminCourseList() {
  const [activeTab, setActiveTab] = useState("all");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0 });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [activeTab, pagination.pageNumber, searchTerm]); 

  const fetchCourses = async () => {
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
        setPagination({
            ...pagination,
            totalCount: response.data.data.totalCount
        });
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingCourse(null);
    setShowModal(true);
  };

  const handleEditClick = (course) => {
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleDeleteCourse = async (courseId) => {
      if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
      try {
          const response = await adminService.deleteCourse(courseId);
          if (response.data.success) {
              alert("Course deleted successfully");
              fetchCourses();
          }
      } catch (error) {
          console.error(error);
          alert("Failed to delete course");
      }
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (editingCourse) {
        // Update
        await adminService.updateCourse(editingCourse.courseId, formData);
        alert("Course updated successfully!");
      } else {
        // Create
        await adminService.createCourse(formData);
        alert("Course created successfully!");
      }
      setShowModal(false);
      fetchCourses();
    } catch (error) {
      console.error("Error saving course", error);
      alert("Failed to save course. Check inputs.");
    }
  };

  const handleSearch = (e) => {
      if(e.key === 'Enter') {
          fetchCourses();
      }
  }

  const formatPrice = (price) => {
      if (price === 0 || !price) return <span className="text-success fw-bold">Free</span>;
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getTypeBadge = (type) => {
      return type === 1 
        ? <span className="badge bg-primary">System</span> 
        : <span className="badge bg-info text-dark">Teacher</span>;
  };

  return (
    <div className="course-management-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title mb-1">Course Management</h1>
          <p className="text-muted">Monitor and manage all system and teacher-created courses.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center" onClick={handleCreateClick}>
          <MdAdd className="me-2"/> Create New Course
        </button>
      </div>

      {/* FILTERS CARD */}
      <div className="admin-card mb-4 p-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="btn-group">
            <button 
              className={`btn ${activeTab === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('all')}
            >
              All Courses
            </button>
            <button 
              className={`btn ${activeTab === 'system' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('system')}
            >
              System Courses
            </button>
            <button 
              className={`btn ${activeTab === 'teacher' ? 'btn-info' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('teacher')}
            >
              Teacher Courses
            </button>
          </div>

          <div className="d-flex gap-2">
            <div className="input-group" style={{maxWidth: '300px'}}>
              <span className="input-group-text bg-white border-end-0"><MdSearch /></span>
              <input 
                type="text" 
                className="form-control border-start-0 ps-0" 
                placeholder="Search course..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
            <button className="btn btn-outline-secondary"><MdFilterList /></button>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{width: '35%'}}>Course Name</th>
                <th>Instructor</th>
                <th>Type</th>
                <th>Price</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                  <tr><td colSpan="6" className="text-center p-4">Loading courses...</td></tr>
              ) : courses.length === 0 ? (
                  <tr><td colSpan="6" className="text-center p-4">No courses found.</td></tr>
              ) : (
                  courses.map((course) => (
                    <tr key={course.courseId}>
                        <td>
                        <div className="d-flex align-items-center">
                            {course.imageUrl ? (
                                <img 
                                src={course.imageUrl} 
                                alt="Course" 
                                className="rounded me-3" 
                                style={{width: '40px', height: '40px', objectFit: 'cover'}}
                                />
                            ) : (
                                <div className="rounded me-3 d-flex align-items-center justify-content-center bg-light" style={{width: '40px', height: '40px'}}>
                                    <MdMenuBook size={20} className="text-muted"/>
                                </div>
                            )}
                            <div>
                            <div className="fw-bold text-truncate" style={{maxWidth: '250px'}}>{course.title}</div>
                            <small className="text-muted">ID: #CRS-{course.courseId}</small>
                            </div>
                        </div>
                        </td>
                        <td>
                            <span className="small">{course.teacherName || "System Admin"}</span>
                        </td>
                        <td>{getTypeBadge(course.type)}</td>
                        <td>{formatPrice(course.price)}</td>
                        <td>{course.studentCount}</td>
                        <td>
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-light text-primary" title="View"><MdVisibility /></button>
                            <button 
                                className="btn btn-sm btn-light text-secondary" 
                                title="Edit"
                                onClick={() => handleEditClick(course)}
                            >
                                <MdEdit />
                            </button>
                            <button 
                                className="btn btn-sm btn-light text-danger" 
                                title="Delete"
                                onClick={() => handleDeleteCourse(course.courseId)}
                            >
                                <MdDelete />
                            </button>
                        </div>
                        </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      <CourseFormModal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        onSubmit={handleFormSubmit}
        initialData={editingCourse}
      />
    </div>
  );
}