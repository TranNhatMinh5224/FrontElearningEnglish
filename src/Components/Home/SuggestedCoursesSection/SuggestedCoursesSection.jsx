import React, { useState, useEffect } from "react";
import SuggestedCourseCard from "../SuggestedCourseCard/SuggestedCourseCard";
import { courseService } from "../../../Services/courseService";
import mochiKhoaHocImage from "../../../Assets/Logo/mochi-khoahoc.jpg";
import "./SuggestedCoursesSection.css";

export default function SuggestedCoursesSection({ courses = [] }) {
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
                    // Lấy tất cả khóa học hệ thống, không lọc isFeatured
                    const mappedCourses = response.data.data.map((course) => ({
                        id: course.courseId,
                        title: course.title,
                        skill: "Hệ thống",
                        imageUrl: course.imageUrl && course.imageUrl.trim() !== "" 
                            ? course.imageUrl 
                            : mochiKhoaHocImage,
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
        <div className="suggested-courses-section">
            <h2>Khóa học hệ thống</h2>
            {loading ? (
                <div className="loading-message">Đang tải khóa học...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : displayCourses.length > 0 ? (
                <div className="suggested-courses-list">
                    {displayCourses.map((course, index) => (
                        <SuggestedCourseCard key={course.id || index} course={course} />
                    ))}
                </div>
            ) : (
                <div className="no-courses-message">Chưa có khóa học nào</div>
            )}
        </div>
    );
}

