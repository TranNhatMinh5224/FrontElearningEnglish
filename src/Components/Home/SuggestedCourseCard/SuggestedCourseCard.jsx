import React from "react";
import "./SuggestedCourseCard.css";

export default function SuggestedCourseCard({ course }) {
    const {
        title = "Khoá học: luyện phát âm",
        skill = "Speaking",
        imageUrl,
    } = course || {};

    return (
        <div className="suggested-course-card">
            <div className="suggest-icon">
                {imageUrl ? (
                    <img src={imageUrl} alt={title} className="course-image" />
                ) : (
                    <span>📚</span>
                )}
            </div>
            <div className="suggest-text">
                <h4>{title}</h4>
                <span>Kỹ năng: {skill}</span>
            </div>
            <button className="play-btn">▶</button>
        </div>
    );
}

