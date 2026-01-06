import React from "react";
import { Pagination } from "react-bootstrap";
import { MdEdit, MdDelete, MdVisibility, MdMenuBook } from "react-icons/md";
import "./CourseTable.css";

export default function CourseTable({ 
  courses, 
  loading, 
  onView, 
  onEdit, 
  onDelete,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 10,
  onPageChange
}) {
  const formatPrice = (price) => {
    if (price === 0 || !price) {
      return <span className="price-free">Free</span>;
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getTypeBadge = (type) => {
    return type === 1 
      ? <span className="type-badge type-system">System</span> 
      : <span className="type-badge type-teacher">Teacher</span>;
  };

  return (
    <div className="course-table-container">
      <div className="table-responsive">
        <table className="course-table">
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
              <tr>
                <td colSpan="6" className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  No courses found
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr 
                  key={course.courseId}
                  onClick={() => onView(course.courseId)}
                  style={{ cursor: 'pointer' }}
                  className="course-row-clickable"
                >
                  <td>
                    <div className="course-info">
                      {course.imageUrl ? (
                        <img 
                          src={course.imageUrl} 
                          alt="Course" 
                          className="course-thumbnail"
                        />
                      ) : (
                        <div className="course-thumbnail-placeholder">
                          <MdMenuBook size={20} />
                        </div>
                      )}
                      <div className="course-details">
                        <div className="table-course-title">{course.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted">{course.teacherName || "System Admin"}</td>
                  <td>{getTypeBadge(course.type)}</td>
                  <td>{formatPrice(course.price)}</td>
                  <td className="text-center">{course.studentCount || 0}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn action-view" 
                        title="View Details"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(course.courseId);
                        }}
                      >
                        <MdVisibility />
                      </button>
                      <button 
                        className="action-btn action-edit" 
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(course);
                        }}
                      >
                        <MdEdit />
                      </button>
                      <button 
                        className="action-btn action-delete" 
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(course.courseId);
                        }}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-wrapper">
          <Pagination>
            <Pagination.First 
              onClick={() => onPageChange(1)} 
              disabled={currentPage === 1}
            />
            <Pagination.Prev 
              onClick={() => onPageChange(currentPage - 1)} 
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
                    onClick={() => onPageChange(page)}
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
              onClick={() => onPageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            />
            <Pagination.Last 
              onClick={() => onPageChange(totalPages)} 
              disabled={currentPage === totalPages}
            />
          </Pagination>
          
          <div className="pagination-info">
            Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} / {totalCount} courses
          </div>
        </div>
      )}
    </div>
  );
}
