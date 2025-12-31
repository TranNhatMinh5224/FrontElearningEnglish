import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import "./TeacherQuizEditor.css";
import TeacherHeader from "../../../Components/Header/TeacherHeader";
import { useAuth } from "../../../Context/AuthContext";
import { teacherService } from "../../../Services/teacherService";
import { quizService } from "../../../Services/quizService";
import { questionService } from "../../../Services/questionService";
import { ROUTE_PATHS } from "../../../Routes/Paths";
import QuestionSidebar from "../../../Components/Teacher/QuizEditor/QuestionSidebar/QuestionSidebar";
import QuestionEditor from "../../../Components/Teacher/QuizEditor/QuestionEditor/QuestionEditor";
import NotificationModal from "../../../Components/Common/NotificationModal/NotificationModal";

export default function TeacherQuizEditor() {
    const { courseId, lessonId, moduleId, assessmentId, quizId } = useParams();
    const navigate = useNavigate();
    const { user, roles, isAuthenticated } = useAuth();

    // State
    const [course, setCourse] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [module, setModule] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [defaultSection, setDefaultSection] = useState(null);
    const [defaultGroup, setDefaultGroup] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Selection state
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    // Notification
    const [notification, setNotification] = useState({
        isOpen: false,
        type: "success",
        message: "",
    });

    const isTeacher = roles.includes("Teacher") || user?.teacherSubscription?.isTeacher === true;

    useEffect(() => {
        if (!isAuthenticated || !isTeacher) {
            navigate("/home");
            return;
        }

        fetchData();
    }, [isAuthenticated, isTeacher, navigate, courseId, lessonId, moduleId, quizId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            // Fetch course, lesson, module
            const [courseRes, lessonRes, moduleRes] = await Promise.all([
                teacherService.getCourseDetail(courseId),
                teacherService.getLessonById(lessonId),
                teacherService.getModuleById(moduleId),
            ]);

            if (courseRes.data?.success && courseRes.data?.data) {
                setCourse(courseRes.data.data);
            }

            if (lessonRes.data?.success && lessonRes.data?.data) {
                setLesson(lessonRes.data.data);
            }

            if (moduleRes.data?.success && moduleRes.data?.data) {
                setModule(moduleRes.data.data);
            }

            // Fetch quiz
            if (quizId) {
                const quizRes = await quizService.getTeacherQuizById(quizId);
                if (quizRes.data?.success && quizRes.data?.data) {
                    setQuiz(quizRes.data.data);
                    await ensureDefaultSectionAndGroup(quizRes.data.data.quizId || quizRes.data.data.QuizId);
                } else {
                    setError("Không thể tải thông tin quiz");
                }
            } else {
                setError("Quiz ID không hợp lệ");
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Có lỗi xảy ra khi tải thông tin");
        } finally {
            setLoading(false);
        }
    };

    const ensureDefaultSectionAndGroup = async (currentQuizId) => {
        try {
            // Fetch sections
            const sectionsRes = await quizService.getQuizSectionsByQuiz(currentQuizId);
            let section = null;

            if (sectionsRes.data?.success && sectionsRes.data?.data && sectionsRes.data.data.length > 0) {
                section = sectionsRes.data.data[0];
            } else {
                // Create default section
                const createSectionRes = await quizService.createQuizSection({
                    quizId: currentQuizId,
                    title: "Default Section",
                    description: "Default section for quiz questions",
                });

                if (createSectionRes.data?.success && createSectionRes.data?.data) {
                    section = createSectionRes.data.data;
                }
            }

            if (!section) {
                throw new Error("Không thể tạo section mặc định");
            }

            setDefaultSection(section);
            const sectionId = section.quizSectionId || section.QuizSectionId;

            // Fetch groups
            const groupsRes = await quizService.getQuizGroupsBySection(sectionId);
            let group = null;

            if (groupsRes.data?.success && groupsRes.data?.data && groupsRes.data.data.length > 0) {
                group = groupsRes.data.data[0];
            } else {
                // Create default group
                const createGroupRes = await quizService.createQuizGroup({
                    quizSectionId: sectionId,
                    name: "Default Group",
                    title: "Default Group",
                    description: "Default group for quiz questions",
                    sumScore: 0,
                });

                if (createGroupRes.data?.success && createGroupRes.data?.data) {
                    group = createGroupRes.data.data;
                }
            }

            if (!group) {
                throw new Error("Không thể tạo group mặc định");
            }

            setDefaultGroup(group);
            const groupId = group.quizGroupId || group.QuizGroupId;

            // Fetch questions
            await loadQuestions(groupId);
        } catch (err) {
            console.error("Error ensuring default section/group:", err);
            setError("Có lỗi xảy ra khi tải cấu trúc quiz");
        }
    };

    const loadQuestions = async (groupId) => {
        try {
            const questionsRes = await questionService.getQuestionsByGroup(groupId);
            if (questionsRes.data?.success && questionsRes.data?.data) {
                const questionsData = questionsRes.data.data;
                setQuestions(questionsData);

                // Auto-select first question if available
                if (questionsData.length > 0 && !selectedQuestion) {
                    setSelectedQuestion(questionsData[0]);
                }
            }
        } catch (err) {
            console.error("Error loading questions:", err);
        }
    };

    const handleQuestionSelect = (question) => {
        setSelectedQuestion(question);
    };

    const handleCreateQuestion = async () => {
        try {
            if (!defaultSection || !defaultGroup) {
                setNotification({
                    isOpen: true,
                    type: "error",
                    message: "Vui lòng đợi hệ thống khởi tạo xong",
                });
                return;
            }

            const sectionId = defaultSection.quizSectionId || defaultSection.QuizSectionId;
            const groupId = defaultGroup.quizGroupId || defaultGroup.QuizGroupId;

            // Create default options for Multiple Choice (backend requires at least 2 options)
            const defaultOptions = [
                { text: "Đáp án 1", isCorrect: true, feedback: "" },
                { text: "Đáp án 2", isCorrect: false, feedback: "" },
            ];

            // Ensure sectionId and groupId are valid numbers
            if (!sectionId || sectionId <= 0 || !groupId || groupId <= 0) {
                throw new Error("Section ID hoặc Group ID không hợp lệ");
            }

            const questionData = {
                type: 0, // Multiple Choice by default (QuestionType.MultipleChoice)
                stemText: "Câu hỏi mới", // Backend requires non-empty StemText
                points: 10,
                quizSectionId: parseInt(sectionId),
                quizGroupId: parseInt(groupId),
                options: defaultOptions,
                metadataJson: "{}",
                correctAnswersJson: JSON.stringify([0]), // First option is correct
                mediaTempKey: null,
                mediaType: null,
            };

            console.log("Creating question with data:", JSON.stringify(questionData, null, 2));

            const response = await questionService.createQuestion(questionData);

            if (response.data?.success) {
                await loadQuestions(groupId);
                const newQuestion = response.data.data;
                setSelectedQuestion(newQuestion);
                setNotification({
                    isOpen: true,
                    type: "success",
                    message: "Tạo câu hỏi thành công",
                });
            } else {
                throw new Error(response.data?.message || "Tạo câu hỏi thất bại");
            }
        } catch (error) {
            console.error("Error creating question:", error);
            setNotification({
                isOpen: true,
                type: "error",
                message: error.response?.data?.message || error.message || "Có lỗi xảy ra khi tạo câu hỏi",
            });
        }
    };

    const handleUpdateQuestion = async (questionId, questionData) => {
        try {
            // Get section and group IDs from defaults
            const sectionId = defaultSection?.quizSectionId || defaultSection?.QuizSectionId;
            const groupId = defaultGroup?.quizGroupId || defaultGroup?.QuizGroupId;

            if (!sectionId || !groupId) {
                throw new Error("Không tìm thấy Section hoặc Group ID");
            }

            // Prepare update data with required fields
            const updateData = {
                type: questionData.type,
                stemText: questionData.stemText,
                points: questionData.points,
                explanation: questionData.explanation || null,
                options: questionData.options || [],
                correctAnswersJson: questionData.correctAnswersJson || null,
                metadataJson: questionData.metadataJson || "{}",
                mediaTempKey: questionData.mediaTempKey || null,
                mediaType: questionData.mediaType || null,
                quizSectionId: parseInt(sectionId),
                quizGroupId: parseInt(groupId),
            };

            console.log("Updating question with data:", JSON.stringify(updateData, null, 2));

            const response = await questionService.updateQuestion(questionId, updateData);

            if (response.data?.success) {
                await loadQuestions(groupId);
                setNotification({
                    isOpen: true,
                    type: "success",
                    message: "Cập nhật câu hỏi thành công",
                });
            } else {
                throw new Error(response.data?.message || "Cập nhật câu hỏi thất bại");
            }
        } catch (error) {
            console.error("Error updating question:", error);
            setNotification({
                isOpen: true,
                type: "error",
                message: error.response?.data?.message || error.message || "Có lỗi xảy ra khi cập nhật câu hỏi",
            });
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
            return;
        }

        try {
            const response = await questionService.deleteQuestion(questionId);

            if (response.data?.success) {
                const groupId = defaultGroup.quizGroupId || defaultGroup.QuizGroupId;
                await loadQuestions(groupId);

                // Clear selection if deleted question was selected
                if (selectedQuestion && (selectedQuestion.questionId === questionId || selectedQuestion.QuestionId === questionId)) {
                    setSelectedQuestion(null);
                }

                setNotification({
                    isOpen: true,
                    type: "success",
                    message: "Xóa câu hỏi thành công",
                });
            } else {
                throw new Error(response.data?.message || "Xóa câu hỏi thất bại");
            }
        } catch (error) {
            console.error("Error deleting question:", error);
            setNotification({
                isOpen: true,
                type: "error",
                message: error.response?.data?.message || error.message || "Có lỗi xảy ra khi xóa câu hỏi",
            });
        }
    };

    const handleSaveQuiz = async () => {
        try {
            const currentQuizId = quiz.quizId || quiz.QuizId;
            const response = await quizService.updateQuiz(currentQuizId, {
                assessmentId: parseInt(assessmentId),
                title: quiz.title || quiz.Title,
                description: quiz.description || quiz.Description,
                type: quiz.type || quiz.Type,
                status: quiz.status || quiz.Status,
                totalQuestions: questions.length,
                duration: quiz.duration || quiz.Duration,
                showAnswersAfterSubmit: quiz.showAnswersAfterSubmit ?? quiz.ShowAnswersAfterSubmit ?? true,
                showScoreImmediately: quiz.showScoreImmediately ?? quiz.ShowScoreImmediately ?? true,
                shuffleQuestions: quiz.shuffleQuestions ?? quiz.ShuffleQuestions ?? true,
                shuffleAnswers: quiz.shuffleAnswers ?? quiz.ShuffleAnswers ?? true,
                allowUnlimitedAttempts: quiz.allowUnlimitedAttempts ?? quiz.AllowUnlimitedAttempts ?? false,
                maxAttempts: quiz.maxAttempts || quiz.MaxAttempts,
            });

            if (response.data?.success) {
                setNotification({
                    isOpen: true,
                    type: "success",
                    message: "Lưu quiz thành công",
                });
            } else {
                throw new Error(response.data?.message || "Lưu quiz thất bại");
            }
        } catch (error) {
            console.error("Error saving quiz:", error);
            setNotification({
                isOpen: true,
                type: "error",
                message: error.response?.data?.message || error.message || "Có lỗi xảy ra khi lưu quiz",
            });
        }
    };

    if (!isAuthenticated || !isTeacher) {
        return null;
    }

    if (loading) {
        return (
            <>
                <TeacherHeader />
                <div className="teacher-quiz-editor-container">
                    <div className="loading-message">Đang tải thông tin...</div>
                </div>
            </>
        );
    }

    if (error || !quiz) {
        return (
            <>
                <TeacherHeader />
                <div className="teacher-quiz-editor-container">
                    <div className="error-message">{error || "Không tìm thấy quiz"}</div>
                </div>
            </>
        );
    }

    const courseTitle = course?.title || course?.Title || courseId;
    const lessonTitle = lesson?.title || lesson?.Title || "Bài học";
    const quizTitle = quiz.title || quiz.Title || "Quiz";

    return (
        <>
            <TeacherHeader />
            <div className="teacher-quiz-editor-container">
                <div className="breadcrumb-section">
                    <span className="breadcrumb-text">
                        <span
                            className="breadcrumb-link"
                            onClick={() => navigate(ROUTE_PATHS.TEACHER_COURSE_MANAGEMENT)}
                        >
                            Quản lý khoá học
                        </span>
                        {" / "}
                        <span
                            className="breadcrumb-link"
                            onClick={() => navigate(`/teacher/course/${courseId}`)}
                        >
                            {courseTitle}
                        </span>
                        {" / "}
                        <span
                            className="breadcrumb-link"
                            onClick={() => navigate(ROUTE_PATHS.TEACHER_LESSON_DETAIL(courseId, lessonId))}
                        >
                            {lessonTitle}
                        </span>
                        {" / "}
                        <span className="breadcrumb-current">Tạo Câu hỏi Quiz</span>
                    </span>
                </div>

                <Container fluid className="quiz-editor-content">
                    <Row className="quiz-editor-header">
                        <Col>
                            <h1 className="quiz-editor-title">{quizTitle}</h1>
                        </Col>
                        <Col xs="auto">
                            <button
                                className="btn btn-primary save-quiz-btn"
                                onClick={handleSaveQuiz}
                            >
                                Lưu Quiz
                            </button>
                        </Col>
                    </Row>

                    <Row className="quiz-editor-main">
                        <Col md={4} className="quiz-editor-sidebar">
                            <QuestionSidebar
                                questions={questions}
                                selectedQuestion={selectedQuestion}
                                onQuestionSelect={handleQuestionSelect}
                                onCreateQuestion={handleCreateQuestion}
                                onDeleteQuestion={handleDeleteQuestion}
                            />
                        </Col>
                        <Col md={8} className="quiz-editor-main-content">
                            {selectedQuestion ? (
                                <QuestionEditor
                                    question={selectedQuestion}
                                    questions={questions}
                                    currentIndex={questions.findIndex(
                                        (q) => (q.questionId || q.QuestionId) === (selectedQuestion.questionId || selectedQuestion.QuestionId)
                                    )}
                                    onSave={(questionData) => {
                                        const questionId = selectedQuestion.questionId || selectedQuestion.QuestionId;
                                        handleUpdateQuestion(questionId, questionData);
                                    }}
                                    onDelete={() => {
                                        const questionId = selectedQuestion.questionId || selectedQuestion.QuestionId;
                                        handleDeleteQuestion(questionId);
                                    }}
                                    onNavigate={(direction) => {
                                        const currentIndex = questions.findIndex(
                                            (q) => (q.questionId || q.QuestionId) === (selectedQuestion.questionId || selectedQuestion.QuestionId)
                                        );
                                        if (direction === "prev" && currentIndex > 0) {
                                            setSelectedQuestion(questions[currentIndex - 1]);
                                        } else if (direction === "next" && currentIndex < questions.length - 1) {
                                            setSelectedQuestion(questions[currentIndex + 1]);
                                        }
                                    }}
                                />
                            ) : (
                                <div className="no-question-selected">
                                    <p>Chọn một câu hỏi từ sidebar để chỉnh sửa hoặc nhấn nút "+" để tạo câu hỏi mới</p>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification({ ...notification, isOpen: false })}
                type={notification.type}
                message={notification.message}
                autoClose={true}
                autoCloseDelay={3000}
            />
        </>
    );
}

