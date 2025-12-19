import React from "react";
import "./ProgressBar.css";

export default function ProgressBar({ completed, total, percentage }) {
    return (
        <div className="course-progress-bar">
            <div className="progress-header">
                <span className="progress-label">Tiến độ khóa học</span>
                <span className="progress-percentage">{percentage}%</span>
            </div>
            <div className="progress-track">
                <div 
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="progress-stats">
                <span>{completed}/{total} bài học đã hoàn thành</span>
            </div>
        </div>
    );
}

