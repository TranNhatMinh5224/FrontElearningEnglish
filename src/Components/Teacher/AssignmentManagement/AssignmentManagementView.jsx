import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import CreateButtons from "./CreateButtons/CreateButtons";
import QuizList from "./QuizList/QuizList";
import EssayList from "./EssayList/EssayList";
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

    useEffect(() => {
        loadAssessments();
    }, [moduleId]);

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
                            title: assessment.title || assessment.Title || quiz.title || quiz.Title,
                            status: quiz.status || quiz.Status || assessment.status || assessment.Status,
                            isPublished: quiz.status === 1 || quiz.Status === 1 || assessment.isPublished || assessment.IsPublished,
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
        // Navigate to assessment type selection, then create quiz
        // First create assessment, then navigate to quiz creation
        onNavigate(ROUTE_PATHS.TEACHER_CREATE_ASSESSMENT(courseId, lessonId, moduleId));
    };

    const handleCreateEssay = () => {
        // Navigate to assessment type selection, then create essay
        // First create assessment, then navigate to essay creation
        onNavigate(ROUTE_PATHS.TEACHER_CREATE_ASSESSMENT(courseId, lessonId, moduleId));
    };

    const handleEditQuiz = async (quiz) => {
        const assessmentId = quiz.assessmentId;
        const quizId = quiz.quizId || quiz.QuizId;

        if (quizId && assessmentId) {
            onNavigate(ROUTE_PATHS.TEACHER_EDIT_QUIZ(courseId, lessonId, moduleId, assessmentId, quizId));
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
                await quizService.deleteQuiz(quizId);
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
                await essayService.deleteEssay(essayId);
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
                    Quản lý lesson
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
                            onEdit={handleEditQuiz}
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
        </div>
    );
}

