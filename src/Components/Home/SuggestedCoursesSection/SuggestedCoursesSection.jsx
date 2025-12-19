import React, { useState, useEffect } from "react";
import SuggestedCourseCard from "../SuggestedCourseCard/SuggestedCourseCard";
import { courseService } from "../../../Services/courseService";
import { enrollmentService } from "../../../Services/enrollmentService";
import { mochiKhoaHoc as mochiKhoaHocImage } from "../../../Assets";
import { useAuth } from "../../../Context/AuthContext";
import "./SuggestedCoursesSection.css";

export default function SuggestedCoursesSection({ courses = [] }) {
    const [systemCourses, setSystemCourses] = useState([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isGuest } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch system courses
                const response = await courseService.getSystemCourses();
                
                if (response.data?.success && response.data?.data) {
                    // Lấy tất cả khóa học hệ thống, không lọc isFeatured
                    const mappedCourses = response.data.data.map((course) => ({
                        id: course.courseId,
                        courseId: course.courseId,
                        title: course.title,
                        imageUrl: course.imageUrl && course.imageUrl.trim() !== "" 
                            ? course.imageUrl 
                            : mochiKhoaHocImage,
                        price: course.price || 0,
                    }));
                    setSystemCourses(mappedCourses);

                    // Fetch enrolled courses if user is authenticated
                    if (!isGuest) {
                        try {
                            const enrolledResponse = await enrollmentService.getMyCourses();
                            const enrolledData = enrolledResponse.data?.data || [];
                            const enrolledIds = new Set(
                                enrolledData.map((course) => course.courseId)
                            );
                            setEnrolledCourseIds(enrolledIds);
                        } catch (enrollError) {
                            console.error("Error fetching enrolled courses:", enrollError);
                            // Continue without enrollment data
                        }
                    }
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
            <h2>Khóa học hệ thống</h2>
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
                            isEnrolled={enrolledCourseIds.has(course.courseId || course.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="no-courses-message">Chưa có khóa học nào</div>
            )}
        </div>
    );
}

