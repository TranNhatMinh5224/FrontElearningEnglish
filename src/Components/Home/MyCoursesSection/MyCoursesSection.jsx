import React from "react";
import CourseCard from "../CourseCard/CourseCard";
import "./MyCoursesSection.css";

export default function MyCoursesSection({ courses = [] }) {
    // Mock data nếu không có courses
    const displayCourses = courses.length > 0
        ? courses
        : [1, 2, 3, 4].map(() => ({
            title: "IELTS 6.5",
            imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            progress: 40,
        }));

    return (
        <section className="my-courses-section">
            <h2>Khoá học của tôi</h2>
            <div className="course-grid">
                {displayCourses.map((course, index) => (
                    <CourseCard key={course.id || index} course={course} />
                ))}
            </div>
        </section>
    );
}

