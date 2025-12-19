import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import "./LessonCard.css";

export default function LessonCard({ lesson, orderNumber, onClick }) {
    const {
        lessonId,
        title = "Bài học",
        Title,
        imageUrl,
        ImageUrl,
        isCompleted = false,
        IsCompleted = false,
        orderIndex,
        OrderIndex,
        description,
        Description,
    } = lesson || {};

    const finalTitle = title || Title || "Bài học";
    const finalImageUrl = imageUrl || ImageUrl;
    const finalIsCompleted = isCompleted || IsCompleted;
    const finalOrderIndex = orderIndex || OrderIndex;
    const finalDescription = description || Description;
    const displayOrder = orderNumber || finalOrderIndex || 1;

    return (
        <div className="lesson-card" onClick={onClick}>
            <div className="lesson-image-wrapper">
                {finalImageUrl ? (
                    <img 
                        src={finalImageUrl} 
                        alt={finalTitle}
                        className="lesson-image"
                    />
                ) : (
                    <div className="lesson-image-placeholder">
                        <span>{displayOrder}</span>
                    </div>
                )}
                {finalIsCompleted && (
                    <div className="lesson-completed-badge">
                        <FaCheckCircle />
                    </div>
                )}
            </div>
            <div className="lesson-info">
                <h3 className="lesson-title">{finalTitle}</h3>
                <span className="lesson-order">{displayOrder}. {finalDescription || finalTitle}</span>
            </div>
        </div>
    );
}

