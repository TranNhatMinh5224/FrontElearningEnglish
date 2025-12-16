import React from "react";
import "./PublicCourseCard.css";

export default function PublicCourseCard({ course, onStart }) {
    const {
        title = "IELTS 6.5",
        imageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    } = course || {};

    return (
        <div className="public-course-card">
            <img src={imageUrl} alt={title} />
            <div className="course-info">
                <h3>{title}</h3>
                <button className="start-btn" onClick={() => onStart?.(course)}>
                    Bắt đầu học
                </button>
            </div>
        </div>
    );
}

