import React, { useState, useEffect } from "react";
import { FaGripVertical, FaArrowUp, FaArrowDown, FaQuestionCircle } from "react-icons/fa";
import { Card, Alert, Button } from "react-bootstrap";
import "./OrderingQuestion.css";

export default function OrderingQuestion({ question, answer, onChange }) {
    const options = question.options || question.Options || [];
    
    const [orderedOptions, setOrderedOptions] = useState(() => {
        if (!Array.isArray(options) || options.length === 0) return [];

        // Initialize from answer if exists
        if (Array.isArray(answer) && answer.length > 0) {
            try {
                // Reorder options based on answer IDs
                const ordered = answer.map(id => {
                    return options.find(opt => {
                        const optId = opt.optionId || opt.OptionId || opt.answerOptionId || opt.AnswerOptionId;
                        return optId === id;
                    });
                }).filter(item => item !== undefined && item !== null);

                // Add any missing options that weren't in the answer array
                const orderedIds = new Set(ordered.map(opt => opt.optionId || opt.OptionId || opt.answerOptionId || opt.AnswerOptionId));
                options.forEach(opt => {
                    const optId = opt.optionId || opt.OptionId || opt.answerOptionId || opt.AnswerOptionId;
                    if (!orderedIds.has(optId)) {
                        ordered.push(opt);
                    }
                });

                return ordered.length > 0 ? ordered : [...options];
            } catch (e) {
                console.error("Error initializing ordering options:", e);
                return [...options];
            }
        }
        // Default: use original order
        return [...options];
    });

    useEffect(() => {
        // Update answer when order changes
        if (orderedOptions && orderedOptions.length > 0) {
            const orderedIds = orderedOptions
                .filter(opt => opt !== undefined && opt !== null)
                .map(opt => {
                    const id = opt.optionId || opt.OptionId || opt.answerOptionId || opt.AnswerOptionId;
                    return Number(id); // Force Number for backend scoring
                });
            
            // Only trigger onChange if we have valid IDs
            if (orderedIds.length > 0) {
                onChange(orderedIds);
            }
        }
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
        e.dataTransfer.setData('text/plain', index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        const dragIndexStr = e.dataTransfer.getData('text/plain');
        if (!dragIndexStr) return;
        
        const dragIndex = parseInt(dragIndexStr);
        if (isNaN(dragIndex) || dragIndex === dropIndex) return;

        const newOrder = [...orderedOptions];
        const draggedItem = newOrder[dragIndex];
        newOrder.splice(dragIndex, 1);
        newOrder.splice(dropIndex, 0, draggedItem);
        setOrderedOptions(newOrder);
    };

    if (!orderedOptions || orderedOptions.length === 0) {
        return <div className="text-muted p-3 border rounded bg-light">Không có nội dung để sắp xếp.</div>;
    }

    return (
        <div className="ordering-question">
            <Alert variant="info" className="ordering-instructions py-2 px-3 mb-3 border-0 shadow-sm">
                <p className="mb-0 small"><FaQuestionCircle className="me-2"/>Sắp xếp các mục theo thứ tự đúng bằng cách kéo thả hoặc sử dụng nút mũi tên</p>
            </Alert>
            <div className="ordering-list">
                {orderedOptions.map((option, index) => {
                    if (!option) return null; // Ultimate safety check
                    
                    const optionId = option.optionId || option.OptionId || option.answerOptionId || option.AnswerOptionId;
                    const optionText = option.optionText || option.OptionText || option.text || option.Text || "---";
                    const optionMedia = option.mediaUrl || option.MediaUrl;
                    
                    return (
                        <Card
                            key={optionId || `idx-${index}`}
                            className="ordering-item mb-2 border-0 shadow-sm"
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            style={{ cursor: "move" }}
                        >
                            <Card.Body className="ordering-item-content p-2">
                                <div className="d-flex align-items-center w-100 gap-3">
                                    <div className="ordering-item-handle text-muted">
                                        <FaGripVertical />
                                    </div>
                                    <div className="ordering-item-number fw-bold text-primary">
                                        {index + 1}
                                    </div>
                                    <div className="ordering-item-text flex-grow-1">
                                        {optionText}
                                        {optionMedia && (
                                            <div className="ordering-item-media mt-2">
                                                {optionMedia.includes('.mp4') || optionMedia.includes('.webm') ? (
                                                    <video src={optionMedia} controls className="ordering-media-element w-100" style={{maxHeight: '150px'}} />
                                                ) : optionMedia.includes('.mp3') || optionMedia.includes('.wav') ? (
                                                    <audio src={optionMedia} controls className="ordering-media-element w-100" />
                                                ) : (
                                                    <img src={optionMedia} alt="Option media" className="ordering-media-element rounded" style={{maxHeight: '100px'}} />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="ordering-item-actions d-flex gap-1">
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="p-1"
                                            onClick={() => moveUp(index)}
                                            disabled={index === 0}
                                        >
                                            <FaArrowUp />
                                        </Button>
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="p-1"
                                            onClick={() => moveDown(index)}
                                            disabled={index === orderedOptions.length - 1}
                                        >
                                            <FaArrowDown />
                                        </Button>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

