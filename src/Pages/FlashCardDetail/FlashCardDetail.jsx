import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import MainHeader from "../../Components/Header/MainHeader";
import FlashCardProgressBar from "../../Components/FlashCardDetail/FlashCardProgressBar/FlashCardProgressBar";
import FlashCardViewer from "../../Components/FlashCardDetail/FlashCardViewer/FlashCardViewer";
import { flashcardService } from "../../Services/flashcardService";
import { moduleService } from "../../Services/moduleService";
import { lessonService } from "../../Services/lessonService";
import { courseService } from "../../Services/courseService";
import { flashcardReviewService } from "../../Services/flashcardReviewService";
import "./FlashCardDetail.css";
import "./FlashCardCompletion.css";

export default function FlashCardDetail() {
    const { courseId, lessonId, moduleId } = useParams();
    const navigate = useNavigate();
    const [flashcards, setFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [module, setModule] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCompletion, setShowCompletion] = useState(false);
    const [completionMessage, setCompletionMessage] = useState("");
    const moduleStartedRef = useRef(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                // Gọi API hoàn thành module khi vào trang flashcard - chỉ gọi một lần cho mỗi moduleId
                const parsedModuleId = typeof moduleId === 'string' ? parseInt(moduleId) : moduleId;
                if (parsedModuleId && !isNaN(parsedModuleId) && !moduleStartedRef.current.has(parsedModuleId)) {
                    try {
                        console.log(`Starting module ${parsedModuleId}...`);
                        const response = await moduleService.startModule(parsedModuleId);
                        moduleStartedRef.current.add(parsedModuleId);
                        console.log(`Module ${parsedModuleId} started successfully:`, response?.data);
                    } catch (err) {
                        console.error(`Error starting module ${parsedModuleId}:`, err);
                        console.error("Error details:", err.response?.data || err.message);
                        // Tiếp tục load dữ liệu dù API có lỗi
                    }
                } else {
                    if (moduleStartedRef.current.has(parsedModuleId)) {
                        console.log(`Module ${parsedModuleId} already started, skipping API call`);
                    } else {
                        console.warn(`Invalid moduleId: ${moduleId} (parsed: ${parsedModuleId})`);
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

                // Fetch flashcards
                const flashcardsResponse = await flashcardService.getFlashcardsByModuleId(moduleId);
                if (flashcardsResponse.data?.success && flashcardsResponse.data?.data) {
                    const flashcardsData = flashcardsResponse.data.data;
                    
                    // Fetch detailed information for each flashcard to get example and exampleTranslation
                    const flashcardsWithDetails = await Promise.all(
                        flashcardsData.map(async (flashcard) => {
                            try {
                                // Check if flashcard already has example and exampleTranslation
                                if (flashcard.example && flashcard.exampleTranslation) {
                                    return flashcard;
                                }
                                
                                // Fetch detailed flashcard if missing example data
                                const detailResponse = await flashcardService.getFlashcardById(flashcard.flashCardId);
                                if (detailResponse.data?.success && detailResponse.data?.data) {
                                    // Merge detail data with list data
                                    return {
                                        ...flashcard,
                                        example: detailResponse.data.data.example || flashcard.example,
                                        exampleTranslation: detailResponse.data.data.exampleTranslation || flashcard.exampleTranslation,
                                        pronunciation: detailResponse.data.data.pronunciation || flashcard.pronunciation,
                                        partOfSpeech: detailResponse.data.data.partOfSpeech || flashcard.partOfSpeech,
                                    };
                                }
                                return flashcard;
                            } catch (err) {
                                console.error(`Error fetching detail for flashcard ${flashcard.flashCardId}:`, err);
                                return flashcard; // Return original if detail fetch fails
                            }
                        })
                    );
                    
                    setFlashcards(flashcardsWithDetails);
                    if (flashcardsWithDetails.length > 0) {
                        setCurrentIndex(0);
                    }
                } else {
                    setError(flashcardsResponse.data?.message || "Không thể tải danh sách flashcard");
                }
            } catch (err) {
                console.error("Error fetching flashcard data:", err);
                setError("Không thể tải dữ liệu flashcard");
            } finally {
                setLoading(false);
            }
        };

        if (moduleId) {
            fetchData();
        }
    }, [moduleId, courseId, lessonId]);

    const handleBackClick = () => {
        navigate(`/course/${courseId}/lesson/${lessonId}`);
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleComplete = async () => {
        try {
            const response = await flashcardReviewService.startModule(moduleId);
            if (response.data?.success) {
                // Show completion message from backend
                const message = response.data.message || `Bạn đã thêm ${response.data.data || flashcards.length} từ vào trong danh sách ôn tập`;
                setCompletionMessage(message);
                setShowCompletion(true);
            } else {
                setError(response.data?.message || "Không thể hoàn thành flashcard module");
            }
        } catch (err) {
            console.error("Error completing flashcard module:", err);
            setError("Không thể hoàn thành flashcard module");
        }
    };

    const handleBackFromCompletion = () => {
        navigate(`/course/${courseId}/lesson/${lessonId}`);
    };

    if (loading) {
        return (
            <>
                <MainHeader />
                <div className="flashcard-detail-container">
                    <div className="loading-message">Đang tải...</div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <MainHeader />
                <div className="flashcard-detail-container">
                    <div className="error-message">{error}</div>
                </div>
            </>
        );
    }

    if (flashcards.length === 0) {
        return (
            <>
                <MainHeader />
                <div className="flashcard-detail-container">
                    <div className="no-flashcards-message">Chưa có flashcard nào</div>
                </div>
            </>
        );
    }

    if (showCompletion) {
        return (
            <>
                <MainHeader />
                <div className="flashcard-detail-container">
                    <Container>
                        <div className="flashcard-completion-screen">
                            <div className="completion-icon">
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" fill="#10b981" opacity="0.2"/>
                                    <path d="M9 12l2 2 4-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h2 className="completion-title">Hoàn thành Flash Card!</h2>
                            <p className="completion-message">{completionMessage}</p>
                            <button 
                                className="completion-back-button"
                                onClick={handleBackFromCompletion}
                            >
                                Trở về
                            </button>
                        </div>
                    </Container>
                </div>
            </>
        );
    }

    const currentFlashcard = flashcards[currentIndex];
    const lessonTitle = lesson?.title || lesson?.Title || "Bài học";
    const courseTitle = course?.title || course?.Title || "Khóa học";
    const moduleName = module?.name || module?.Name || "Module";

    return (
        <>
            <MainHeader />
            <div className="flashcard-detail-container">
                <Container>
                    <div className="flashcard-detail-breadcrumb">
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
                </Container>
                <Container className="flashcard-content-container">
                    <FlashCardProgressBar 
                        current={currentIndex + 1} 
                        total={flashcards.length} 
                    />
                    <FlashCardViewer 
                        flashcard={currentFlashcard}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        canGoPrevious={currentIndex > 0}
                        canGoNext={currentIndex < flashcards.length - 1}
                        isLastCard={currentIndex === flashcards.length - 1}
                        onComplete={handleComplete}
                    />
                </Container>
            </div>
        </>
    );
}

