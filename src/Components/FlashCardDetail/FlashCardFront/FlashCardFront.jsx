import React, { useRef } from "react";
import { FaVolumeUp } from "react-icons/fa";
import "./FlashCardFront.css";

export default function FlashCardFront({ flashcard, onAudioClick }) {
    if (!flashcard) {
        return null;
    }

    const imageUrl = flashcard.imageUrl || "";
    const audioUrl = flashcard.audioUrl || "";
    const example = flashcard.example || "";
    const exampleTranslation = flashcard.exampleTranslation || "";
    const word = flashcard.word || "";
    
    // Check if example and exampleTranslation are null or empty
    const hasExample = example && example.trim() !== "";
    const hasExampleTranslation = exampleTranslation && exampleTranslation.trim() !== "";
    const shouldShowWord = !hasExample && !hasExampleTranslation;

    const handleAudioClick = (e) => {
        e.stopPropagation();
        if (onAudioClick) {
            onAudioClick(e);
        }
    };

    return (
        <div className="flashcard-front">
            <div className="flashcard-icons-top">
                {audioUrl && (
                    <button 
                        className="flashcard-audio-icon-btn"
                        onClick={handleAudioClick}
                        title="Phát âm"
                    >
                        <FaVolumeUp />
                    </button>
                )}
            </div>
            {imageUrl && (
                <div className="flashcard-image">
                    <img src={imageUrl} alt={`Hình ảnh minh họa cho từ "${word}"`} />
                </div>
            )}
            <div className="flashcard-content">
                {shouldShowWord && word && (
                    <h2 className="flashcard-word-front">{word}</h2>
                )}
                {hasExample && (
                    <div 
                        className="flashcard-example"
                        dangerouslySetInnerHTML={{ __html: example }}
                    />
                )}
                <p className="flashcard-hint">Ấn vào thẻ để lật</p>
            </div>
        </div>
    );
}

