import React from "react";
import { Card } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./QuizList.css";

export default function QuizList({ quizzes, onEdit, onCardClick, onDelete }) {
    if (!quizzes || quizzes.length === 0) {
        return (
            <div className="quiz-list-container">
                <h3 className="section-title">Các bài Quiz đã tạo</h3>
                <div className="empty-message">
                    <p>Chưa có bài Quiz nào</p>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-list-container">
            <h3 className="section-title">Các bài Quiz đã tạo</h3>
            <div className="quiz-cards">
                {quizzes.map((quiz) => {
                    const quizId = quiz.quizId || quiz.QuizId;
                    const assessmentId = quiz.assessmentId || quiz.AssessmentId;
                    const title = quiz.title || quiz.Title || "Untitled Quiz";
                    // Use assessmentIsPublished from assessment, not quiz status
                    const isPublished = quiz.assessmentIsPublished !== undefined
                        ? quiz.assessmentIsPublished
                        : (quiz.AssessmentIsPublished !== undefined ? quiz.AssessmentIsPublished : false);

                    return (
                        <Card
                            key={quizId || assessmentId}
                            className="quiz-card"
                            onClick={() => onCardClick && onCardClick(quiz)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Card.Body>
                                <div className="quiz-card-header">
                                    <h5 className="quiz-title">{title}</h5>
                                    <div className="quiz-actions" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="action-btn edit-btn"
                                            onClick={() => onEdit(quiz)}
                                            title="Chỉnh sửa"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() => onDelete(quiz)}
                                            title="Xóa"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                                <div className="quiz-card-footer">
                                    <span className={`status-badge ${isPublished ? "published" : "draft"}`}>
                                        {isPublished ? "Published" : "Draft"}
                                    </span>
                                </div>
                            </Card.Body>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

