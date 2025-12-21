import React, { useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight, FaCheckCircle } from "react-icons/fa";
import FlashCardFront from "../FlashCardFront/FlashCardFront";
import FlashCardBack from "../FlashCardBack/FlashCardBack";
import "./FlashCardViewer.css";

export default function FlashCardViewer({ flashcard, onPrevious, onNext, canGoPrevious, canGoNext, isLastCard = false, onComplete, hideNavigation = false }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const audioRef = useRef(null);

    // Reset flipped state when flashcard changes
    useEffect(() => {
        setIsFlipped(false);
        // Clean up audio when flashcard changes
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    }, [flashcard?.flashCardId]);

    if (!flashcard) {
        return <div className="flashcard-viewer-empty">Không có flashcard</div>;
    }

    const audioUrl = flashcard.audioUrl || "";

    const handleCardClick = () => {
        setIsFlipped(!isFlipped);
    };

    const handleAudioClick = async (e) => {
        e.stopPropagation();
        if (!audioUrl) {
            console.warn("No audio URL provided");
            return;
        }

        try {
            // Stop any currently playing audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
                audioRef.current = null;
            }
            
            // Try fetching audio as blob first (to bypass CORS if possible)
            try {
                const response = await fetch(audioUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'audio/mpeg, audio/*',
                    },
                    mode: 'cors', // Try CORS first
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                const audio = new Audio(blobUrl);
                
                audio.onended = () => {
                    // Clean up blob URL when audio ends
                    URL.revokeObjectURL(blobUrl);
                };
                
                audioRef.current = audio;
                await audio.play();
                console.log("Audio playing successfully via blob");
            } catch (fetchError) {
                // If fetch fails, try direct audio URL
                console.log("Fetch failed, trying direct audio URL:", fetchError);
                const audio = new Audio(audioUrl);
                audioRef.current = audio;
                await audio.play();
                console.log("Audio playing successfully via direct URL");
            }
        } catch (err) {
            console.error("Error playing audio:", err);
            console.error("Error name:", err.name);
            console.error("Error message:", err.message);
            console.error("Audio URL:", audioUrl);
            
            // Silent fail - don't show alert as it might be annoying
            // User can check console for details
        }
    };

    const handleNavClick = (e, direction) => {
        e.stopPropagation();
        if (direction === "prev" && canGoPrevious && onPrevious) {
            onPrevious();
        } else if (direction === "next" && canGoNext && onNext) {
            onNext();
        }
    };

    return (
        <>
            <div className="flashcard-viewer-wrapper">
                {!hideNavigation && (
                    <button
                        className={`flashcard-nav-button prev-button ${!canGoPrevious ? "disabled" : ""}`}
                        onClick={(e) => handleNavClick(e, "prev")}
                        disabled={!canGoPrevious}
                    >
                        <FaChevronLeft />
                    </button>
                )}
                <div 
                    className={`flashcard-viewer ${isFlipped ? "flipped" : ""}`}
                    onClick={handleCardClick}
                >
                    <div className="flashcard-inner">
                        <FlashCardFront flashcard={flashcard} onAudioClick={handleAudioClick} />
                        <FlashCardBack flashcard={flashcard} onAudioClick={handleAudioClick} />
                    </div>
                </div>
                {!hideNavigation && (
                    <button
                        className={`flashcard-nav-button next-button ${!canGoNext ? "disabled" : ""}`}
                        onClick={(e) => handleNavClick(e, "next")}
                        disabled={!canGoNext}
                    >
                        <FaChevronRight />
                    </button>
                )}
            </div>
            {isLastCard && (
                <button
                    className="flashcard-complete-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onComplete) {
                            onComplete();
                        }
                    }}
                >
                    <FaCheckCircle />
                    <span>Hoàn thành flash card</span>
                </button>
            )}
        </>
    );
}

