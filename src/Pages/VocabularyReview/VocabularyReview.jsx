import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VocabularyReview.css";
import MainHeader from "../../Components/Header/MainHeader";
import { flashcardReviewService } from "../../Services/flashcardReviewService";

export default function VocabularyReview() {
    const navigate = useNavigate();
    const [vocabularyCount, setVocabularyCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDueFlashCards = async () => {
            try {
                const response = await flashcardReviewService.getDueFlashCards();
                const data = response.data?.data;
                // Count total flashcards due today
                const count = data?.flashCards?.length || 0;
                setVocabularyCount(count);
            } catch (error) {
                console.error("Error fetching due flashcards:", error);
                setVocabularyCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchDueFlashCards();
    }, []);

    const handleStartReview = () => {
        // Navigate to review session page
        navigate("/vocabulary-review/session");
    };

    return (
        <>
            <MainHeader />
            <div className="vocabulary-review-container">
                <div className="vocabulary-review-card">
                    <h1 className="vocabulary-review-title">Ôn tập từ vựng hôm nay</h1>

                    <div className="vocabulary-count-section">
                        <span className="vocabulary-count-label">Số từ cần ôn:</span>
                        <span className="vocabulary-count-number">{vocabularyCount}</span>
                        <span className="vocabulary-count-unit">từ</span>
                    </div>

                    <button
                        className="start-review-button"
                        onClick={handleStartReview}
                        disabled={loading || vocabularyCount === 0}
                    >
                        Ôn tập ngay
                    </button>

                    <p className="motivational-message">
                        Hãy dành vài phút để củng cố lại kiến thức nhé!
                    </p>
                </div>
            </div>
        </>
    );
}

