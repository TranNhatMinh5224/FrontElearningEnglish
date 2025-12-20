
import React from "react";
import { FaEdit } from "react-icons/fa";
import { Card, Button, Row, Col } from "react-bootstrap";
import "./EssayCard.css";

export default function EssayCard({ assessment, onClick }) {
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
        <Card className="essay-card" onClick={onClick} style={{ cursor: "pointer" }}>
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
                            {assessment.totalPoints && (
                                <span className="essay-meta-item">
                                    Điểm: {assessment.totalPoints}
                                </span>
                            )}
                        </div>
                    </Col>
                    <Col xs="auto">
                        <Button
                            variant="primary"
                            className="essay-start-btn d-flex align-items-center"
                            onClick={e => {
                                e.stopPropagation();
                                onClick();
                            }}
                        >
                            <FaEdit className="me-2" />
                            Bắt đầu Viết Essay
                        </Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

