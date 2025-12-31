import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import CreateButtons from "./CreateButtons/CreateButtons";
import QuizList from "./QuizList/QuizList";
import EssayList from "./EssayList/EssayList";
import CreateQuizModal from "./CreateQuizModal/CreateQuizModal";
import EditQuizModal from "./EditQuizModal/EditQuizModal";
import { quizService } from "../../../Services/quizService";
import { essayService } from "../../../Services/essayService";
import { assessmentService } from "../../../Services/assessmentService";
import { ROUTE_PATHS } from "../../../Routes/Paths";
import "./AssignmentManagementView.css";

export default function AssignmentManagementView({
    moduleId,
    courseId,
    lessonId,
    moduleName,
    moduleDescription,
    onBack,
    onNavigate,
}) {
    const [quizzes, setQuizzes] = useState([]);
    const [essays, setEssays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
    const [showEditQuizModal, setShowEditQuizModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    useEffect(() => {
        loadAssessments();
    }, [moduleId]);

    useEffect(() => {
        // Scroll to top when component mounts to avoid header overlap
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const loadAssessments = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch assessments by module
            const assessmentsRes = await assessmentService.getTeacherAssessmentsByModule(moduleId);

            if (assessmentsRes.data?.success && assessmentsRes.data?.data) {
                const assessments = assessmentsRes.data.data;

                // Separate quizzes and essays
                const quizPromises = assessments.map(async (assessment) => {
                    const assessmentId = assessment.assessmentId || assessment.AssessmentId;
                    const quizRes = await quizService.getTeacherQuizzesByAssessment(assessmentId);

                    if (quizRes.data?.success && quizRes.data?.data && quizRes.data.data.length > 0) {
                        const quiz = quizRes.data.data[0];
                        return {
                            ...quiz,
                            assessmentId,
                            title: quiz.title || quiz.Title || assessment.title || assessment.Title || "Untitled Quiz",
                            status: quiz.status || quiz.Status || assessment.status || assessment.Status,
                            isPublished: quiz.status === 1 || quiz.Status === 1 || assessment.isPublished || assessment.IsPublished,
                            assessmentIsPublished: assessment.isPublished !== undefined ? assessment.isPublished : (assessment.IsPublished !== undefined ? assessment.IsPublished : false),
                        };
                    }
                    return null;
                });

                const essayPromises = assessments.map(async (assessment) => {
                    const assessmentId = assessment.assessmentId || assessment.AssessmentId;
                    const essayRes = await essayService.getTeacherEssaysByAssessment(assessmentId);

                    if (essayRes.data?.success && essayRes.data?.data && essayRes.data.data.length > 0) {
                        const essay = essayRes.data.data[0];
                        return {
                            ...essay,
                            assessmentId,
                            title: assessment.title || assessment.Title || essay.title || essay.Title,
                            status: essay.status || essay.Status || assessment.status || assessment.Status,
                            isPublished: essay.status === 1 || essay.Status === 1 || assessment.isPublished || assessment.IsPublished,
                            assessmentIsPublished: assessment.isPublished !== undefined ? assessment.isPublished : (assessment.IsPublished !== undefined ? assessment.IsPublished : false),
                        };
                    }
                    return null;
                });

                const [quizResults, essayResults] = await Promise.all([
                    Promise.all(quizPromises),
                    Promise.all(essayPromises),
                ]);

                setQuizzes(quizResults.filter(q => q !== null));
                setEssays(essayResults.filter(e => e !== null));
            }
        } catch (err) {
            console.error("Error loading assessments:", err);
            setError("Không thể tải danh sách assessments");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuiz = () => {
        setShowCreateQuizModal(true);
    };

    const handleSubmitQuiz = async (quizFormData) => {
        try {
            // Check if there's an existing assessment without a quiz
            const assessmentsRes = await assessmentService.getTeacherAssessmentsByModule(moduleId);
            let assessmentId = null;

            if (assessmentsRes.data?.success && assessmentsRes.data?.data) {
                const assessments = assessmentsRes.data.data;
                // Find assessment that doesn't have a quiz yet
                for (const assessment of assessments) {
                    const aId = assessment.assessmentId || assessment.AssessmentId;
                    const quizRes = await quizService.getTeacherQuizzesByAssessment(aId);
                    if (!quizRes.data?.success || !quizRes.data?.data || quizRes.data.data.length === 0) {
                        assessmentId = aId;
                        break;
                    }
                }
            }

            // If no available assessment, create a new one
            if (!assessmentId) {
                const assessmentData = {
                    moduleId: parseInt(moduleId),
                    title: quizFormData.title,
                    description: quizFormData.description,
                    isPublished: quizFormData.isPublished || false,
                    totalPoints: 0,
                    passingScore: 0,
                };
                const assessmentRes = await assessmentService.createAssessment(assessmentData);
                if (assessmentRes.data?.success && assessmentRes.data?.data) {
                    assessmentId = assessmentRes.data.data.assessmentId || assessmentRes.data.data.AssessmentId;
                } else {
                    throw new Error(assessmentRes.data?.message || "Không thể tạo assessment");
                }
            } else {
                // Update existing assessment's isPublished
                try {
                    const assessmentRes = await assessmentService.getTeacherAssessmentById(assessmentId);
                    if (assessmentRes.data?.success && assessmentRes.data?.data) {
                        const currentAssessment = assessmentRes.data.data;
                        await assessmentService.updateAssessment(assessmentId, {
                            moduleId: currentAssessment.moduleId || currentAssessment.ModuleId,
                            title: currentAssessment.title || currentAssessment.Title,
                            description: currentAssessment.description || currentAssessment.Description || null,
                            openAt: currentAssessment.openAt || currentAssessment.OpenAt || null,
                            dueAt: currentAssessment.dueAt || currentAssessment.DueAt || null,
                            timeLimit: currentAssessment.timeLimit || currentAssessment.TimeLimit || null,
                            isPublished: quizFormData.isPublished || false,
                            totalPoints: currentAssessment.totalPoints || currentAssessment.TotalPoints || 0,
                            passingScore: currentAssessment.passingScore || currentAssessment.PassingScore || 0,
                        });
                    }
                } catch (assessmentErr) {
                    console.error("Error updating assessment isPublished:", assessmentErr);
                }
            }

            // Create quiz
            const quizData = {
                assessmentId: parseInt(assessmentId),
                title: quizFormData.title,
                description: quizFormData.description,
                type: quizFormData.type,
                status: 0, // Draft
                totalQuestions: 0,
                duration: quizFormData.duration,
                showAnswersAfterSubmit: true,
                showScoreImmediately: true,
                shuffleQuestions: true,
                shuffleAnswers: true,
                allowUnlimitedAttempts: false,
            };

            const quizRes = await quizService.createQuiz(quizData);
            if (quizRes.data?.success && quizRes.data?.data) {
                setShowCreateQuizModal(false);
                // Reload assessments to show the new quiz
                await loadAssessments();
            } else {
                throw new Error(quizRes.data?.message || "Không thể tạo quiz");
            }
        } catch (err) {
            console.error("Error creating quiz:", err);
            alert(err.response?.data?.message || err.message || "Có lỗi xảy ra khi tạo quiz");
        }
    };

    const handleCreateEssay = async () => {
        try {
            // Check if there's an existing assessment without an essay
            const assessmentsRes = await assessmentService.getTeacherAssessmentsByModule(moduleId);
            let assessmentId = null;

            if (assessmentsRes.data?.success && assessmentsRes.data?.data) {
                const assessments = assessmentsRes.data.data;
                // Find assessment that doesn't have an essay yet
                for (const assessment of assessments) {
                    const aId = assessment.assessmentId || assessment.AssessmentId;
                    const essayRes = await essayService.getTeacherEssaysByAssessment(aId);
                    if (!essayRes.data?.success || !essayRes.data?.data || essayRes.data.data.length === 0) {
                        assessmentId = aId;
                        break;
                    }
                }
            }

            // If no available assessment, create a new one
            if (!assessmentId) {
                const assessmentData = {
                    moduleId: parseInt(moduleId),
                    title: "Essay mới",
                    description: null,
                };
                const assessmentRes = await assessmentService.createAssessment(assessmentData);
                if (assessmentRes.data?.success && assessmentRes.data?.data) {
                    assessmentId = assessmentRes.data.data.assessmentId || assessmentRes.data.data.AssessmentId;
                } else {
                    throw new Error(assessmentRes.data?.message || "Không thể tạo assessment");
                }
            }

            // Create essay
            const essayData = {
                assessmentId: parseInt(assessmentId),
                title: "Essay mới",
                description: null,
            };

            const essayRes = await essayService.createEssay(essayData);
            if (essayRes.data?.success && essayRes.data?.data) {
                const essayId = essayRes.data.data.essayId || essayRes.data.data.EssayId;
                // Navigate to essay editor
                onNavigate(ROUTE_PATHS.TEACHER_EDIT_ESSAY(courseId, lessonId, moduleId, assessmentId, essayId));
            } else {
                throw new Error(essayRes.data?.message || "Không thể tạo essay");
            }
        } catch (err) {
            console.error("Error creating essay:", err);
            alert(err.response?.data?.message || err.message || "Có lỗi xảy ra khi tạo essay");
        }
    };

    const handleEditQuiz = async (quiz, isEditButton = false) => {
        const assessmentId = quiz.assessmentId;
        const quizId = quiz.quizId || quiz.QuizId;

        if (isEditButton) {
            // Click vào icon edit - hiện modal chỉnh sửa
            setSelectedQuiz(quiz);
            setShowEditQuizModal(true);
        } else {
            // Click vào card - navigate đến editor
            if (quizId && assessmentId) {
                onNavigate(ROUTE_PATHS.TEACHER_EDIT_QUIZ(courseId, lessonId, moduleId, assessmentId, quizId));
            }
        }
    };

    const handleSubmitEditQuiz = async (quizFormData) => {
        try {
            if (!selectedQuiz) return;

            const quizId = selectedQuiz.quizId || selectedQuiz.QuizId;
            const assessmentId = selectedQuiz.assessmentId || selectedQuiz.AssessmentId;

            if (!assessmentId) {
                throw new Error("Không tìm thấy Assessment ID");
            }

            // Update quiz - QuizUpdateDto extends QuizCreateDto, cần đầy đủ các trường
            const updateData = {
                assessmentId: parseInt(assessmentId),
                title: quizFormData.title,
                description: quizFormData.description || null,
                instructions: selectedQuiz.instructions || selectedQuiz.Instructions || null,
                type: quizFormData.type,
                status: quizFormData.status,
                totalQuestions: selectedQuiz.totalQuestions || selectedQuiz.TotalQuestions || 0,
                passingScore: selectedQuiz.passingScore || selectedQuiz.PassingScore || null,
                duration: quizFormData.duration || null,
                availableFrom: selectedQuiz.availableFrom || selectedQuiz.AvailableFrom || null,
                showAnswersAfterSubmit: selectedQuiz.showAnswersAfterSubmit !== undefined ? selectedQuiz.showAnswersAfterSubmit : true,
                showScoreImmediately: selectedQuiz.showScoreImmediately !== undefined ? selectedQuiz.showScoreImmediately : true,
                shuffleQuestions: selectedQuiz.shuffleQuestions !== undefined ? selectedQuiz.shuffleQuestions : true,
                shuffleAnswers: selectedQuiz.shuffleAnswers !== undefined ? selectedQuiz.shuffleAnswers : true,
                allowUnlimitedAttempts: selectedQuiz.allowUnlimitedAttempts !== undefined ? selectedQuiz.allowUnlimitedAttempts : false,
                maxAttempts: selectedQuiz.maxAttempts || selectedQuiz.MaxAttempts || null,
            };

            const quizRes = await quizService.updateQuiz(quizId, updateData);
            if (quizRes.data?.success) {
                // Update assessment title and isPublished - need to get current assessment data first
                if (assessmentId) {
                    try {
                        const assessmentRes = await assessmentService.getTeacherAssessmentById(assessmentId);
                        if (assessmentRes.data?.success && assessmentRes.data?.data) {
                            const currentAssessment = assessmentRes.data.data;
                            await assessmentService.updateAssessment(assessmentId, {
                                moduleId: currentAssessment.moduleId || currentAssessment.ModuleId,
                                title: quizFormData.title,
                                description: quizFormData.description || null,
                                openAt: currentAssessment.openAt || currentAssessment.OpenAt || null,
                                dueAt: currentAssessment.dueAt || currentAssessment.DueAt || null,
                                timeLimit: currentAssessment.timeLimit || currentAssessment.TimeLimit || null,
                                isPublished: quizFormData.isPublished !== undefined ? quizFormData.isPublished : (currentAssessment.isPublished !== undefined ? currentAssessment.isPublished : currentAssessment.IsPublished || false),
                                totalPoints: currentAssessment.totalPoints || currentAssessment.TotalPoints || 0,
                                passingScore: currentAssessment.passingScore || currentAssessment.PassingScore || 0,
                            });
                        }
                    } catch (assessmentErr) {
                        console.error("Error updating assessment:", assessmentErr);
                        // Don't throw error here, quiz update was successful
                    }
                }
                setShowEditQuizModal(false);
                setSelectedQuiz(null);
                await loadAssessments();
            } else {
                throw new Error(quizRes.data?.message || "Không thể cập nhật quiz");
            }
        } catch (err) {
            console.error("Error updating quiz:", err);
            alert(err.response?.data?.message || err.message || "Có lỗi xảy ra khi cập nhật quiz");
        }
    };

    const handleEditEssay = (essay) => {
        const assessmentId = essay.assessmentId;
        const essayId = essay.essayId || essay.EssayId;

        if (essayId && assessmentId) {
            onNavigate(ROUTE_PATHS.TEACHER_EDIT_ESSAY(courseId, lessonId, moduleId, assessmentId, essayId));
        }
    };

    const handleDeleteQuiz = async (quiz) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa quiz này?")) {
            try {
                const quizId = quiz.quizId || quiz.QuizId;
                const assessmentId = quiz.assessmentId || quiz.AssessmentId;

                // Delete quiz
                await quizService.deleteQuiz(quizId);

                // Check if assessment has any essay left
                if (assessmentId) {
                    try {
                        const essayRes = await essayService.getTeacherEssaysByAssessment(assessmentId);
                        const hasEssay = essayRes.data?.success && essayRes.data?.data && essayRes.data.data.length > 0;

                        if (!hasEssay) {
                            // No essay left, set isPublished to false so students don't see empty assessment
                            const assessmentRes = await assessmentService.getTeacherAssessmentById(assessmentId);
                            if (assessmentRes.data?.success && assessmentRes.data?.data) {
                                const currentAssessment = assessmentRes.data.data;
                                await assessmentService.updateAssessment(assessmentId, {
                                    moduleId: currentAssessment.moduleId || currentAssessment.ModuleId,
                                    title: currentAssessment.title || currentAssessment.Title,
                                    description: currentAssessment.description || currentAssessment.Description || null,
                                    openAt: currentAssessment.openAt || currentAssessment.OpenAt || null,
                                    dueAt: currentAssessment.dueAt || currentAssessment.DueAt || null,
                                    timeLimit: currentAssessment.timeLimit || currentAssessment.TimeLimit || null,
                                    isPublished: false, // Hide from students
                                    totalPoints: currentAssessment.totalPoints || currentAssessment.TotalPoints || 0,
                                    passingScore: currentAssessment.passingScore || currentAssessment.PassingScore || 0,
                                });
                            }
                        }
                    } catch (assessmentErr) {
                        console.error("Error checking/updating assessment after quiz deletion:", assessmentErr);
                        // Continue even if this fails
                    }
                }

                await loadAssessments();
            } catch (err) {
                console.error("Error deleting quiz:", err);
                alert("Có lỗi xảy ra khi xóa quiz");
            }
        }
    };

    const handleDeleteEssay = async (essay) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa essay này?")) {
            try {
                const essayId = essay.essayId || essay.EssayId;
                const assessmentId = essay.assessmentId || essay.AssessmentId;

                // Delete essay
                await essayService.deleteEssay(essayId);

                // Check if assessment has any quiz left
                if (assessmentId) {
                    try {
                        const quizRes = await quizService.getTeacherQuizzesByAssessment(assessmentId);
                        const hasQuiz = quizRes.data?.success && quizRes.data?.data && quizRes.data.data.length > 0;

                        if (!hasQuiz) {
                            // No quiz left, set isPublished to false so students don't see empty assessment
                            const assessmentRes = await assessmentService.getTeacherAssessmentById(assessmentId);
                            if (assessmentRes.data?.success && assessmentRes.data?.data) {
                                const currentAssessment = assessmentRes.data.data;
                                await assessmentService.updateAssessment(assessmentId, {
                                    moduleId: currentAssessment.moduleId || currentAssessment.ModuleId,
                                    title: currentAssessment.title || currentAssessment.Title,
                                    description: currentAssessment.description || currentAssessment.Description || null,
                                    openAt: currentAssessment.openAt || currentAssessment.OpenAt || null,
                                    dueAt: currentAssessment.dueAt || currentAssessment.DueAt || null,
                                    timeLimit: currentAssessment.timeLimit || currentAssessment.TimeLimit || null,
                                    isPublished: false, // Hide from students
                                    totalPoints: currentAssessment.totalPoints || currentAssessment.TotalPoints || 0,
                                    passingScore: currentAssessment.passingScore || currentAssessment.PassingScore || 0,
                                });
                            }
                        }
                    } catch (assessmentErr) {
                        console.error("Error checking/updating assessment after essay deletion:", assessmentErr);
                        // Continue even if this fails
                    }
                }

                await loadAssessments();
            } catch (err) {
                console.error("Error deleting essay:", err);
                alert("Có lỗi xảy ra khi xóa essay");
            }
        }
    };

    if (loading) {
        return (
            <div className="assignment-management-view">
                <div className="loading-message">Đang tải...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="assignment-management-view">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="assignment-management-view">
            <div className="assignment-header">
                <button className="back-btn" onClick={onBack}>
                    <FaArrowLeft className="me-2" />
                    Quay lại module
                </button>
            </div>

            <Container fluid>
                <div className="assignment-title-section">
                    <h1 className="assignment-title">{moduleName || "Assignment"}</h1>
                    {moduleDescription && (
                        <p className="assignment-subtitle">{moduleDescription}</p>
                    )}
                </div>

                <CreateButtons
                    onCreateQuiz={handleCreateQuiz}
                    onCreateEssay={handleCreateEssay}
                />

                <Row>
                    <Col lg={6}>
                        <QuizList
                            quizzes={quizzes}
                            onEdit={(quiz) => handleEditQuiz(quiz, true)}
                            onCardClick={(quiz) => handleEditQuiz(quiz, false)}
                            onDelete={handleDeleteQuiz}
                        />
                    </Col>
                    <Col lg={6}>
                        <EssayList
                            essays={essays}
                            onEdit={handleEditEssay}
                            onDelete={handleDeleteEssay}
                        />
                    </Col>
                </Row>
            </Container>

            <CreateQuizModal
                show={showCreateQuizModal}
                onClose={() => setShowCreateQuizModal(false)}
                onSubmit={handleSubmitQuiz}
            />

            <EditQuizModal
                show={showEditQuizModal}
                onClose={() => {
                    setShowEditQuizModal(false);
                    setSelectedQuiz(null);
                }}
                onSubmit={handleSubmitEditQuiz}
                quiz={selectedQuiz}
            />
        </div>
    );
}

