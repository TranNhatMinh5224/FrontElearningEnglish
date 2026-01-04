import React, { useState, useEffect } from "react";
import { Card, Spinner } from "react-bootstrap";
import { FaBookOpen } from "react-icons/fa";
import { teacherService } from "../../../../Services/teacherService";
import { adminService } from "../../../../Services/adminService";
import "./LessonList.css";

export default function LessonList({ courseId, onSelect, isAdmin = false }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError("");
      const service = isAdmin ? adminService : teacherService;
      const response = await service.getLessonsByCourse(courseId);
      if (response.data?.success) {
        const data = response.data.data || [];
        setLessons(data);
      }
    } catch (err) {
      console.error("Error fetching lessons:", err);
      setError("Không thể tải danh sách bài học");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="lesson-list">
      {lessons.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p>Chưa có bài học nào</p>
        </div>
      ) : (
        <div className="lesson-grid">
          {lessons.map((lesson) => {
            const lessonId = lesson.lessonId || lesson.LessonId;
            const title = lesson.title || lesson.Title || "Untitled Lesson";

            return (
              <Card
                key={lessonId}
                className="lesson-card"
                onClick={() => onSelect(lesson)}
                style={{ cursor: "pointer" }}
              >
                <Card.Body className="d-flex align-items-center gap-3">
                  <div className="lesson-icon">
                    <FaBookOpen size={24} />
                  </div>
                  <div className="flex-grow-1">
                    <Card.Title className="lesson-title mb-0">{title}</Card.Title>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

