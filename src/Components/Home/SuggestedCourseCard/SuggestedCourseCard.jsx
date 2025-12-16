import React from "react";
import "./SuggestedCourseCard.css";

export default function SuggestedCourseCard({ course }) {
    const {
        title = "Khoá học: luyện phát âm",
        skill = "Speaking",
        icon = "🎤",
    } = course || {};

    return (
        <div className="suggested-course-card">
            <div className="suggest-icon">{icon}</div>
            <div className="suggest-text">
                <h4>{title}</h4>
                <span>Kỹ năng: {skill}</span>
            </div>
            <button className="play-btn">▶</button>
        </div>
    );
}

