
import React from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { Card, Button, Row, Col } from "react-bootstrap";
import "./QuizCard.css";

export default function QuizCard({ assessment, onClick }) {
    const formatTimeLimit = (timeLimit) => {
        if (!timeLimit) return "Không giới hạn";
        const parts = timeLimit.split(":");
        if (parts.length === 3) {
            const hours = parseInt(parts[0]);
            const minutes = parseInt(parts[1]);
            if (hours > 0) {
                return `${hours} giờ ${minutes} phút`;
            }
            return `${minutes} phút`;
        }
        return timeLimit;
    };

    return (
        <Card className="quiz-card" onClick={onClick} style={{ cursor: "pointer" }}>
            <Card.Body>
                <Row className="align-items-center">
                    <Col xs="auto">
                        <div className="quiz-icon-wrapper">
                            <div className="quiz-icon">
                                <FaQuestionCircle size={32} />
                            </div>
                        </div>
                    </Col>
                    <Col>
                        <Card.Title className="quiz-title">{assessment.title}</Card.Title>
                        {assessment.description && (
                            <Card.Text className="quiz-description">{assessment.description}</Card.Text>
                        )}
                        <div className="quiz-meta">
                            {assessment.timeLimit && (
                                <span className="quiz-meta-item me-3">
                                    Thời gian: {formatTimeLimit(assessment.timeLimit)}
                                </span>
                            )}
                            {assessment.totalPoints && (
                                <span className="quiz-meta-item">
                                    Điểm: {assessment.totalPoints}
                                </span>
                            )}
                        </div>
                    </Col>
                    <Col xs="auto">
                        <Button
                            variant="success"
                            className="quiz-start-btn"
                            onClick={e => {
                                e.stopPropagation();
                                onClick();
                            }}
                        >
                            Làm Quiz
                        </Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

