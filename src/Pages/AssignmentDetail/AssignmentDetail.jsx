import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import MainHeader from "../../Components/Header/MainHeader";
import { useSubmissionStatus } from "../../hooks/useSubmissionStatus";
import QuizCard from "../../Components/Assignment/QuizCard/QuizCard";
import EssayCard from "../../Components/Assignment/EssayCard/EssayCard";
import AssessmentInfoModal from "../../Components/Assignment/AssessmentInfoModal/AssessmentInfoModal";
import NotificationModal from "../../Components/Common/NotificationModal/NotificationModal";
import { assessmentService } from "../../Services/assessmentService";
import { moduleService } from "../../Services/moduleService";
import { courseService } from "../../Services/courseService";
import { lessonService } from "../../Services/lessonService";
import { quizAttemptService } from "../../Services/quizAttemptService";
import { essayService } from "../../Services/essayService";
import { quizService } from "../../Services/quizService";
import "./AssignmentDetail.css";

export default function AssignmentDetail() {
    const { courseId, lessonId, moduleId } = useParams();
    const navigate = useNavigate();
    const { isInProgress } = useSubmissionStatus();
    const [assessments, setAssessments] = useState([]);
    const [module, setModule] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [notification, setNotification] = useState({ isOpen: false, type: "info", message: "" });
    const [inProgressQuizzes, setInProgressQuizzes] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                // Gọi API hoàn thành module khi vào trang assignment
                const parsedModuleId = typeof moduleId === 'string' ? parseInt(moduleId) : moduleId;
                if (parsedModuleId && !isNaN(parsedModuleId)) {
                    try {
                        await moduleService.startModule(parsedModuleId);
                        console.log(`Module ${parsedModuleId} started successfully`);
                    } catch (err) {
                        console.error("Error starting module:", err);
                    }
                }

                // Fetch course info
                const courseResponse = await courseService.getCourseById(courseId);
                if (courseResponse.data?.success && courseResponse.data?.data) {
                    setCourse(courseResponse.data.data);
                }

                // Fetch lesson info
                const lessonResponse = await lessonService.getLessonById(lessonId);
                if (lessonResponse.data?.success && lessonResponse.data?.data) {
                    setLesson(lessonResponse.data.data);
                }

                // Fetch module info
                const moduleResponse = await moduleService.getModuleById(moduleId);
                if (moduleResponse.data?.success && moduleResponse.data?.data) {
                    setModule(moduleResponse.data.data);
                }

                // Fetch assessments
                const assessmentsResponse = await assessmentService.getByModule(moduleId);
                if (assessmentsResponse.data?.success && assessmentsResponse.data?.data) {
                    // Filter only published assessments for students
                    const allAssessments = assessmentsResponse.data.data;
                    const publishedAssessments = allAssessments.filter(a =>
                        a.isPublished !== undefined ? a.isPublished : (a.IsPublished !== undefined ? a.IsPublished : false)
                    );

                    // Verify each assessment has actual quiz or essay
                    const verifiedAssessments = [];
                    for (const assessment of publishedAssessments) {
                        const assessmentId = assessment.assessmentId || assessment.AssessmentId;
                        let hasQuiz = false;
                        let hasEssay = false;

                        // Check if assessment has quiz
                        try {
                            const quizRes = await quizService.getByAssessment(assessmentId);
                            console.log(`[AssignmentDetail] Quiz check for assessment ${assessmentId}:`, quizRes.data);
                            if (quizRes.data?.success && quizRes.data?.data) {
                                // Handle both array and single object response
                                const quizData = Array.isArray(quizRes.data.data) ? quizRes.data.data : [quizRes.data.data];
                                if (quizData.length > 0) {
                                    hasQuiz = true;
                                }
                            }
                        } catch (err) {
                            console.error(`Error checking quiz for assessment ${assessmentId}:`, err);
                            // Don't fail silently - log the error but continue
                        }

                        // Check if assessment has essay
                        try {
                            const essayRes = await essayService.getByAssessment(assessmentId);
                            console.log(`[AssignmentDetail] Essay check for assessment ${assessmentId}:`, essayRes.data);
                            if (essayRes.data?.success && essayRes.data?.data) {
                                // Handle both array and single object response
                                const essayData = Array.isArray(essayRes.data.data) ? essayRes.data.data : [essayRes.data.data];
                                if (essayData.length > 0) {
                                    hasEssay = true;
                                }
                            }
                        } catch (err) {
                            console.error(`Error checking essay for assessment ${assessmentId}:`, err);
                            // Don't fail silently - log the error but continue
                        }

                        // Only include assessment if it has at least one quiz or essay
                        if (hasQuiz || hasEssay) {
                            verifiedAssessments.push({
                                ...assessment,
                                hasQuiz,
                                hasEssay,
                            });
                        } else {
                            console.log(`[AssignmentDetail] Assessment ${assessmentId} has no quiz or essay, excluding from list`);
                        }
                    }

                    console.log(`[AssignmentDetail] Verified assessments:`, verifiedAssessments);

                    setAssessments(verifiedAssessments);
                } else {
                    setError(assessmentsResponse.data?.message || "Không thể tải danh sách bài tập");
                }
            } catch (err) {
                console.error("Error fetching assignment data:", err);
                setError("Không thể tải dữ liệu bài tập");
            } finally {
                setLoading(false);
            }
        };

        if (moduleId) {
            fetchData();
        }
    }, [moduleId, courseId, lessonId]);

    // Phân loại assessments thành Quiz và Essay dựa trên actual data (hasQuiz/hasEssay)
    // Một assessment có thể có cả quiz và essay
    const quizzes = assessments.filter(a => a.hasQuiz === true);
    const essays = assessments.filter(a => a.hasEssay === true);

    // Check for in-progress quiz attempts from localStorage and verify with backend
    useEffect(() => {
        const checkInProgressQuizzes = async () => {
            if (quizzes.length === 0 || loading) {
                console.log("⏸️ [AssignmentDetail] Skipping check - quizzes.length:", quizzes.length, "loading:", loading);
                return;
            }

            console.log("🔍 [AssignmentDetail] Checking in-progress quizzes for", quizzes.length, "quizzes");

            const progressMap = {};

            // For each quiz assessment, check localStorage first, then verify with backend
            for (const assessment of quizzes) {
                try {
                    console.log("🔎 [AssignmentDetail] Checking assessment:", assessment.assessmentId, assessment.title);

                    // Get quiz by assessment
                    const quizResponse = await quizService.getByAssessment(assessment.assessmentId);
                    if (!quizResponse.data?.success || !quizResponse.data?.data || quizResponse.data.data.length === 0) {
                        console.log("⚠️ [AssignmentDetail] No quiz found for assessment:", assessment.assessmentId);
                        continue;
                    }

                    const quiz = quizResponse.data.data[0];
                    const quizId = quiz.quizId || quiz.QuizId;
                    console.log("📝 [AssignmentDetail] Quiz ID:", quizId);

                    // Check localStorage first
                    const savedProgressKey = `quiz_in_progress_${quizId}`;
                    const savedProgress = localStorage.getItem(savedProgressKey);

                    if (savedProgress) {
                        try {
                            const progress = JSON.parse(savedProgress);
                            const attemptId = progress.attemptId;

                            if (attemptId) {
                                console.log("💾 [AssignmentDetail] Found saved progress in localStorage, verifying with backend:", attemptId);

                                // Verify attempt is still valid by calling resume API (not getById because it doesn't exist for user)
                                try {
                                    const resumeResponse = await quizAttemptService.resume(attemptId);
                                    console.log("📥 [AssignmentDetail] RESUME API response:", resumeResponse.data);

                                    if (resumeResponse.data?.success && resumeResponse.data?.data) {
                                        const attempt = resumeResponse.data.data;
                                        const status = attempt.Status || attempt.status;
                                        console.log("📊 [AssignmentDetail] Attempt status:", status);

                                        // Check if status is InProgress
                                        if (isInProgress(status)) {
                                            const verifiedProgress = {
                                                quizId,
                                                attemptId,
                                                courseId,
                                                lessonId,
                                                moduleId,
                                                startedAt: attempt.StartedAt || attempt.startedAt,
                                                status: status,
                                                assessmentId: assessment.assessmentId
                                            };

                                            progressMap[assessment.assessmentId] = verifiedProgress;

                                            // Update localStorage with verified data
                                            localStorage.setItem(savedProgressKey, JSON.stringify(verifiedProgress));
                                            console.log("✅ [AssignmentDetail] Verified in-progress attempt:", attemptId);
                                        } else {
                                            // Attempt đã submit, xóa khỏi localStorage
                                            localStorage.removeItem(savedProgressKey);
                                            console.log("🗑️ [AssignmentDetail] Attempt already submitted, removed from localStorage. Status:", status);
                                        }
                                    } else {
                                        // Attempt không tồn tại hoặc không thể resume, xóa khỏi localStorage
                                        localStorage.removeItem(savedProgressKey);
                                        console.log("🗑️ [AssignmentDetail] Resume failed, removed from localStorage");
                                    }
                                } catch (err) {
                                    console.error("❌ [AssignmentDetail] Error verifying attempt:", attemptId, err);
                                    console.error("Error details:", {
                                        message: err.message,
                                        response: err.response?.data,
                                        status: err.response?.status
                                    });

                                    // Nếu không verify được (404, 400, etc.), xóa khỏi localStorage
                                    if (err.response?.status === 404 || err.response?.status === 400) {
                                        localStorage.removeItem(savedProgressKey);
                                        console.log("🗑️ [AssignmentDetail] Attempt not found or submitted (", err.response?.status, "), removed from localStorage");
                                    }
                                }
                            }
                        } catch (err) {
                            console.error("❌ [AssignmentDetail] Error parsing saved progress:", err);
                            localStorage.removeItem(savedProgressKey);
                        }
                    } else {
                        console.log("❌ [AssignmentDetail] No saved progress in localStorage for quizId:", quizId);
                    }
                } catch (err) {
                    console.error("❌ [AssignmentDetail] Error checking assessment:", assessment.assessmentId, err);
                    console.error("Error details:", {
                        message: err.message,
                        response: err.response?.data,
                        status: err.response?.status
                    });
                }
            }

            console.log("📊 [AssignmentDetail] Final in-progress quizzes map:", progressMap);
            setInProgressQuizzes(progressMap);
        };

        checkInProgressQuizzes();
    }, [quizzes.length, loading, courseId, lessonId, moduleId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleQuizClick = (assessment) => {
        setSelectedAssessment(assessment);
        setShowInfoModal(true);
    };

    const handleEssayClick = (assessment) => {
        setSelectedAssessment(assessment);
        setShowInfoModal(true);
    };

    const handleStartQuiz = async (assessmentData, isNewAttempt = false) => {
        try {
            console.log("🚀 [AssignmentDetail] handleStartQuiz called:", { assessmentData, isNewAttempt });

            // If attemptId is already provided from modal, use it
            if (assessmentData.attemptId && assessmentData.quizId && !isNewAttempt) {
                console.log("✅ [AssignmentDetail] Using provided attemptId:", assessmentData.attemptId);
                navigate(`/course/${courseId}/lesson/${lessonId}/module/${moduleId}/quiz/${assessmentData.quizId}/attempt/${assessmentData.attemptId}`);
                return;
            }

            // Get quiz
            const quizResponse = await quizService.getByAssessment(assessmentData.assessmentId);
            if (!quizResponse.data?.success || !quizResponse.data?.data || quizResponse.data.data.length === 0) {
                console.error("❌ [AssignmentDetail] Failed to get quiz for assessment:", assessmentData.assessmentId);
                setNotification({
                    isOpen: true,
                    type: "error",
                    message: "Không thể tải thông tin quiz"
                });
                return;
            }

            const quiz = quizResponse.data.data[0];
            const quizId = quiz.quizId || quiz.QuizId;
            console.log("📝 [AssignmentDetail] Quiz ID:", quizId);

            // Nếu không phải attempt mới và có in-progress attempt, dùng nó
            if (!isNewAttempt) {
                const progress = inProgressQuizzes[assessmentData.assessmentId];
                if (progress && progress.attemptId) {
                    console.log("✅ [AssignmentDetail] Found in-progress attempt, navigating to:", progress.attemptId);
                    navigate(`/course/${courseId}/lesson/${lessonId}/module/${moduleId}/quiz/${progress.quizId}/attempt/${progress.attemptId}`);
                    return;
                }
            }

            // Start new quiz attempt
            console.log("🆕 [AssignmentDetail] Starting new quiz attempt for quizId:", quizId);
            const attemptResponse = await quizAttemptService.start(quizId);
            console.log("📥 [AssignmentDetail] START API response:", attemptResponse.data);

            if (attemptResponse.data?.success && attemptResponse.data?.data) {
                const attemptId = attemptResponse.data.data.attemptId || attemptResponse.data.data.AttemptId;
                console.log("✅ [AssignmentDetail] New attempt created:", attemptId);
                // Navigate to quiz page với attemptId
                navigate(`/course/${courseId}/lesson/${lessonId}/module/${moduleId}/quiz/${quizId}/attempt/${attemptId}`);
            } else {
                console.error("❌ [AssignmentDetail] START API failed:", attemptResponse.data);
                setNotification({
                    isOpen: true,
                    type: "error",
                    message: attemptResponse.data?.message || "Không thể bắt đầu làm quiz"
                });
            }
        } catch (err) {
            console.error("❌ [AssignmentDetail] Error starting quiz:", err);
            console.error("Error details:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                stack: err.stack
            });
            setNotification({
                isOpen: true,
                type: "error",
                message: err.response?.data?.message || "Không thể bắt đầu làm quiz"
            });
        }
    };

    const handleContinueQuiz = async (assessment) => {
        const progress = inProgressQuizzes[assessment.assessmentId];
        console.log("▶️ [AssignmentDetail] handleContinueQuiz called:", { assessment, progress });

        if (progress && progress.attemptId) {
            console.log("✅ [AssignmentDetail] Navigating to in-progress attempt:", progress.attemptId);
            navigate(`/course/${courseId}/lesson/${lessonId}/module/${moduleId}/quiz/${progress.quizId}/attempt/${progress.attemptId}`);
        } else {
            console.error("❌ [AssignmentDetail] No in-progress attempt found for assessment:", assessment.assessmentId);
            setNotification({
                isOpen: true,
                type: "error",
                message: "Không tìm thấy bài quiz đang làm"
            });
        }
    };

    const handleStartEssay = async (assessmentData) => {
        try {
            console.log("🚀 [AssignmentDetail] handleStartEssay called:", assessmentData);

            // If essayId is already provided from modal, use it directly
            if (assessmentData.essayId) {
                console.log("✅ [AssignmentDetail] Using provided essayId:", assessmentData.essayId);
                navigate(`/course/${courseId}/lesson/${lessonId}/module/${moduleId}/essay/${assessmentData.essayId}`);
                return;
            }

            // Otherwise, get essay by assessment
            const essayResponse = await essayService.getByAssessment(assessmentData.assessmentId);
            if (essayResponse.data?.success && essayResponse.data?.data && essayResponse.data.data.length > 0) {
                const essay = essayResponse.data.data[0];
                const essayId = essay.essayId || essay.EssayId;
                console.log("✅ [AssignmentDetail] Found essay, navigating to EssayDetail:", essayId);

                // Navigate to essay detail page
                navigate(`/course/${courseId}/lesson/${lessonId}/module/${moduleId}/essay/${essayId}`);
            } else {
                setNotification({
                    isOpen: true,
                    type: "error",
                    message: "Không tìm thấy thông tin essay"
                });
            }
        } catch (err) {
            console.error("❌ [AssignmentDetail] Error starting essay:", err);
            setNotification({
                isOpen: true,
                type: "error",
                message: err.response?.data?.message || "Không thể bắt đầu làm essay"
            });
        }
    };

    if (loading) {
        return (
            <>
                <MainHeader />
                <div className="assignment-detail-container">
                    <div className="loading-message">Đang tải...</div>
                </div>
            </>
        );
    }

    if (error && assessments.length === 0) {
        return (
            <>
                <MainHeader />
                <div className="assignment-detail-container">
                    <div className="error-message">{error}</div>
                </div>
            </>
        );
    }

    const moduleName = module?.name || module?.Name || "Assignment";
    const lessonTitle = lesson?.title || lesson?.Title || "Bài học";
    const courseTitle = course?.title || course?.Title || "Khóa học";

    return (
        <>
            <MainHeader />
            <div className="assignment-detail-container">
                <Container fluid>
                    <Row>
                        <Col>
                            <div className="assignment-breadcrumb">
                                <span onClick={() => navigate("/my-courses")} className="breadcrumb-link">
                                    Khóa học của tôi
                                </span>
                                <span className="breadcrumb-separator">/</span>
                                <span onClick={() => navigate(`/course/${courseId}`)} className="breadcrumb-link">
                                    {courseTitle}
                                </span>
                                <span className="breadcrumb-separator">/</span>
                                <span onClick={() => navigate(`/course/${courseId}/learn`)} className="breadcrumb-link">
                                    Lesson
                                </span>
                                <span className="breadcrumb-separator">/</span>
                                <span onClick={() => navigate(`/course/${courseId}/lesson/${lessonId}`)} className="breadcrumb-link">
                                    {lessonTitle}
                                </span>
                                <span className="breadcrumb-separator">/</span>
                                <span className="breadcrumb-current">{moduleName}</span>
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <div className="assignment-header">
                                <h1 className="assignment-title">{moduleName}</h1>
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={6}>
                            {quizzes.length > 0 && (
                                <div className="assignment-section">
                                    <h2 className="section-title">Quiz</h2>
                                    <div className="assessment-cards">
                                        {quizzes.map((assessment) => (
                                            <QuizCard
                                                key={assessment.assessmentId}
                                                assessment={assessment}
                                                onClick={() => handleQuizClick(assessment)}
                                                onContinue={() => handleContinueQuiz(assessment)}
                                                hasInProgress={!!inProgressQuizzes[assessment.assessmentId]}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Col>
                        <Col lg={6}>
                            {essays.length > 0 && (
                                <div className="assignment-section">
                                    <h2 className="section-title">Essay</h2>
                                    <div className="assessment-cards">
                                        {essays.map((assessment) => (
                                            <EssayCard
                                                key={assessment.assessmentId}
                                                assessment={assessment}
                                                onClick={() => handleEssayClick(assessment)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Col>
                    </Row>

                    {quizzes.length === 0 && essays.length === 0 && (
                        <Row>
                            <Col>
                                <div className="no-assessments-message">
                                    Chưa có bài tập nào trong module này.
                                </div>
                            </Col>
                        </Row>
                    )}
                </Container>
            </div>

            <AssessmentInfoModal
                isOpen={showInfoModal}
                onClose={() => {
                    setShowInfoModal(false);
                    setSelectedAssessment(null);
                }}
                assessment={selectedAssessment}
                onStartQuiz={handleStartQuiz}
                onStartEssay={handleStartEssay}
            />

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification({ ...notification, isOpen: false })}
                type={notification.type}
                message={notification.message}
            />
        </>
    );
}

