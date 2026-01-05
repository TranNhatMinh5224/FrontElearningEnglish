import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { FaQuestionCircle, FaEdit, FaClock, FaCheckCircle, FaTimesCircle, FaList, FaRedo, FaRandom } from "react-icons/fa";
import { useSubmissionStatus } from "../../../hooks/useSubmissionStatus";
import { quizAttemptService } from "../../../Services/quizAttemptService";
import { essayService } from "../../../Services/essayService";
import { essaySubmissionService } from "../../../Services/essaySubmissionService";
import { quizService } from "../../../Services/quizService";
import "./AssessmentInfoModal.css";

export default function AssessmentInfoModal({ 
    isOpen, 
    onClose, 
    assessment,
    onStartQuiz,
    onStartEssay
}) {
    const { isInProgress } = useSubmissionStatus();
    const [quiz, setQuiz] = useState(null);
    const [essay, setEssay] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [inProgressAttempt, setInProgressAttempt] = useState(null);
    const [checkingProgress, setCheckingProgress] = useState(false);
    const [essayHasSubmission, setEssayHasSubmission] = useState(false);
    const [showCannotStartModal, setShowCannotStartModal] = useState(false);

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
            const assessmentId = assessment.assessmentId || assessment.AssessmentId;
            const type = assessment.type; // 'quiz' or 'essay' passed from parent

            // Check based on Type if available
            if (type === 'quiz') {
                try {
                    // Fetch Quiz Info specifically
                    // We already have the quiz object passed in 'assessment' prop (merged in parent)
                    // But to be safe and get full details (like questions count, time limit from DB), we fetch by ID if possible
                    // Or fetch by Assessment if we only have assessmentId
                    
                    const quizResponse = await quizService.getByAssessment(assessmentId);
                    if (quizResponse.data?.success && quizResponse.data?.data) {
                        const quizData = Array.isArray(quizResponse.data.data) ? quizResponse.data.data : [quizResponse.data.data];
                        // Filter specific quiz if quizId is passed, otherwise take first
                        const targetQuiz = assessment.quizId 
                            ? quizData.find(q => (q.quizId || q.QuizId) === assessment.quizId) 
                            : quizData[0];

                        if (targetQuiz) {
                            setQuiz(targetQuiz);
                            // Check progress for this specific quiz
                            checkQuizProgress(targetQuiz.quizId || targetQuiz.QuizId);
                        } else {
                            setError("Không tìm thấy thông tin quiz");
                        }
                    }
                } catch (err) {
                    console.error("Error fetching quiz:", err);
                    setError("Lỗi tải thông tin quiz");
                }
            } else if (type === 'essay') {
                try {
                    const essayResponse = await essayService.getByAssessment(assessmentId);
                    if (essayResponse.data?.success && essayResponse.data?.data) {
                        const essayData = Array.isArray(essayResponse.data.data) ? essayResponse.data.data : [essayResponse.data.data];
                        const targetEssay = assessment.essayId 
                            ? essayData.find(e => (e.essayId || e.EssayId) === assessment.essayId)
                            : essayData[0];

                        if (targetEssay) {
                            setEssay(targetEssay);
                            // Check if user already submitted this essay
                            try {
                                const statusResp = await essaySubmissionService.getSubmissionStatus(targetEssay.essayId || targetEssay.EssayId);
                                if (statusResp?.data?.success && statusResp.data?.data) {
                                    setEssayHasSubmission(true);
                                } else {
                                    setEssayHasSubmission(false);
                                }
                            } catch (e) {
                                setEssayHasSubmission(false);
                            }
                        } else {
                            setError("Không tìm thấy thông tin essay");
                        }
                    }
                } catch (err) {
                    console.error("Error fetching essay:", err);
                    setError("Lỗi tải thông tin essay");
                }
            } else {
                // Fallback: Check both (Legacy logic)
                await fetchBoth(assessmentId);
            }

        } catch (err) {
            console.error("Error fetching assessment details:", err);
            setError("Không thể tải thông tin chi tiết");
        } finally {
            setLoading(false);
        }
    };

    const checkQuizProgress = async (rawQuizId) => {
        setCheckingProgress(true);
        const quizId = parseInt(rawQuizId); 
        console.log("🔍 [AssessmentInfoModal] Checking active attempt via API for quizId:", quizId);
        
        try {
            // New logic: Call backend API instead of checking localStorage
            const response = await quizAttemptService.checkActiveAttempt(quizId);
            console.log("📥 [AssessmentInfoModal] CheckActive API Response:", response.data);

            // Only treat as in-progress when backend explicitly reports hasActiveAttempt === true
            if (response.data?.success && response.data?.data && response.data.data.hasActiveAttempt) {
                const activeAttempt = response.data.data;
                const status = activeAttempt.Status !== undefined ? activeAttempt.Status : activeAttempt.status;

                console.log("✅ [AssessmentInfoModal] Active attempt found in DB:", activeAttempt);

                setInProgressAttempt({
                    attemptId: activeAttempt.attemptId || activeAttempt.AttemptId,
                    quizId: activeAttempt.quizId || activeAttempt.QuizId || quizId,
                    status: status,
                    startedAt: activeAttempt.startedAt || activeAttempt.StartedAt || null,
                    endTime: activeAttempt.endTime || activeAttempt.EndTime || null,
                    timeRemainingSeconds: activeAttempt.timeRemainingSeconds ?? activeAttempt.TimeRemainingSeconds ?? null
                });
            } else {
                console.log("ℹ️ [AssessmentInfoModal] No active attempt found for this user/quiz.");
                setInProgressAttempt(null);
            }
        } catch (err) {
            console.error("❌ [AssessmentInfoModal] Error calling checkActiveAttempt API:", err);
            setInProgressAttempt(null);
        } finally {
            setCheckingProgress(false);
        }
    };

    const fetchBoth = async (assessmentId) => {
        // ... (Original logic for checking both)
        // Check quiz
        try {
            const quizResponse = await quizService.getByAssessment(assessmentId);
            if (quizResponse.data?.success && quizResponse.data?.data) {
                const quizData = Array.isArray(quizResponse.data.data) ? quizResponse.data.data : [quizResponse.data.data];
                if (quizData.length > 0) {
                    setQuiz(quizData[0]);
                    checkQuizProgress(quizData[0].quizId || quizData[0].QuizId);
                    return; // Prioritize Quiz if found
                }
            }
        } catch (e) {}

        // Check essay
        try {
            const essayResponse = await essayService.getByAssessment(assessmentId);
            if (essayResponse.data?.success && essayResponse.data?.data) {
                const essayData = Array.isArray(essayResponse.data.data) ? essayResponse.data.data : [essayResponse.data.data];
                if (essayData.length > 0) {
                    setEssay(essayData[0]);
                }
            }
        } catch (e) {}
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
                
                // If user requested to start a NEW attempt but there is an active attempt, show card instead
                if (isNewAttempt && inProgressAttempt && inProgressAttempt.attemptId) {
                    setShowCannotStartModal(true);
                    setLoading(false);
                    return;
                }

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
                    // If backend rejects starting a new attempt, prefer showing the cannot-start modal
                    setShowCannotStartModal(true);
                    setLoading(false);
                }
            } catch (err) {
                console.error("❌ [AssessmentInfoModal] Error starting quiz:", err);
                // If backend returns an active-attempt error, show the card; otherwise show generic error
                const msg = err.response?.data?.message || "Không thể bắt đầu làm quiz";
                if (msg && /active|already|đang làm|đã có/i.test(msg)) {
                    setShowCannotStartModal(true);
                } else {
                    setError(msg);
                }
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

    // Determine type based on actual quiz/essay data, not title
    const isQuiz = !!quiz;

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
                                            variant="outline-primary"
                                            className="assessment-continue-btn w-100 mb-2"
                                            onClick={() => handleStart(false)}
                                            disabled={loading || checkingProgress}
                                        >
                                            {loading || checkingProgress ? "Đang tải..." : "Tiếp tục bài đang làm"}
                                        </Button>
                                    )}
                                <Button
                                    variant="primary"
                                    className={`assessment-start-btn ${isQuiz ? "btn-quiz" : "btn-essay"} w-100`}
                                    onClick={() => handleStart(true)}
                                    disabled={loading || checkingProgress || (!quiz && !essay)}
                                >
                                    {loading || checkingProgress ? "Đang tải..." : (isQuiz ? "Bắt đầu làm bài mới" : (essayHasSubmission ? "Cập nhật Essay" : "Bắt đầu viết Essay"))}
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    className="footer-cancel-btn w-100 mt-2"
                                    onClick={onClose}
                                >
                                    Hủy
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            {/* Centered modal shown when user tries to start a new quiz but has an active attempt */}
            {showCannotStartModal && (
                <div className="cannot-start-modal-overlay" onClick={() => setShowCannotStartModal(false)}>
                    <div className="cannot-start-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h4>Bạn không thể bắt đầu bài quiz mới</h4>
                        <p className="text-muted">Bạn đang có một bài quiz chưa hoàn thành. Vui lòng tiếp tục bài đang làm hoặc nộp bài trước khi bắt đầu bài mới.</p>
                        <div className="d-flex gap-2 mt-3 justify-content-end">
                            <Button variant="outline-secondary" onClick={() => setShowCannotStartModal(false)}>Đóng</Button>
                            <Button variant="primary" onClick={() => { setShowCannotStartModal(false); handleStart(false); }}>Tiếp tục bài đang làm</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

