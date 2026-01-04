import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdArrowBack, MdDelete, MdEdit, MdPlayCircleOutline, MdFolder } from "react-icons/md";
import { adminService } from "../../../../Services/adminService";
import SuccessModal from "../../../../Components/Common/SuccessModal/SuccessModal";

export default function AdminCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      const response = await adminService.getCourseContent(courseId);
      if (response.data && response.data.success) {
        setCourse(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching course detail", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
      if(!window.confirm("Are you sure you want to delete this course?")) return;
        try {
        await adminService.deleteCourse(courseId);
        setSuccessMessage("Course deleted");
        setShowSuccessModal(true);
        setTimeout(() => navigate("/admin/courses"), 500);
      } catch (error) {
        setSuccessMessage("Failed to delete");
        setShowSuccessModal(true);
      }
  }

  if (loading) return <div className="p-5 text-center">Loading content...</div>;
  if (!course) return <div className="p-5 text-center text-danger">Course not found</div>;

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-link text-dark me-3 p-0" onClick={() => navigate("/admin/courses")}>
          <MdArrowBack size={24} />
        </button>
        <div>
          <h2 className="mb-0 fw-bold">{course.title}</h2>
          <span className="text-muted small">ID: #{course.courseId} • By {course.teacherName || "System"}</span>
        </div>
        <div className="ms-auto">
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                <MdDelete className="me-1"/> Delete Course
            </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Info Card */}
        <div className="col-md-4">
            <div className="admin-card mb-4">
                <img src={course.imageUrl || "https://via.placeholder.com/300x200"} alt="Course" className="w-100 rounded-top" style={{height: '200px', objectFit: 'cover'}} />
                <div className="p-3">
                    <h5 className="fw-bold">Description</h5>
                    <p className="text-muted small" style={{whiteSpace: 'pre-line'}}>{course.description}</p>
                    <div className="d-flex justify-content-between border-top pt-3 mt-3">
                        <span className="fw-bold">Price</span>
                        <span className="text-primary">{course.price?.toLocaleString()} ₫</span>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                        <span className="fw-bold">Students</span>
                        <span>{course.studentCount}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Content Tree */}
        <div className="col-md-8">
            <div className="admin-card p-4">
                <h5 className="fw-bold mb-4 border-bottom pb-2">Course Content (Lessons)</h5>
                
                {course.lessons && course.lessons.length > 0 ? (
                    <div className="list-group list-group-flush">
                        {course.lessons.map((lesson, index) => (
                            <div key={lesson.lessonId} className="list-group-item px-0 py-3">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-light rounded p-2 me-3 text-primary">
                                            <MdPlayCircleOutline size={20}/>
                                        </div>
                                        <div>
                                            <h6 className="mb-0 fw-bold">{index + 1}. {lesson.title}</h6>
                                            <small className="text-muted">{lesson.description || "No description"}</small>
                                        </div>
                                    </div>
                                    <button className="btn btn-sm btn-outline-secondary" title="Edit Lesson (Coming Soon)">
                                        <MdEdit size={16}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-5 text-muted">
                        <MdFolder size={48} className="mb-3 opacity-50"/>
                        <p>No lessons found in this course.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Thông báo"
        message={successMessage}
      />
    </div>
  );
}
