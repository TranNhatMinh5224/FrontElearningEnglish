import React from "react";
import SuggestedCourseCard from "../SuggestedCourseCard/SuggestedCourseCard";
import "./SuggestedCoursesSection.css";

export default function SuggestedCoursesSection({ courses = [] }) {
    // Mock data nếu không có courses
    const displayCourses = courses.length > 0
        ? courses
        : [1, 2, 3].map(() => ({
            title: "Khoá học: luyện phát âm",
            skill: "Speaking",
            icon: "🎤",
        }));

    return (
        <div className="suggested-courses-section">
            <h2>Khoá học gợi ý</h2>
            {displayCourses.map((course, index) => (
                <SuggestedCourseCard key={course.id || index} course={course} />
            ))}
        </div>
    );
}

