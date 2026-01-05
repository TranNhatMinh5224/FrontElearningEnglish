import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import MainHeader from "../../Components/Header/MainHeader";
import { useSubmissionStatus } from "../../hooks/useSubmissionStatus";
import QuizCard from "../../Components/Assignment/QuizCard/QuizCard";
import EssayCard from "../../Components/Assignment/EssayCard/EssayCard";
import AssessmentInfoModal from "../../Components/Assignment/AssessmentInfoModal/AssessmentInfoModal";
import NotificationModal from "../../Components/Common/NotificationModal/NotificationModal";
import StudentEssayResultModal from "../../Components/Common/StudentEssayResultModal/StudentEssayResultModal";
import { assessmentService } from "../../Services/assessmentService";
import { courseService } from "../../Services/courseService";
import { lessonService } from "../../Services/lessonService";
import { quizAttemptService } from "../../Services/quizAttemptService";
import { essaySubmissionService } from "../../Services/essaySubmissionService";
import { essayService } from "../../Services/essayService";
import { quizService } from "../../Services/quizService";
import "./AssessmentDetail.css";

export default function AssessmentDetail() {
    const { courseId, lessonId, moduleId, assessmentId } = useParams();
    const navigate = useNavigate();
    const { isInProgress } = useSubmissionStatus();
    
    // Data state
    const [assessment, setAssessment] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [essays, setEssays] = useState([]);
    
    // Info state
    const [course, setCourse] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Modal state
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [notification, setNotification] = useState({ isOpen: false, type: "info", message: "" });
    const [inProgressQuizzes, setInProgressQuizzes] = useState({});
    const [essaySubmissionsMap, setEssaySubmissionsMap] = useState({});
    const [showResultModal, setShowResultModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                const promises = [
                    courseService.getCourseById(courseId),
                    lessonService.getLessonById(lessonId),
                    assessmentService.getById(assessmentId),
                    quizService.getByAssessment(assessmentId),
                    essayService.getByAssessment(assessmentId)
                ];

                const [courseRes, lessonRes, assessRes, quizRes, essayRes] = await Promise.all(promises);

                if (courseRes.data?.success) setCourse(courseRes.data.data);
                if (lessonRes.data?.success) setLesson(lessonRes.data.data);
                
                if (assessRes.data?.success) {
                    setAssessment(assessRes.data.data);
                } else {
                    throw new Error("Không tìm thấy thông tin bài kiểm tra");
                }

                if (quizRes.data?.success) {
                    setQuizzes(Array.isArray(quizRes.data.data) ? quizRes.data.data : [quizRes.data.data]);
                }

                if (essayRes.data?.success) {
                    setEssays(Array.isArray(essayRes.data.data) ? essayRes.data.data : [essayRes.data.data]);
                }

                // Check submission status for each essay for current user so we can show "Cập nhật Essay" label
                try {
                    const essayList = Array.isArray(essayRes.data?.data) ? essayRes.data.data : (essayRes.data?.data ? [essayRes.data.data] : []);
                    const submissionMap = {};
                    await Promise.all(essayList.map(async (es) => {
                        try {
                            const res = await (await import('../../Services/essaySubmissionService')).essaySubmissionService.getSubmissionStatus(es.essayId || es.EssayId);
                            if (res?.data?.success && res.data?.data) {
                                // Store full submission data including scores
                                submissionMap[es.essayId || es.EssayId] = res.data.data;
                            }
                        } catch (e) {
                            // ignore
                        }
                    }));
                    setEssaySubmissionsMap(submissionMap);
                } catch (e) {
                    // ignore
                }

            } catch (err) {
                console.error("Error fetching assessment details:", err);
                setError("Không thể tải thông tin chi tiết bài kiểm tra");
            } finally {
                setLoading(false);
            }
        };

        if (assessmentId) {
            fetchData();
        }
    }, [assessmentId, courseId, lessonId]);

    // Check progress (giữ nguyên logic cũ)
    useEffect(() => {
        const checkInProgress = async () => {
            if (quizzes.length === 0) return;
            const progressMap = {};
            
            for (const quiz of quizzes) {
                const quizId = quiz.quizId || quiz.QuizId;
                const savedKey = `quiz_in_progress_${quizId}`;
                const saved = localStorage.getItem(savedKey);
                
                if (saved) {
                    try {
                        const progress = JSON.parse(saved);
                        if (progress.attemptId) {
                            // Verify with backend
                            try {
                                const res = await quizAttemptService.resume(progress.attemptId);
                                if (res.data?.success && isInProgress(res.data.data.status)) {
                                    progressMap[assessmentId] = progress;
                                } else {
                                    localStorage.removeItem(savedKey);
                                }
                            } catch {
                                localStorage.removeItem(savedKey);
                            }
                        }
                    } catch {
                        localStorage.removeItem(savedKey);
                    }
                }
            }
            setInProgressQuizzes(progressMap);
        };
        
        checkInProgress();
    }, [quizzes, assessmentId]);

    // Handlers
    const handleQuizClick = (item) => {
        // Pass parent assessment info merged with quiz info for the modal
        setSelectedAssessment({
            ...assessment,
            ...item,
            type: 'quiz'
        });
        setShowInfoModal(true);
    };

    const handleEssayClick = (item) => {
        setSelectedAssessment({
            ...assessment,
            ...item,
            type: 'essay'
        });
        setShowInfoModal(true);
    };

    const handleStartQuiz = async (data) => {
        // Logic start quiz (giữ nguyên hoặc tối ưu)
        // Redirect to quiz attempt page
        navigate(`/course/${courseId}/lesson/${lessonId}/module/${moduleId}/quiz/${data.quizId}/attempt/${data.attemptId || 'new'}`);
    };

    const handleStartEssay = async (data) => {
        // Before navigating, try to get existing submission data so EssayDetail can prefill immediately
        try {
            const essayId = data.essayId || data.EssayId;
            const statusResp = await essaySubmissionService.getSubmissionStatus(essayId);
            // Backend returns full submission object in data (not just submissionId)
            const submission = statusResp?.data?.data;
            if (submission && (submission.submissionId || submission.SubmissionId)) {
                navigate(`/course/${courseId}/lesson/${lessonId}/module/${moduleId}/essay/${essayId}`, { state: { submission } });
                return;
            }
        } catch (e) {
            // ignore and navigate without submission
        }

        navigate(`/course/${courseId}/lesson/${lessonId}/module/${moduleId}/essay/${data.essayId}`);
    };

    if (loading) return <div className="text-center py-5">Loading...</div>;
    if (error) return <div className="alert alert-danger m-5">{error}</div>;

    return (
        <>
            <MainHeader />
            <div className="assessment-detail-container">
                <Container fluid>
                    {/* Breadcrumb & Header */}
                    <Row className="mb-4">
                        <Col>
                            <h2 className="text-primary fw-bold">{assessment?.title}</h2>
                            <p className="text-muted">{assessment?.description}</p>
                        </Col>
                    </Row>

                    <Row>
                        {/* Column Quiz */}
                        <Col lg={6} className="border-end">
                            <h4 className="mb-3 text-info border-bottom pb-2">Trắc nghiệm (Quiz)</h4>
                            {quizzes.length > 0 ? (
                                quizzes.map(q => (
                                    <QuizCard 
                                        key={q.quizId} 
                                        assessment={q} // Quiz info
                                        onClick={() => handleQuizClick(q)}
                                        hasInProgress={!!inProgressQuizzes[assessmentId]}
                                    />
                                ))
                            ) : (
                                <p className="text-muted fst-italic">Không có bài trắc nghiệm nào.</p>
                            )}
                        </Col>

                        {/* Column Essay */}
                        <Col lg={6}>
                            <h4 className="mb-3 text-success border-bottom pb-2">Tự luận (Essay)</h4>
                            {essays.length > 0 ? (
                                essays.map(e => (
                                    <EssayCard 
                                        key={e.essayId} 
                                        assessment={e} 
                                        onClick={() => handleEssayClick(e)}
                                        submission={essaySubmissionsMap[e.essayId || e.EssayId]}
                                        onViewResult={(submission) => {
                                            setSelectedSubmission(submission);
                                            setShowResultModal(true);
                                        }}
                                    />
                                ))
                            ) : (
                                <p className="text-muted fst-italic">Không có bài tự luận nào.</p>
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>

            <AssessmentInfoModal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                assessment={selectedAssessment}
                onStartQuiz={handleStartQuiz}
                onStartEssay={handleStartEssay}
            />

            <StudentEssayResultModal
                show={showResultModal}
                onClose={() => {
                    setShowResultModal(false);
                    setSelectedSubmission(null);
                }}
                submission={selectedSubmission}
            />
        </>
    );
}
