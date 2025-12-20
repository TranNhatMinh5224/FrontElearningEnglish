import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { Card, Row, Col } from "react-bootstrap";
import "./QuizNavigation.css";

export default function QuizNavigation({ questions, currentIndex, answers, onGoToQuestion }) {
    const getQuestionStatus = (question, index) => {
        const questionId = question.questionId || question.QuestionId;
        const hasAnswer = answers[questionId] !== undefined && answers[questionId] !== null;
        const isCurrent = index === currentIndex;
        
        if (isCurrent) return "current";
        if (hasAnswer) return "answered";
        return "unanswered";
    };

    return (
        <Card className="quiz-navigation">
            <Card.Body>
                <div className="navigation-header">
                    <h4 className="navigation-title">Danh sách câu hỏi</h4>
                    <div className="navigation-stats">
                        <span className="stat-item answered-stat">
                            <FaCheckCircle /> {Object.keys(answers).length}
                        </span>
                        <span className="stat-item total-stat">
                            / {questions.length}
                        </span>
                    </div>
                </div>
                <div className="navigation-grid">
                    {questions.map((question, index) => {
                        const status = getQuestionStatus(question, index);
                        const questionId = question.questionId || question.QuestionId;
                        return (
                            <button
                                key={questionId || index}
                                type="button"
                                className={`navigation-item ${status}`}
                                onClick={() => onGoToQuestion(index)}
                            >
                                {index + 1}
                            </button>
                        );
                    })}
                </div>
                <div className="navigation-legend">
                    <div className="legend-item">
                        <div className="legend-color current"></div>
                        <span>Đang làm</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color answered"></div>
                        <span>Đã trả lời</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color unanswered"></div>
                        <span>Chưa trả lời</span>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}

