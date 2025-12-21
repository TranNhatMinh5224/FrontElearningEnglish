import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import FlashCardViewer from "../../Components/FlashCardDetail/FlashCardViewer/FlashCardViewer";
import FlashCardProgressBar from "../../Components/FlashCardDetail/FlashCardProgressBar/FlashCardProgressBar";
import MemoryAssessment from "../../Components/FlashCardReview/MemoryAssessment/MemoryAssessment";
import ReviewCompletion from "../../Components/FlashCardReview/ReviewCompletion/ReviewCompletion";
import ExitConfirmModal from "../../Components/FlashCardReview/ExitConfirmModal/ExitConfirmModal";
import { flashcardReviewService } from "../../Services/flashcardReviewService";
import { flashcardService } from "../../Services/flashcardService";
import "./FlashCardReviewSession.css";

export default function FlashCardReviewSession() {
    const navigate = useNavigate();
    const [flashcards, setFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedQuality, setSelectedQuality] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCompletion, setShowCompletion] = useState(false);
    const [reviewStats, setReviewStats] = useState(null);
    const [showExitModal, setShowExitModal] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        const fetchDueFlashCards = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await flashcardReviewService.getDueFlashCards();
                if (response.data?.success && response.data?.data) {
                    const flashcardsData = response.data.data.flashCards || [];

                    if (flashcardsData.length === 0) {
                        setError("Không có từ nào cần ôn tập hôm nay");
                        return;
                    }

                    // Fetch detailed information for each flashcard to get example and exampleTranslation
                    const flashcardsWithDetails = await Promise.all(
                        flashcardsData.map(async (flashcard) => {
                            try {
                                // Check if flashcard already has example and exampleTranslation
                                if (flashcard.example && flashcard.exampleTranslation) {
                                    return flashcard;
                                }

                                // Fetch detailed flashcard if missing example data
                                const detailResponse = await flashcardService.getFlashcardById(
                                    flashcard.flashCardId
                                );
                                if (
                                    detailResponse.data?.success &&
                                    detailResponse.data?.data
                                ) {
                                    // Merge detail data with list data
                                    return {
                                        ...flashcard,
                                        example:
                                            detailResponse.data.data.example ||
                                            flashcard.example,
                                        exampleTranslation:
                                            detailResponse.data.data.exampleTranslation ||
                                            flashcard.exampleTranslation,
                                        pronunciation:
                                            detailResponse.data.data.pronunciation ||
                                            flashcard.pronunciation,
                                        partOfSpeech:
                                            detailResponse.data.data.partOfSpeech ||
                                            flashcard.partOfSpeech,
                                    };
                                }
                                return flashcard;
                            } catch (err) {
                                console.error(
                                    `Error fetching detail for flashcard ${flashcard.flashCardId}:`,
                                    err
                                );
                                return flashcard; // Return original if detail fetch fails
                            }
                        })
                    );

                    setFlashcards(flashcardsWithDetails);
                    setCurrentIndex(0);
                } else {
                    setError(
                        response.data?.message || "Không thể tải danh sách từ cần ôn tập"
                    );
                }
            } catch (err) {
                console.error("Error fetching due flashcards:", err);
                setError("Không thể tải dữ liệu từ cần ôn tập");
            } finally {
                setLoading(false);
            }
        };

        fetchDueFlashCards();
    }, []);

    const handleQualitySelect = (quality) => {
        setSelectedQuality(quality);
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setSelectedQuality(null); // Reset quality selection when going back
        }
    };

    const handleNext = async () => {
        if (!selectedQuality) {
            alert("Vui lòng chọn mức độ nhớ của từ này trước khi chuyển sang từ tiếp theo");
            return;
        }

        const currentFlashcard = flashcards[currentIndex];
        if (!currentFlashcard) return;

        try {
            // Call review API
            await flashcardReviewService.reviewFlashCard(
                currentFlashcard.flashCardId,
                selectedQuality
            );

            // Reset selected quality
            setSelectedQuality(null);

            // Move to next card
            if (currentIndex < flashcards.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                // All cards reviewed, show completion
                await handleComplete();
            }
        } catch (err) {
            console.error("Error reviewing flashcard:", err);
            const errorMsg =
                err.response?.data?.message ||
                "Không thể lưu đánh giá. Vui lòng thử lại.";
            alert(errorMsg);
        }
    };

    const handleComplete = async () => {
        try {
            // Fetch statistics and mastered cards
            const [statsResponse, masteredResponse] = await Promise.all([
                flashcardReviewService.getStatistics(),
                flashcardReviewService.getMasteredFlashCards(),
            ]);

            const stats = statsResponse.data?.data;
            const mastered = masteredResponse.data?.data;

            setReviewStats({
                totalCards: stats?.totalCards || 0,
                masteredCards: mastered?.reviewCards || 0,
                notMasteredCards:
                    (stats?.totalCards || 0) - (mastered?.reviewCards || 0),
            });

            setShowCompletion(true);
        } catch (err) {
            console.error("Error fetching review statistics:", err);
            // Still show completion even if stats fail
            setShowCompletion(true);
        }
    };

    const handleContinueLearning = () => {
        navigate("/my-courses");
    };

    const handleCloseClick = () => {
        setShowExitModal(true);
    };

    const handleContinueReview = () => {
        setShowExitModal(false);
    };

    const handleExit = () => {
        navigate("/home");
    };

    if (loading) {
        return (
            <div className="flashcard-review-session-container">
                <div className="loading-message">Đang tải...</div>
            </div>
        );
    }

    if (error && flashcards.length === 0) {
        return (
            <div className="flashcard-review-session-container">
                <div className="error-message">{error}</div>
                <button
                    className="back-button"
                    onClick={() => navigate("/home")}
                >
                    Quay lại
                </button>
            </div>
        );
    }

    if (showCompletion && reviewStats) {
        return (
            <ReviewCompletion
                totalCards={reviewStats.totalCards}
                masteredCards={reviewStats.masteredCards}
                notMasteredCards={reviewStats.notMasteredCards}
                onContinue={handleContinueLearning}
            />
        );
    }

    const currentFlashcard = flashcards[currentIndex];
    const isLastCard = currentIndex === flashcards.length - 1;

    return (
        <>
            <div className="flashcard-review-session-container">
                <Container className="flashcard-content-container">
                    <FlashCardProgressBar
                        current={currentIndex + 1}
                        total={flashcards.length}
                        onClose={handleCloseClick}
                        variant="review"
                    />
                    <FlashCardViewer
                        flashcard={currentFlashcard}
                        onPrevious={null}
                        onNext={null}
                        canGoPrevious={false}
                        canGoNext={false}
                        isLastCard={false}
                        onComplete={null}
                        hideNavigation={true}
                    />
                    <MemoryAssessment
                        selectedQuality={selectedQuality}
                        onQualitySelect={handleQualitySelect}
                    />
                    <div className="review-navigation">
                        <button
                            className="review-prev-button"
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                        >
                            Từ trước
                        </button>
                        <button
                            className="review-next-button"
                            onClick={handleNext}
                            disabled={!selectedQuality}
                        >
                            {isLastCard ? "Hoàn thành ôn tập từ vựng" : "Từ tiếp theo"}
                        </button>
                    </div>
                </Container>
            </div>
            <ExitConfirmModal
                isOpen={showExitModal}
                onContinue={handleContinueReview}
                onExit={handleExit}
            />
        </>
    );
}

