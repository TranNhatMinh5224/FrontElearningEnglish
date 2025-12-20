import React, { useState, useEffect } from "react";
import { FaGripVertical, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { Card, Alert } from "react-bootstrap";
import "./OrderingQuestion.css";

export default function OrderingQuestion({ question, answer, onChange }) {
    const options = question.options || question.Options || [];
    
    const [orderedOptions, setOrderedOptions] = useState(() => {
        // Initialize from answer if exists
        if (Array.isArray(answer) && answer.length > 0) {
            // Reorder options based on answer
            const ordered = answer.map(id => 
                options.find(opt => 
                    (opt.optionId || opt.OptionId || opt.answerOptionId || opt.AnswerOptionId) === id
                )
            ).filter(Boolean);
            // Add any missing options
            const existingIds = new Set(answer);
            options.forEach(opt => {
                const optId = opt.optionId || opt.OptionId || opt.answerOptionId || opt.AnswerOptionId;
                if (!existingIds.has(optId)) {
                    ordered.push(opt);
                }
            });
            return ordered;
        }
        // Default: use original order
        return [...options];
    });

    useEffect(() => {
        // Update answer when order changes
        const orderedIds = orderedOptions.map(opt => 
            opt.optionId || opt.OptionId || opt.answerOptionId || opt.AnswerOptionId
        );
        onChange(orderedIds);
    }, [orderedOptions]);

    const moveUp = (index) => {
        if (index === 0) return;
        const newOrder = [...orderedOptions];
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        setOrderedOptions(newOrder);
    };

    const moveDown = (index) => {
        if (index === orderedOptions.length - 1) return;
        const newOrder = [...orderedOptions];
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        setOrderedOptions(newOrder);
    };

    const handleDragStart = (e, index) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/html'));
        if (dragIndex === dropIndex) return;

        const newOrder = [...orderedOptions];
        const draggedItem = newOrder[dragIndex];
        newOrder.splice(dragIndex, 1);
        newOrder.splice(dropIndex, 0, draggedItem);
        setOrderedOptions(newOrder);
    };

    return (
        <div className="ordering-question">
            <Alert variant="info" className="ordering-instructions py-2 px-3 mb-3">
                <p className="mb-0">Sắp xếp các mục theo thứ tự đúng bằng cách kéo thả hoặc sử dụng nút mũi tên</p>
            </Alert>
            <div className="ordering-list">
                {orderedOptions.map((option, index) => {
                    const optionId = option.optionId || option.OptionId || option.answerOptionId || option.AnswerOptionId;
                    const optionText = option.optionText || option.OptionText || option.text || option.Text;
                    const optionMedia = option.mediaUrl || option.MediaUrl;
                    return (
                        <Card
                            key={optionId || index}
                            className="ordering-item mb-2"
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            style={{ cursor: "move" }}
                        >
                            <Card.Body className="ordering-item-content">
                                <div className="ordering-item-handle">
                                    <FaGripVertical />
                                </div>
                                <div className="ordering-item-number">
                                    {index + 1}
                                </div>
                                <div className="ordering-item-text">
                                    {optionText}
                                    {optionMedia && (
                                        <div className="ordering-item-media">
                                            {optionMedia.includes('.mp4') || optionMedia.includes('.webm') ? (
                                                <video src={optionMedia} controls className="ordering-media-element" />
                                            ) : optionMedia.includes('.mp3') || optionMedia.includes('.wav') ? (
                                                <audio src={optionMedia} controls className="ordering-media-element" />
                                            ) : (
                                                <img src={optionMedia} alt="Option media" className="ordering-media-element" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="ordering-item-actions">
                                    <button
                                        type="button"
                                        className="ordering-action-btn"
                                        onClick={() => moveUp(index)}
                                        disabled={index === 0}
                                        title="Di chuyển lên"
                                    >
                                        <FaArrowUp />
                                    </button>
                                    <button
                                        type="button"
                                        className="ordering-action-btn"
                                        onClick={() => moveDown(index)}
                                        disabled={index === orderedOptions.length - 1}
                                        title="Di chuyển xuống"
                                    >
                                        <FaArrowDown />
                                    </button>
                                </div>
                            </Card.Body>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

