import React, { useState, useEffect } from "react";
import { Button, Row, Col } from "react-bootstrap";
import { FaQuestionCircle, FaEdit, FaClock, FaCheckCircle, FaTimesCircle, FaList, FaRedo, FaRandom } from "react-icons/fa";
import { quizAttemptService } from "../../../Services/quizAttemptService";
import { essayService } from "../../../Services/essayService";
import { quizService } from "../../../Services/quizService";
import "./AssessmentInfoModal.css";

export default function AssessmentInfoModal({ 
    isOpen, 
    onClose, 
    assessment,
    onStartQuiz,
    onStartEssay
}) {
    const [quiz, setQuiz] = useState(null);
    const [essay, setEssay] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [inProgressAttempt, setInProgressAttempt] = useState(null);
    const [checkingProgress, setCheckingProgress] = useState(false);

    useEffect(() => {
        if (isOpen && assessment) {
            fetchAssessmentDetails();
        } else {
            // Reset state when modal closes
            setQuiz(null);
            setEssay(null);
            setInProgressAttempt(null);
            setError("");
            setCheckingProgress(false);
        }
    }, [isOpen, assessment]);

    const fetchAssessmentDetails = async () => {
        if (!assessment) return;

        setLoading(true);
        setError("");

        try {
            // Kiểm tra xem assessment có quiz hay essay
            const titleLower = assessment.title?.toLowerCase() || "";
            const isQuiz = titleLower.includes("quiz") || titleLower.includes("test") || titleLower.includes("kiểm tra");
            const isEssay = titleLower.includes("essay") || titleLower.includes("luận") || titleLower.includes("viết");

            if (isQuiz) {
                // Lấy quiz theo assessmentId
                try {
                    const quizResponse = await quizService.getByAssessment(assessment.assessmentId);
                    if (quizResponse.data?.success && quizResponse.data?.data && quizResponse.data.data.length > 0) {
                        const quizData = quizResponse.data.data[0];
                        setQuiz(quizData); // Lấy quiz đầu tiên
                        
                        // Check for in-progress attempt
                        setCheckingProgress(true);
                        const quizId = quizData.quizId || quizData.QuizId;
                        console.log("🔍 [AssessmentInfoModal] Checking in-progress attempt for quizId:", quizId);
                        
                        const savedProgress = localStorage.getItem(`quiz_in_progress_${quizId}`);
                        if (savedProgress) {
                            try {
                                const progress = JSON.parse(savedProgress);
                                if (progress.attemptId) {
                                    console.log("💾 [AssessmentInfoModal] Found saved progress, verifying with backend:", progress.attemptId);
                                    
                                    // Verify attempt is still valid by calling resume API
                                    try {
                                        const resumeResponse = await quizAttemptService.resume(progress.attemptId);
                                        console.log("📥 [AssessmentInfoModal] RESUME API response:", resumeResponse.data);
                                        
                                        if (resumeResponse.data?.success && resumeResponse.data?.data) {
                                            const attempt = resumeResponse.data.data;
                                            const status = attempt.Status || attempt.status;
                                            console.log("📊 [AssessmentInfoModal] Attempt status:", status);
                                            
                                            if (status === 1) { // InProgress
                                                setInProgressAttempt(progress);
                                                console.log("✅ [AssessmentInfoModal] In-progress attempt verified:", progress.attemptId);
                                            } else {
                                                localStorage.removeItem(`quiz_in_progress_${quizId}`);
                                                console.log("🗑️ [AssessmentInfoModal] Attempt already submitted, removed from localStorage");
                                            }
                                        } else {
                                            localStorage.removeItem(`quiz_in_progress_${quizId}`);
                                            console.log("🗑️ [AssessmentInfoModal] Resume failed, removed from localStorage");
                                        }
                                    } catch (err) {
                                        console.error("❌ [AssessmentInfoModal] Error verifying attempt:", err);
                                        console.error("Error details:", {
                                            message: err.message,
                                            response: err.response?.data,
                                            status: err.response?.status
                                        });
                                        
                                        // Nếu 404 hoặc 400, xóa khỏi localStorage
                                        if (err.response?.status === 404 || err.response?.status === 400) {
                                            localStorage.removeItem(`quiz_in_progress_${quizId}`);
                                            console.log("🗑️ [AssessmentInfoModal] Attempt not found or submitted, removed from localStorage");
                                        }
                                    }
                                }
                            } catch (err) {
                                console.error("❌ [AssessmentInfoModal] Error parsing saved progress:", err);
                                localStorage.removeItem(`quiz_in_progress_${quizId}`);
                            }
                        } else {
                            console.log("❌ [AssessmentInfoModal] No saved progress in localStorage for quizId:", quizId);
                        }
                        setCheckingProgress(false);
                    }
                } catch (err) {
                    console.error("❌ [AssessmentInfoModal] Error fetching quiz:", err);
                    setCheckingProgress(false);
                }
            } else if (isEssay) {
                // Lấy essay theo assessmentId
                try {
                    const essayResponse = await essayService.getByAssessment(assessment.assessmentId);
                    if (essayResponse.data?.success && essayResponse.data?.data && essayResponse.data.data.length > 0) {
                        setEssay(essayResponse.data.data[0]); // Lấy essay đầu tiên
                    }
                } catch (err) {
                    console.error("Error fetching essay:", err);
                }
            }
        } catch (err) {
            console.error("Error fetching assessment details:", err);
            setError("Không thể tải thông tin chi tiết");
        } finally {
            setLoading(false);
        }
    };

    const formatTimeLimit = (timeLimit) => {
        if (!timeLimit) return "Không giới hạn";
        
        // Nếu là số (duration từ quiz API - tính bằng phút)
        if (typeof timeLimit === 'number') {
            const hours = Math.floor(timeLimit / 60);
            const minutes = timeLimit % 60;
            if (hours > 0) {
                return `${hours} giờ ${minutes} phút`;
            }
            return `${minutes} phút`;
        }
        
        // Nếu là string (timeLimit từ assessment - format HH:mm:ss)
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

    const formatDate = (dateString) => {
        if (!dateString) return "Không có";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const handleStart = async (isNewAttempt = true) => {
        if (quiz) {
            try {
                setLoading(true);
                
                // Nếu không phải attempt mới và có in-progress attempt, dùng nó
                if (!isNewAttempt && inProgressAttempt && inProgressAttempt.attemptId) {
                    console.log("▶️ [AssessmentInfoModal] Continuing in-progress attempt:", inProgressAttempt.attemptId);
                    onStartQuiz({
                        ...assessment,
                        attemptId: inProgressAttempt.attemptId,
                        quizId: inProgressAttempt.quizId,
                    });
                    onClose();
                    return;
                }
                
                // Start new quiz attempt
                console.log("🆕 [AssessmentInfoModal] Starting new quiz attempt");
                const response = await quizAttemptService.start(quiz.quizId || quiz.QuizId);
                if (response.data?.success && response.data?.data) {
                    const attemptData = response.data.data;
                    const attemptId = attemptData.attemptId || attemptData.AttemptId;
                    const quizId = attemptData.quizId || attemptData.QuizId || quiz.quizId || quiz.QuizId;
                    
                    // Pass attempt data to parent
                    onStartQuiz({
                        ...assessment,
                        attemptId,
                        quizId,
                        attemptData
                    });
                    onClose();
                } else {
                    setError(response.data?.message || "Không thể bắt đầu làm quiz");
                    setLoading(false);
                }
            } catch (err) {
                console.error("❌ [AssessmentInfoModal] Error starting quiz:", err);
                setError(err.response?.data?.message || "Không thể bắt đầu làm quiz");
                setLoading(false);
            }
        } else if (essay) {
            // Navigate to essay page with essayId
            const essayId = essay.essayId || essay.EssayId;
            if (essayId) {
                onStartEssay({
                    ...assessment,
                    essayId: essayId
                });
                onClose();
            } else {
                setError("Không tìm thấy thông tin essay");
            }
        }
    };

    if (!isOpen || !assessment) return null;

    const titleLower = assessment.title?.toLowerCase() || "";
    const isQuiz = titleLower.includes("quiz") || titleLower.includes("test") || titleLower.includes("kiểm tra");
    const isEssay = titleLower.includes("essay") || titleLower.includes("luận") || titleLower.includes("viết");

    return (
        <div className="modal-overlay assessment-info-modal-overlay" onClick={onClose}>
            <div className="modal-content assessment-info-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="assessment-info-header">
                    <div className="assessment-info-icon">
                        {isQuiz ? (
                            <FaQuestionCircle className="icon-quiz" />
                        ) : (
                            <FaEdit className="icon-essay" />
                        )}
                    </div>
                    <h2 className="assessment-info-title">{assessment.title}</h2>
                </div>

                {loading ? (
                    <div className="assessment-info-loading">
                        <p>Đang tải thông tin...</p>
                    </div>
                ) : (
                    <>
                        <div className="assessment-info-body">
                            {/* Hiển thị title từ quiz nếu có, nếu không thì từ assessment */}
                            {(quiz?.title || assessment.title) && (
                                <div className="info-section">
                                    <h3 className="info-section-title">Tiêu đề</h3>
                                    <p className="info-section-content">{quiz?.title || assessment.title}</p>
                                </div>
                            )}

                            {/* Hiển thị description từ quiz nếu có, nếu không thì từ assessment */}
                            {(quiz?.description || assessment.description) && (
                                <div className="info-section">
                                    <h3 className="info-section-title">Mô tả</h3>
                                    <p className="info-section-content">{quiz?.description || assessment.description}</p>
                                </div>
                            )}

                            {/* Hiển thị instructions từ quiz */}
                            {quiz?.instructions && (
                                <div className="info-section">
                                    <h3 className="info-section-title">Hướng dẫn</h3>
                                    <p className="info-section-content">{quiz.instructions}</p>
                                </div>
                            )}

                            <div className="info-grid">
                                {/* Thời gian làm bài - ưu tiên từ quiz.duration, nếu không thì từ assessment.timeLimit */}
                                {(quiz?.duration || assessment.timeLimit) && (
                                    <div className="info-item">
                                        <FaClock className="info-icon" />
                                        <div className="info-item-content">
                                            <span className="info-label">Thời gian làm bài</span>
                                            <span className="info-value">
                                                {formatTimeLimit(quiz?.duration || assessment.timeLimit)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Tổng số câu hỏi - từ quiz */}
                                {quiz?.totalQuestions && (
                                    <div className="info-item">
                                        <FaList className="info-icon" />
                                        <div className="info-item-content">
                                            <span className="info-label">Tổng số câu hỏi</span>
                                            <span className="info-value">{quiz.totalQuestions} câu</span>
                                        </div>
                                    </div>
                                )}

                                {/* Điểm đạt - ưu tiên từ quiz.passingScore, nếu không thì từ assessment.passingScore */}
                                {(quiz?.passingScore !== undefined || assessment.passingScore) && (
                                    <div className="info-item">
                                        <FaCheckCircle className="info-icon" />
                                        <div className="info-item-content">
                                            <span className="info-label">Điểm đạt</span>
                                            <span className="info-value">
                                                {quiz?.passingScore !== undefined ? quiz.passingScore : assessment.passingScore} điểm
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Tổng điểm - từ assessment */}
                                {assessment.totalPoints && (
                                    <div className="info-item">
                                        <FaCheckCircle className="info-icon" />
                                        <div className="info-item-content">
                                            <span className="info-label">Tổng điểm</span>
                                            <span className="info-value">{assessment.totalPoints} điểm</span>
                                        </div>
                                    </div>
                                )}

                                {/* Số lần làm tối đa - từ quiz */}
                                {quiz?.maxAttempts !== undefined && (
                                    <div className="info-item">
                                        <FaRedo className="info-icon" />
                                        <div className="info-item-content">
                                            <span className="info-label">Số lần làm tối đa</span>
                                            <span className="info-value">
                                                {quiz.allowUnlimitedAttempts ? "Không giới hạn" : `${quiz.maxAttempts} lần`}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Mở từ - ưu tiên từ quiz.availableFrom, nếu không thì từ assessment.openAt */}
                                {(quiz?.availableFrom || assessment.openAt) && (
                                    <div className="info-item">
                                        <FaClock className="info-icon" />
                                        <div className="info-item-content">
                                            <span className="info-label">Mở từ</span>
                                            <span className="info-value">
                                                {formatDate(quiz?.availableFrom || assessment.openAt)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Hạn nộp - từ assessment */}
                                {assessment.dueAt && (
                                    <div className="info-item">
                                        <FaTimesCircle className="info-icon" />
                                        <div className="info-item-content">
                                            <span className="info-label">Hạn nộp</span>
                                            <span className="info-value">{formatDate(assessment.dueAt)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Thông tin bổ sung từ quiz */}
                            {quiz && (
                                <div className="quiz-additional-info">
                                    <h4 className="additional-info-title">Thông tin bổ sung</h4>
                                    <div className="additional-info-grid">
                                        {quiz.shuffleQuestions && (
                                            <div className="additional-info-item">
                                                <FaRandom className="additional-info-icon" />
                                                <span>Câu hỏi được xáo trộn</span>
                                            </div>
                                        )}
                                        {quiz.shuffleAnswers && (
                                            <div className="additional-info-item">
                                                <FaRandom className="additional-info-icon" />
                                                <span>Đáp án được xáo trộn</span>
                                            </div>
                                        )}
                                        {quiz.showAnswersAfterSubmit && (
                                            <div className="additional-info-item">
                                                <FaCheckCircle className="additional-info-icon" />
                                                <span>Hiển thị đáp án sau khi nộp</span>
                                            </div>
                                        )}
                                        {quiz.showScoreImmediately && (
                                            <div className="additional-info-item">
                                                <FaCheckCircle className="additional-info-icon" />
                                                <span>Hiển thị điểm ngay lập tức</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="assessment-info-error">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="assessment-info-footer">
                            <div className="footer-buttons-vertical">
                                {isQuiz && inProgressAttempt && (
                                    <Button
                                        variant="primary"
                                        className="assessment-continue-btn w-100"
                                        onClick={() => handleStart(false)}
                                        disabled={loading || checkingProgress}
                                    >
                                        {loading || checkingProgress ? "Đang tải..." : "Tiếp tục làm"}
                                    </Button>
                                )}
                                <Button
                                    variant="primary"
                                    className={`assessment-start-btn ${isQuiz ? "btn-quiz" : "btn-essay"} w-100`}
                                    onClick={() => handleStart(true)}
                                    disabled={loading || checkingProgress || (!quiz && !essay)}
                                >
                                    {loading || checkingProgress ? "Đang tải..." : (isQuiz ? "Bắt đầu làm Quiz" : "Bắt đầu viết Essay")}
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    className="footer-cancel-btn w-100"
                                    onClick={onClose}
                                >
                                    Hủy
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

