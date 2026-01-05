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

    const countAnswered = (answersObj) => {
        if (!answersObj) return 0;
        try {
            return Object.values(answersObj).filter(v => {
                if (v === null || v === undefined) return false;
                if (Array.isArray(v)) return v.length > 0;
                if (typeof v === 'object') return Object.keys(v).length > 0;
                if (typeof v === 'string') return v.trim() !== "";
                return true; // number/boolean treated as answered
            }).length;
        } catch (e) {
            return 0;
        }
    };

    const answeredCount = countAnswered(answers);

    return (
        <Card className="quiz-navigation">
            <Card.Body>
                <div className="navigation-header">
                    <h4 className="navigation-title">Danh sách câu hỏi</h4>
                    <div className="navigation-stats">
                        <div className="stat-panel">
                                <div className="stat-content">
                                    <FaCheckCircle className="stat-icon" />
                                    <span className="stat-text">{answeredCount}/{questions ? questions.length : 0}</span>
                                </div>
                        </div>
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

