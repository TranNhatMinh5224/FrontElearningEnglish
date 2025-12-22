import React, { useState, useEffect } from "react";
import SuggestedCourseCard from "../SuggestedCourseCard/SuggestedCourseCard";
import { courseService } from "../../../Services/courseService";
import { mochiKhoaHoc as mochiKhoaHocImage } from "../../../Assets";
import { useAuth } from "../../../Context/AuthContext";
import "./SuggestedCoursesSection.css";

export default function SuggestedCoursesSection({ courses = [] }) {
    const [systemCourses, setSystemCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isGuest } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch system courses (API đã trả về IsEnrolled trong response)
                const response = await courseService.getSystemCourses();
                
                if (response.data?.success && response.data?.data) {
                    // Lấy tất cả khóa học hệ thống, không lọc isFeatured
                    // API đã trả về IsEnrolled, sử dụng trực tiếp
                    const mappedCourses = response.data.data.map((course) => ({
                        id: course.courseId,
                        courseId: course.courseId,
                        title: course.title,
                        imageUrl: course.imageUrl && course.imageUrl.trim() !== "" 
                            ? course.imageUrl 
                            : mochiKhoaHocImage,
                        price: course.price || 0,
                        isEnrolled: course.isEnrolled || course.IsEnrolled || false, // Lấy từ API response
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

        fetchData();
    }, [isGuest]);

    // Use systemCourses from API, fallback to prop courses, then empty array
    const displayCourses = systemCourses.length > 0 
        ? systemCourses 
        : courses.length > 0 
        ? courses 
        : [];

    return (
        <div className="suggested-courses-section">
            <h2>Catalunya English - Hệ Thống Khóa học Số 1 Việt Nam </h2>
            {loading ? (
                <div className="loading-message">Đang tải khóa học...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : displayCourses.length > 0 ? (
                <div className="suggested-courses-grid">
                    {displayCourses.map((course, index) => (
                        <SuggestedCourseCard
                            key={course.id || index}
                            course={course}
                            isEnrolled={course.isEnrolled || false} // Sử dụng IsEnrolled từ API
                            showEnrolledBadge={true} // Hiển thị badge ở trang chủ
                        />
                    ))}
                </div>
            ) : (
                <div className="no-courses-message">Chưa có khóa học nào</div>
            )}
        </div>
    );
}

