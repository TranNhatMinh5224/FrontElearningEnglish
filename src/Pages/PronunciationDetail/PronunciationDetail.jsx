import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import MainHeader from "../../Components/Header/MainHeader";
import PronunciationCard from "../../Components/PronunciationDetail/PronunciationCard/PronunciationCard";
import { pronunciationService } from "../../Services/pronunciationService";
import { moduleService } from "../../Services/moduleService";
import { lessonService } from "../../Services/lessonService";
import { courseService } from "../../Services/courseService";
import "./PronunciationDetail.css";

export default function PronunciationDetail() {
    const { courseId, lessonId, moduleId } = useParams();
    const navigate = useNavigate();

    const [flashcards, setFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    // module / lesson / course state removed (not used in this component)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [summary, setSummary] = useState(null);
    const [showSummary, setShowSummary] = useState(false);

    useEffect(() => {
        console.log("🔊 [PronunciationDetail] Component mounted with params:", { courseId, lessonId, moduleId });
    }, [courseId, lessonId, moduleId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                // Fetch course info
                const courseResponse = await courseService.getCourseById(courseId);
                // course info fetched but not stored (not required in UI)

                // Fetch lesson info
                const lessonResponse = await lessonService.getLessonById(lessonId);
                // lesson info fetched but not stored (not required in UI)

                // Fetch module info
                const moduleResponse = await moduleService.getModuleById(moduleId);
                // module info fetched but not stored (not required in UI)

                // Fetch flashcards with pronunciation progress
                const flashcardsResponse = await pronunciationService.getByModule(moduleId);
                if (flashcardsResponse.data?.success && flashcardsResponse.data?.data) {
                    const flashcardsData = flashcardsResponse.data.data;

                    // Always fetch detailed information for each flashcard to get correct audioUrl
                    // (Same as FlashCardDetail - pronunciation API may return incorrect audioUrl)
                    const { flashcardService } = await import("../../Services/flashcardService");
                    const flashcardsWithDetails = await Promise.all(
                        flashcardsData.map(async (flashcard) => {
                            try {
                                const flashCardId = flashcard.flashCardId || flashcard.FlashCardId;
                                
                                // Always fetch detailed flashcard to get correct audioUrl
                                const detailResponse = await flashcardService.getFlashcardById(flashCardId);
                                if (
                                    detailResponse.data?.success &&
                                    detailResponse.data?.data
                                ) {
                                    // Merge detail data with list data - prioritize detail API audioUrl
                                    return {
                                        ...flashcard,
                                        audioUrl:
                                            detailResponse.data.data.audioUrl ||
                                            detailResponse.data.data.AudioUrl ||
                                            flashcard.audioUrl ||
                                            flashcard.AudioUrl,
                                        imageUrl:
                                            detailResponse.data.data.imageUrl ||
                                            detailResponse.data.data.ImageUrl ||
                                            flashcard.imageUrl ||
                                            flashcard.ImageUrl,
                                        pronunciation:
                                            detailResponse.data.data.pronunciation ||
                                            flashcard.pronunciation ||
                                            flashcard.Phonetic,
                                        phonetic:
                                            detailResponse.data.data.pronunciation ||
                                            flashcard.phonetic ||
                                            flashcard.Phonetic,
                                    };
                                }
                                return flashcard;
                            } catch (err) {
                                console.error(
                                    `Error fetching detail for flashcard ${flashcard.flashCardId || flashcard.FlashCardId}:`,
                                    err
                                );
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

                // Fetch summary
                const summaryResponse = await pronunciationService.getModuleSummary(moduleId);
                if (summaryResponse.data?.success && summaryResponse.data?.data) {
                    setSummary(summaryResponse.data.data);
                }
            } catch (err) {
                console.error("Error fetching pronunciation data:", err);
                setError("Không thể tải dữ liệu phát âm");
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

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleAssessmentComplete = async (assessmentResult) => {
        // Reload flashcards to update progress
        try {
            const flashcardsResponse = await pronunciationService.getByModule(moduleId);
            if (flashcardsResponse.data?.success && flashcardsResponse.data?.data) {
                setFlashcards(flashcardsResponse.data.data);
            }

            // Reload summary
            const summaryResponse = await pronunciationService.getModuleSummary(moduleId);
            if (summaryResponse.data?.success && summaryResponse.data?.data) {
                setSummary(summaryResponse.data.data);
            }
        } catch (err) {
            console.error("Error reloading data:", err);
        }
    };

    const handleComplete = async () => {
        // Reload summary before showing
        try {
            const summaryResponse = await pronunciationService.getModuleSummary(moduleId);
            if (summaryResponse.data?.success && summaryResponse.data?.data) {
                setSummary(summaryResponse.data.data);
            }
        } catch (err) {
            console.error("Error loading summary:", err);
        }
        setShowSummary(true);
    };

    if (loading) {
        return (
            <>
                <MainHeader />
                <div className="pronunciation-detail-container">
                    <Container>
                        <div className="loading-message">Đang tải...</div>
                    </Container>
                </div>
            </>
        );
    }

    if (error && flashcards.length === 0) {
        return (
            <>
                <MainHeader />
                <div className="pronunciation-detail-container">
                    <Container>
                        <div className="error-message">{error}</div>
                        <Button variant="primary" onClick={handleBackClick} className="mt-3">
                            Quay lại
                        </Button>
                    </Container>
                </div>
            </>
        );
    }

    const currentFlashcard = flashcards[currentIndex];
    const canGoNext = currentIndex < flashcards.length - 1;
    const canGoPrevious = currentIndex > 0;

    return (
        <>
            <MainHeader />
            <div className="pronunciation-detail-container">
                <Container>
                    <Row>
                        <Col>
                            <div className="pronunciation-header">
                                <h1 className="pronunciation-title">Luyện Phát Âm</h1>
                            </div>
                        </Col>
                    </Row>

                    {!showSummary && currentFlashcard && (
                        <Row className="justify-content-center">
                            <Col lg={8}>
                                <PronunciationCard
                                    flashcard={currentFlashcard}
                                    currentIndex={currentIndex}
                                    totalCards={flashcards.length}
                                    onNext={handleNext}
                                    onPrevious={handlePrevious}
                                    canGoNext={canGoNext}
                                    canGoPrevious={canGoPrevious}
                                    onAssessmentComplete={handleAssessmentComplete}
                                    onComplete={handleComplete}
                                />
                            </Col>
                        </Row>
                    )}

                    {showSummary && summary && (
                        <Row className="justify-content-center">
                            <Col lg={8}>
                                <div className="pronunciation-summary">
                                    <h2 className="summary-title">Kết quả luyện phát âm</h2>
                                    <div className="summary-stats">
                                        <div className="stat-item">
                                            <div className="stat-value">{summary.totalFlashCards || 0}</div>
                                            <div className="stat-label">Tổng số từ</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-value">{summary.totalPracticed || 0}</div>
                                            <div className="stat-label">Đã luyện</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-value">{summary.masteredCount || 0}</div>
                                            <div className="stat-label">Đã thuộc</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-value">{summary.averageScore?.toFixed(1) || 0}</div>
                                            <div className="stat-label">Điểm trung bình</div>
                                        </div>
                                    </div>
                                    <div className="summary-grade">
                                        <div className="grade-label">Xếp loại:</div>
                                        <div className="grade-value">{summary.grade || "N/A"}</div>
                                    </div>
                                    <div className="summary-message">
                                        <p>{summary.message || "Chúc mừng bạn đã hoàn thành!"}</p>
                                    </div>
                                    <div className="summary-actions">
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => setShowSummary(false)}
                                            className="summary-action-button me-2"
                                        >
                                            Luyện lại
                                        </Button>
                                        <Button
                                            variant="outline-primary"
                                            onClick={handleBackClick}
                                            className="summary-action-button"
                                        >
                                            Quay lại
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    )}
                </Container>
            </div>
        </>
    );
}

