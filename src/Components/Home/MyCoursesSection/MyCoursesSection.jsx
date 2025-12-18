import React, { useState, useEffect } from "react";
import CourseCard from "../CourseCard/CourseCard";
import { courseService } from "../../../Services/courseService";
import mochiKhoaHocImage from "../../../Assets/Logo/mochi-khoahoc.jpg";
import "./MyCoursesSection.css";

export default function MyCoursesSection({ courses = [] }) {
    const [systemCourses, setSystemCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSystemCourses = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await courseService.getSystemCourses();
                
                if (response.data?.success && response.data?.data) {
                    // Lọc chỉ lấy những khóa học có isFeatured = true
                    const featuredCourses = response.data.data.filter(
                        (course) => course.isFeatured === true
                    );
                    
                    // Map API response to CourseCard format
                    const mappedCourses = featuredCourses.map((course) => ({
                        id: course.courseId,
                        title: course.title,
                        imageUrl: course.imageUrl && course.imageUrl.trim() !== "" 
                            ? course.imageUrl 
                            : mochiKhoaHocImage,
                        progress: 0, // System courses don't have progress initially
                    }));
                    setSystemCourses(mappedCourses);
                } else {
                    setSystemCourses([]);
                }
            } catch (err) {
                console.error("Error fetching system courses:", err);
                setError("Không thể tải danh sách khóa học");
                setSystemCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSystemCourses();
    }, []);

    // Use systemCourses from API, fallback to prop courses, then empty array
    const displayCourses = systemCourses.length > 0 
        ? systemCourses 
        : courses.length > 0 
        ? courses 
        : [];

    return (
        <section className="my-courses-section">
            <h2>Khóa học nổi bật</h2>
            {loading ? (
                <div className="loading-message">Đang tải khóa học...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : displayCourses.length > 0 ? (
                <div className="course-grid-wrapper">
                    <div className="course-grid">
                        {displayCourses.map((course, index) => (
                            <CourseCard key={course.id || index} course={course} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="no-courses-message">Chưa có khóa học nào</div>
            )}
        </section>
    );
}

