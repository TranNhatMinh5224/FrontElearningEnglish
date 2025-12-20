import React from "react";
import { Card, Alert } from "react-bootstrap";
import "./MultipleChoiceQuestion.css";

export default function MultipleChoiceQuestion({ question, answer, onChange, multiple = false }) {
    const options = question.options || question.Options || [];
    
    const handleChange = (optionId) => {
        if (multiple) {
            // Multiple answers: toggle option in array
            const currentAnswers = Array.isArray(answer) ? answer : [];
            const newAnswers = currentAnswers.includes(optionId)
                ? currentAnswers.filter(id => id !== optionId)
                : [...currentAnswers, optionId];
            onChange(newAnswers);
        } else {
            // Single choice: set optionId
            onChange(optionId);
        }
    };

    const isSelected = (optionId) => {
        if (multiple) {
            return Array.isArray(answer) && answer.includes(optionId);
        }
        return answer === optionId;
    };

    return (
        <div className="multiple-choice-question">
            {multiple && (
                <Alert variant="info" className="multiple-answers-hint py-2 px-3 mb-3">
                    <span className="hint-text">(Có thể chọn nhiều đáp án)</span>
                </Alert>
            )}
            <div className="options-list">
                {options.map((option, index) => {
                    const optionId = option.optionId || option.OptionId || option.answerOptionId || option.AnswerOptionId;
                    const optionText = option.optionText || option.OptionText || option.text || option.Text;
                    const optionMedia = option.mediaUrl || option.MediaUrl;
                    const selected = isSelected(optionId);
                    return (
                        <Card
                            key={optionId || index}
                            className={`option-item${selected ? " selected" : ""}`}
                            onClick={() => handleChange(optionId)}
                            style={{ cursor: "pointer", borderColor: selected ? "#41d6e3" : undefined }}
                        >
                            <Card.Body className="option-content">
                                <span className="option-label">
                                    {String.fromCharCode(65 + index)}. {optionText}
                                </span>
                                {optionMedia && (
                                    <div className="option-media">
                                        {optionMedia.includes('.mp4') || optionMedia.includes('.webm') ? (
                                            <video src={optionMedia} controls className="option-media-element" />
                                        ) : optionMedia.includes('.mp3') || optionMedia.includes('.wav') ? (
                                            <audio src={optionMedia} controls className="option-media-element" />
                                        ) : (
                                            <img src={optionMedia} alt="Option media" className="option-media-element" />
                                        )}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

