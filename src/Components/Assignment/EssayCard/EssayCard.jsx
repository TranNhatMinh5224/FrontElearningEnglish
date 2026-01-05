
import React from "react";
import { FaEdit, FaStar, FaEye } from "react-icons/fa";
import { Card, Button, Row, Col } from "react-bootstrap";
import "./EssayCard.css";

export default function EssayCard({ assessment, onClick, submission, onViewResult }) {
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

    // Check if essay has been graded
    const isGraded = submission && (submission.teacherScore !== null && submission.teacherScore !== undefined || 
                     submission.TeacherScore !== null && submission.TeacherScore !== undefined ||
                     submission.score !== null && submission.score !== undefined ||
                     submission.Score !== null && submission.Score !== undefined);

    return (
        <Card 
            className="essay-card" 
            onClick={isGraded ? undefined : onClick} 
            style={{ cursor: isGraded ? "default" : "pointer" }}
        >
            <Card.Body>
                <Row className="align-items-center">
                    <Col xs="auto">
                        <div className="essay-icon-wrapper">
                            <div className="essay-icon">
                                <FaEdit size={32} />
                            </div>
                        </div>
                    </Col>
                    <Col>
                        <Card.Title className="essay-title">{assessment.title}</Card.Title>
                        {assessment.description && (
                            <Card.Text className="essay-description">{assessment.description}</Card.Text>
                        )}
                        <div className="essay-meta">
                            {assessment.timeLimit && (
                                <span className="essay-meta-item me-3">
                                    Thời gian: {formatTimeLimit(assessment.timeLimit)}
                                </span>
                            )}
                            {/* Removed static total points display from list view as requested */}
                        </div>
                    </Col>
                    <Col xs="auto">
                        {submission && (submission.teacherScore !== null && submission.teacherScore !== undefined || 
                         submission.TeacherScore !== null && submission.TeacherScore !== undefined ||
                         submission.score !== null && submission.score !== undefined ||
                         submission.Score !== null && submission.Score !== undefined) ? (
                            // Student has been graded - Show score and view result button
                            <div className="d-flex align-items-center gap-3">
                                <div className="essay-score-badge">
                                    <FaStar className="text-warning me-1" />
                                    <span className="fw-bold">Điểm: {submission.teacherScore || submission.TeacherScore || submission.score || submission.Score}/10</span>
                                </div>
                                <Button
                                    variant="success"
                                    className="d-flex align-items-center"
                                    onClick={e => {
                                        e.stopPropagation();
                                        onViewResult(submission);
                                    }}
                                >
                                    <FaEye className="me-2" />
                                    Xem kết quả
                                </Button>
                            </div>
                        ) : (
                            // Not graded - Show normal button
                            <Button
                                variant="primary"
                                className="essay-start-btn d-flex align-items-center"
                                onClick={e => {
                                    e.stopPropagation();
                                    onClick();
                                }}
                            >
                                <FaEdit className="me-2" />
                                {submission ? 'Cập nhật Essay' : 'Bắt đầu Viết Essay'}
                            </Button>
                        )}
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

