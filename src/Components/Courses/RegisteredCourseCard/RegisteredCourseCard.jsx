import React from "react";
import "./RegisteredCourseCard.css";

export default function RegisteredCourseCard({ course, onContinue }) {
    const {
        title = "IELTS 6.5",
        imageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
        progress = 40,
    } = course || {};

    return (
        <div className="registered-course-card">
            <img src={imageUrl} alt={title} />
            <div className="course-info">
                <h3>{title}</h3>
                <div className="progress-wrapper">
                    <div className="progress">
                        <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="progress-text">{progress}%</span>
                </div>
                <button className="continue-btn" onClick={() => onContinue?.(course)}>
                    Tiếp tục học
                </button>
            </div>
        </div>
    );
}

