import React from "react";
import { Container } from "react-bootstrap";
import "./ReviewCompletion.css";

export default function ReviewCompletion({
    totalCards,
    masteredCards,
    notMasteredCards,
    onContinue,
}) {
    return (
        <div className="review-completion-container">
            <Container className="review-completion-content">
                <div className="completion-icon-wrapper">
                    <div className="completion-icon">
                        <svg
                            width="80"
                            height="80"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                fill="#41d6e3"
                                opacity="0.2"
                            />
                            <path
                                d="M9 12l2 2 4-4"
                                stroke="#41d6e3"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>
                <h2 className="completion-title">Hoàn thành ôn tập từ vựng</h2>
                <p className="completion-message">
                    Bạn đã làm rất tốt. Hãy xem kết quả nhé!
                </p>

                <div className="review-results-card">
                    <h3 className="results-title">Kết quả học tập</h3>
                    <div className="results-stats">
                        <div className="stat-item stat-total">
                            <div className="stat-label">Tổng số từ</div>
                            <div className="stat-value">{totalCards}</div>
                        </div>
                        <div className="stat-item stat-mastered">
                            <div className="stat-label">Từ đã thuộc</div>
                            <div className="stat-value">{masteredCards}</div>
                        </div>
                        <div className="stat-item stat-not-mastered">
                            <div className="stat-label">Từ chưa thuộc</div>
                            <div className="stat-value">{notMasteredCards}</div>
                        </div>
                    </div>
                </div>

                <div className="completion-actions">
                    <button
                        className="continue-learning-button"
                        onClick={onContinue}
                    >
                        Học tiếp
                    </button>
                </div>
            </Container>
        </div>
    );
}

