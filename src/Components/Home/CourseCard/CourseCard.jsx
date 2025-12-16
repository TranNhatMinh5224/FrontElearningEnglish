import React from "react";
import "./CourseCard.css";

export default function CourseCard({ course }) {
    const {
        title = "IELTS 6.5",
        imageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
        progress = 40,
    } = course || {};

    return (
        <div className="course-card">
            <img src={imageUrl} alt={title} />
            <div className="course-info">
                <h3>{title}</h3>
                <div className="progress">
                    <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
                <span className="progress-text">{progress}%</span>
            </div>
        </div>
    );
}

