import React from "react";
import "./CourseLearnHeader.css";

export default function CourseLearnHeader({ courseTitle }) {
    return (
        <div className="course-learn-header">
            <h1>{courseTitle}</h1>
        </div>
    );
}

