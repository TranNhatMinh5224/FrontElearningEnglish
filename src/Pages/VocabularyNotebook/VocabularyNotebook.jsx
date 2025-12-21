import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import "./VocabularyNotebook.css";
import MainHeader from "../../Components/Header/MainHeader";
import { flashcardReviewService } from "../../Services/flashcardReviewService";
import { FaCheckCircle } from "react-icons/fa";

export default function VocabularyNotebook() {
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMasteredFlashCards = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await flashcardReviewService.getMasteredFlashCards();
                if (response.data?.success && response.data?.data) {
                    const flashcardsData = response.data.data.flashCards || [];
                    setFlashcards(flashcardsData);
                } else {
                    setError(
                        response.data?.message || "Không thể tải danh sách từ vựng đã thuộc"
                    );
                }
            } catch (err) {
                console.error("Error fetching mastered flashcards:", err);
                setError("Không thể tải dữ liệu từ vựng đã thuộc");
            } finally {
                setLoading(false);
            }
        };

        fetchMasteredFlashCards();
    }, []);

    if (loading) {
        return (
            <>
                <MainHeader />
                <div className="vocabulary-notebook-container">
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
                <div className="vocabulary-notebook-container">
                    <Container>
                        <div className="error-message">{error}</div>
                    </Container>
                </div>
            </>
        );
    }

    return (
        <>
            <MainHeader />
            <div className="vocabulary-notebook-container">
                <Container>
                    <div className="vocabulary-notebook-header">
                        <h1 className="vocabulary-notebook-title">Sổ tay từ vựng</h1>
                        <p className="vocabulary-notebook-subtitle">
                            Tổng số từ đã thuộc: <span className="count-badge">{flashcards.length}</span>
                        </p>
                    </div>

                    {flashcards.length === 0 ? (
                        <div className="empty-state">
                            <p>Bạn chưa có từ vựng nào đã thuộc.</p>
                            <p className="empty-state-hint">
                                Hãy bắt đầu học và ôn tập để thêm từ vào sổ tay nhé!
                            </p>
                        </div>
                    ) : (
                        <div className="vocabulary-list-container">
                            <div className="vocabulary-list-header">
                                <div className="vocabulary-header-column status-column">
                                    <span>Trạng thái</span>
                                </div>
                                <div className="vocabulary-header-column word-column">
                                    <span>Từ vựng & Phát âm</span>
                                </div>
                                <div className="vocabulary-header-column part-of-speech-column">
                                    <span>Từ loại</span>
                                </div>
                                <div className="vocabulary-header-column meaning-column">
                                    <span>Nghĩa</span>
                                </div>
                            </div>

                            <div className="vocabulary-list">
                                {flashcards.map((flashcard) => (
                                    <div key={flashcard.flashCardId} className="vocabulary-item">
                                        <div className="vocabulary-column status-column">
                                            <FaCheckCircle className="status-icon" />
                                        </div>
                                        <div className="vocabulary-column word-column">
                                            <div className="word-pronunciation-group">
                                                <span className="vocabulary-word">
                                                    {flashcard.word || ""}
                                                </span>
                                                {flashcard.pronunciation && (
                                                    <span className="vocabulary-pronunciation">
                                                        {flashcard.pronunciation}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="vocabulary-column part-of-speech-column">
                                            <span className="vocabulary-part-of-speech">
                                                {flashcard.partOfSpeech || "-"}
                                            </span>
                                        </div>
                                        <div className="vocabulary-column meaning-column">
                                            <span className="vocabulary-meaning">
                                                {flashcard.meaning || ""}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Container>
            </div>
        </>
    );
}

