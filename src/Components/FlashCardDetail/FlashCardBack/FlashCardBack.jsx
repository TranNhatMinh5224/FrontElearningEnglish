import React from "react";
import { FaVolumeUp } from "react-icons/fa";
import "./FlashCardBack.css";

export default function FlashCardBack({ flashcard, onAudioClick }) {
    if (!flashcard) {
        return null;
    }

    const word = flashcard.word || "";
    const meaning = flashcard.meaning || "";
    const pronunciation = flashcard.pronunciation || "";
    const exampleTranslation = flashcard.exampleTranslation || "";
    const partOfSpeech = flashcard.partOfSpeech || "";
    const audioUrl = flashcard.audioUrl || "";

    const handleAudioClick = (e) => {
        e.stopPropagation();
        if (onAudioClick) {
            onAudioClick(e);
        }
    };

    return (
        <div className="flashcard-back">
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
            <div className="flashcard-back-content">
                <h2 className="flashcard-word">{word}</h2>
                {pronunciation && (
                    <p className="flashcard-pronunciation">{pronunciation}</p>
                )}
                {partOfSpeech && (
                    <p className="flashcard-part-of-speech">{partOfSpeech}</p>
                )}
                {meaning && (
                    <div className="flashcard-meaning">
                        <p>{meaning}</p>
                    </div>
                )}
                {exampleTranslation && (
                    <div className="flashcard-example-translation">
                        <p>{exampleTranslation}</p>
                    </div>
                )}
                <p className="flashcard-hint">Ấn vào thẻ để lật</p>
            </div>
        </div>
    );
}

