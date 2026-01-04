import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card, Badge } from "react-bootstrap";
import MainHeader from "../../Components/Header/MainHeader";
import { useSubmissionStatus } from "../../hooks/useSubmissionStatus";
import { quizAttemptService } from "../../Services/quizAttemptService";
import { quizService } from "../../Services/quizService";
import { FaCheckCircle, FaTimesCircle, FaClock, FaTrophy } from "react-icons/fa";
import "./QuizResults.css";

export default function QuizResults() {
    const { courseId, lessonId, moduleId, attemptId } = useParams();
    const navigate = useNavigate();
    const { isSubmitted } = useSubmissionStatus();
    
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [assessmentId, setAssessmentId] = useState(null);
    const [quizId, setQuizId] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true);
                setError("");

                let attemptData = null;

                // ƯU TIÊN 1: Lấy từ localStorage (Dữ liệu này được QuizDetail lưu ngay khi nộp thành công)
                const savedResult = localStorage.getItem(`quiz_result_${attemptId}`);
                if (savedResult) {
                    console.log("✅ [QuizResults] Found result in localStorage");
                    attemptData = JSON.parse(savedResult);
                } else {
                    // ƯU TIÊN 2: Nếu F5 hoặc mất cache, thử gọi Resume API (Backend thường trả về kết quả nếu đã nộp)
                    console.log("🔍 [QuizResults] Fetching via Resume API as fallback...");
                    const response = await quizAttemptService.resume(attemptId);
                    
                    if (response.data?.success && response.data?.data) {
                        attemptData = response.data.data;
                        console.log("📥 [QuizResults] Data from Resume API:", attemptData);
                    } else {
                        setError("Không tìm thấy kết quả bài thi này.");
                    }
                }

                if (attemptData) {
                    setResult(attemptData);
                    // Extract quizId from result
                    const qId = attemptData.quizId || attemptData.QuizId;
                    if (qId) {
                        setQuizId(qId);
                        // Fetch quiz info to get assessmentId
                        try {
                            const quizRes = await quizService.getById(qId);
                            if (quizRes.data?.success && quizRes.data?.data) {
                                const quizData = Array.isArray(quizRes.data.data) ? quizRes.data.data[0] : quizRes.data.data;
                                const aId = quizData.assessmentId || quizData.AssessmentId;
                                if (aId) {
                                    setAssessmentId(aId);
                                    console.log("✅ [QuizResults] Found AssessmentId:", aId);
                                }
                            }
                        } catch (qErr) {
                            console.error("Error fetching quiz info:", qErr);
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching results:", err);
                setError("Không thể tải kết quả quiz. Có thể bài thi không tồn tại hoặc đã hết hạn.");
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

    const handleBack = () => {
        if (assessmentId) {
            navigate(`/course/${courseId}/lesson/${lessonId}/module/${moduleId}/assignment/${assessmentId}`);
        } else {
            navigate(`/course/${courseId}/lesson/${lessonId}/module/${moduleId}/assignment`);
        }
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
                        onClick={handleBack}
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

    // Tính toán tổng điểm tối đa dựa trên điểm đạt được và tỷ lệ %
    // MaxScore = (totalScore * 100) / percentage
    const maxScore = (percentage > 0) ? (totalScore * 100) / percentage : (totalScore > 0 ? totalScore : 0);

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
                                            {isPassed ? "Chúc mừng! Bạn đã hoàn thành bài thi" : "Kết quả làm bài của bạn"}
                                        </h2>
                                        <div className="results-score">
                                            <div className="score-display">
                                                <span className="score-current">{totalScore.toFixed(1)}</span>
                                                <span className="score-separator">/</span>
                                                <span className="score-total">{Math.round(maxScore)}</span>
                                            </div>
                                            <div className="score-percentage-badge">
                                                <Badge bg={isPassed ? "success" : "danger"}>
                                                    {percentage.toFixed(1)}%
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary Stats */}
                                    <div className="results-summary">
                                        <Row className="g-3">
                                            <Col md={4}>
                                                <div className="summary-item border rounded p-3 h-100 bg-white shadow-sm">
                                                    <FaClock className="summary-icon text-primary mb-2" size={24} />
                                                    <div className="summary-content">
                                                        <div className="summary-label text-muted small">Thời gian làm bài</div>
                                                        <div className="summary-value fw-bold">{formatTime(timeSpentSeconds)}</div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={4}>
                                                <div className="summary-item border rounded p-3 h-100 bg-white shadow-sm">
                                                    <FaCheckCircle className="summary-icon text-success mb-2" size={24} />
                                                    <div className="summary-content">
                                                        <div className="summary-label text-muted small">Điểm số đạt được</div>
                                                        <div className="summary-value fw-bold text-success">{totalScore.toFixed(1)} điểm</div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={4}>
                                                <div className="summary-item border rounded p-3 h-100 bg-white shadow-sm">
                                                    <FaTrophy className="summary-icon text-warning mb-2" size={24} />
                                                    <div className="summary-content">
                                                        <div className="summary-label text-muted small">Nộp bài lúc</div>
                                                        <div className="summary-value fw-bold">{formatDate(submittedAt)}</div>
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
                                            onClick={handleBack}
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

