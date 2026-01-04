import React, { useState, useEffect } from "react";
import { Card, Spinner } from "react-bootstrap";
import { FaClipboardList } from "react-icons/fa";
import { quizService } from "../../../../Services/quizService";
import "./QuizList.css";

export default function QuizList({ assessmentId, onSelect, isAdmin = false }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, [assessmentId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError("");
      const response = isAdmin
        ? await quizService.getAdminQuizzesByAssessment(assessmentId)
        : await quizService.getTeacherQuizzesByAssessment(assessmentId);
      if (response.data?.success) {
        const data = response.data.data || [];
        setQuizzes(data);
      }
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setError("Không thể tải danh sách quiz");
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
    <div className="quiz-list">
      {quizzes.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p>Chưa có quiz nào</p>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map((quiz) => {
            const quizId = quiz.quizId || quiz.QuizId;
            const title = quiz.title || quiz.Title || "Untitled Quiz";

            return (
              <Card
                key={quizId}
                className="quiz-card"
                onClick={() => onSelect(quiz)}
                style={{ cursor: "pointer" }}
              >
                <Card.Body className="d-flex align-items-center gap-3">
                  <div className="quiz-icon">
                    <FaClipboardList size={24} />
                  </div>
                  <div className="flex-grow-1">
                    <Card.Title className="quiz-title mb-0">{title}</Card.Title>
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

