import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card, Badge } from "react-bootstrap";
import MainHeader from "../../Components/Header/MainHeader";
import { useSubmissionStatus } from "../../hooks/useSubmissionStatus";
import { quizAttemptService } from "../../Services/quizAttemptService";
import { FaCheckCircle, FaTimesCircle, FaClock, FaTrophy } from "react-icons/fa";
import "./QuizResults.css";

export default function QuizResults() {
    const { courseId, lessonId, moduleId, attemptId } = useParams();
    const navigate = useNavigate();
    const { isSubmitted } = useSubmissionStatus();
    
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true);
                setError("");

                // Get result from submit response or fetch by attemptId
                const response = await quizAttemptService.getById(attemptId);
                
                if (response.data?.success && response.data?.data) {
                    // If already submitted, get result
                    // Otherwise, try to get from submit endpoint
                    const attemptData = response.data.data;
                    const status = attemptData.Status || attemptData.status;
                    
                    if (isSubmitted(status)) {
                        // Attempt is submitted, fetch result
                        // The result should be in the submit response, but we can also parse from attempt
                        // For now, we'll need to call submit again or get result differently
                        // Actually, we should pass result data from QuizDetail after submit
                        // For now, let's try to get it from localStorage or state
                        const savedResult = localStorage.getItem(`quiz_result_${attemptId}`);
                        if (savedResult) {
                            setResult(JSON.parse(savedResult));
                        } else {
                            // Try to reconstruct from attempt data
                            setError("Không thể tải kết quả. Vui lòng thử lại.");
                        }
                    } else {
                        setError("Bài quiz chưa được nộp.");
                    }
                } else {
                    setError("Không thể tải kết quả quiz.");
                }
            } catch (err) {
                console.error("Error fetching results:", err);
                // Try to get from localStorage
                const savedResult = localStorage.getItem(`quiz_result_${attemptId}`);
                if (savedResult) {
                    setResult(JSON.parse(savedResult));
                } else {
                    setError(err.response?.data?.message || "Không thể tải kết quả quiz.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (attemptId) {
            fetchResults();
        }
    }, [attemptId]);

    // Get result from location state (passed from QuizDetail after submit)
    useEffect(() => {
        const locationState = window.history.state;
        if (locationState?.result) {
            setResult(locationState.result);
            setLoading(false);
            // Save to localStorage as backup
            localStorage.setItem(`quiz_result_${attemptId}`, JSON.stringify(locationState.result));
        }
    }, [attemptId]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const parseCorrectAnswer = (correctOption) => {
        if (typeof correctOption === 'string') {
            // Try to parse JSON-like strings
            if (correctOption.startsWith("Correct answer data: ")) {
                try {
                    const jsonStr = correctOption.replace("Correct answer data: ", "");
                    return JSON.parse(jsonStr);
                } catch (e) {
                    return correctOption;
                }
            }
            return correctOption;
        }
        if (Array.isArray(correctOption)) {
            return correctOption;
        }
        if (typeof correctOption === 'object') {
            return correctOption;
        }
        return [correctOption];
    };

    if (loading) {
        return (
            <>
                <MainHeader />
                <div className="quiz-results-container">
                    <div className="loading-message">Đang tải kết quả...</div>
                </div>
            </>
        );
    }

    if (error && !result) {
        return (
            <>
                <MainHeader />
                <div className="quiz-results-container">
                    <div className="error-message">{error}</div>
                    <Button
                        variant="primary"
                        onClick={() => navigate(`/course/${courseId}/lesson/${lessonId}/module/${moduleId}/assignment`)}
                        style={{ marginTop: "20px" }}
                    >
                        Quay lại
                    </Button>
                </div>
            </>
        );
    }

    if (!result) {
        return (
            <>
                <MainHeader />
                <div className="quiz-results-container">
                    <div className="error-message">Không tìm thấy kết quả</div>
                </div>
            </>
        );
    }

    const { totalScore, percentage, isPassed, correctAnswers, submittedAt, timeSpentSeconds } = result;

    return (
        <>
            <MainHeader />
            <div className="quiz-results-container">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={10}>
                            <Card className="results-card">
                                <Card.Body>
                                    {/* Header */}
                                    <div className="results-header">
                                        <div className={`result-icon ${isPassed ? "passed" : "failed"}`}>
                                            {isPassed ? (
                                                <FaTrophy className="trophy-icon" />
                                            ) : (
                                                <FaTimesCircle className="failed-icon" />
                                            )}
                                        </div>
                                        <h2 className="results-title">
                                            {isPassed ? "Chúc mừng! Bạn đã vượt qua bài quiz" : "Bạn chưa vượt qua bài quiz"}
                                        </h2>
                                        <div className="results-score">
                                            <span className="score-value">{totalScore.toFixed(1)}</span>
                                            <span className="score-percentage">({percentage.toFixed(1)}%)</span>
                                        </div>
                                    </div>

                                    {/* Summary Stats */}
                                    <div className="results-summary">
                                        <Row>
                                            <Col md={4}>
                                                <div className="summary-item">
                                                    <FaClock className="summary-icon" />
                                                    <div className="summary-content">
                                                        <div className="summary-label">Thời gian làm bài</div>
                                                        <div className="summary-value">{formatTime(timeSpentSeconds)}</div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={4}>
                                                <div className="summary-item">
                                                    <FaCheckCircle className="summary-icon" />
                                                    <div className="summary-content">
                                                        <div className="summary-label">Điểm số</div>
                                                        <div className="summary-value">{totalScore.toFixed(1)} điểm</div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={4}>
                                                <div className="summary-item">
                                                    <FaClock className="summary-icon" />
                                                    <div className="summary-content">
                                                        <div className="summary-label">Nộp bài lúc</div>
                                                        <div className="summary-value">{formatDate(submittedAt)}</div>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Correct Answers */}
                                    <div className="correct-answers-section">
                                        <h3 className="section-title">Đáp án đúng</h3>
                                        <div className="answers-list">
                                            {correctAnswers && correctAnswers.map((item, index) => {
                                                const correctOptions = parseCorrectAnswer(item.correctOptions || item.correctOption);
                                                const isArray = Array.isArray(correctOptions);
                                                const isObject = typeof correctOptions === 'object' && !isArray;

                                                return (
                                                    <Card key={item.questionId || index} className="answer-card">
                                                        <Card.Body>
                                                            <div className="answer-header">
                                                                <Badge bg="primary" className="question-badge">
                                                                    Câu {index + 1}
                                                                </Badge>
                                                            </div>
                                                            <div className="question-text">
                                                                {item.questionText || item.QuestionText}
                                                            </div>
                                                            <div className="correct-answer">
                                                                <span className="answer-label">Đáp án đúng:</span>
                                                                <div className="answer-content">
                                                                    {isArray ? (
                                                                        <div className="answer-list">
                                                                            {correctOptions.map((opt, idx) => (
                                                                                <Badge key={idx} bg="success" className="answer-badge">
                                                                                    {opt}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    ) : isObject ? (
                                                                        <div className="answer-object">
                                                                            {Object.entries(correctOptions).map(([key, value], idx) => (
                                                                                <div key={idx} className="answer-pair">
                                                                                    <Badge bg="info">{key}</Badge>
                                                                                    <span className="arrow">→</span>
                                                                                    <Badge bg="success">{value}</Badge>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <Badge bg="success" className="answer-badge">
                                                                            {correctOptions}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="results-actions">
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => navigate(`/course/${courseId}/lesson/${lessonId}/module/${moduleId}/assignment`)}
                                        >
                                            Quay lại
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
}

