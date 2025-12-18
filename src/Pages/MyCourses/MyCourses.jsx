import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MyCourses.css";
import MainHeader from "../../Components/Header/MainHeader";
import JoinClassModal from "../../Components/Common/JoinClassModal/JoinClassModal";
import RegisteredCourseCard from "../../Components/Courses/RegisteredCourseCard/RegisteredCourseCard";
import PublicCourseCard from "../../Components/Courses/PublicCourseCard/PublicCourseCard";
import { FaSearch, FaPlus } from "react-icons/fa";
import { enrollmentService } from "../../Services/enrollmentService";
import { courseService } from "../../Services/courseService";
import mochiKhoaHocImage from "../../Assets/Logo/mochi-khoahoc.jpg";

export default function MyCourses() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [registeredCourses, setRegisteredCourses] = useState([]);
    const [publicCourses, setPublicCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                setError("");

                // 1. Lấy danh sách khóa học đã đăng ký
                const registeredRes = await enrollmentService.getMyCourses();
                const registeredData = registeredRes.data?.data || [];
                
                const mappedRegisteredCourses = registeredData.map((course) => ({
                    id: course.courseId,
                    title: course.title,
                    imageUrl: course.imageUrl && course.imageUrl.trim() !== "" 
                        ? course.imageUrl 
                        : mochiKhoaHocImage,
                    progress: Math.round(course.progressPercentage || 0),
                }));

                // 2. Lấy danh sách khóa học hệ thống và lọc chỉ lấy isFeatured = true
                const publicRes = await courseService.getSystemCourses();
                const publicData = publicRes.data?.data || [];
                
                const featuredCourses = publicData.filter(
                    (course) => course.isFeatured === true
                );
                
                const mappedPublicCourses = featuredCourses.map((course) => ({
                    id: course.courseId,
                    title: course.title,
                    imageUrl: course.imageUrl && course.imageUrl.trim() !== "" 
                        ? course.imageUrl 
                        : mochiKhoaHocImage,
                }));

                setRegisteredCourses(mappedRegisteredCourses);
                setPublicCourses(mappedPublicCourses);
            } catch (err) {
                console.error("Error fetching courses:", err);
                setError("Không thể tải danh sách khóa học");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleJoinClass = async (classCode) => {
        try {
            await enrollmentService.joinByClassCode({ classCode });
            setIsModalOpen(false);
            // Refresh courses list
            const registeredRes = await enrollmentService.getMyCourses();
            const registeredData = registeredRes.data?.data || [];
            const mappedRegisteredCourses = registeredData.map((course) => ({
                id: course.courseId,
                title: course.title,
                imageUrl: course.imageUrl && course.imageUrl.trim() !== "" 
                    ? course.imageUrl 
                    : mochiKhoaHocImage,
                progress: Math.round(course.progressPercentage || 0),
            }));
            setRegisteredCourses(mappedRegisteredCourses);
        } catch (error) {
            console.error("Error joining class:", error);
            alert("Không thể tham gia lớp học. Vui lòng kiểm tra lại mã lớp.");
        }
    };

    const handleContinueCourse = (course) => {
        navigate(`/course/${course.id}`);
    };

    const handleStartCourse = (course) => {
        navigate(`/course/${course.id}`);
    };

    return (
        <>
            <MainHeader />
            <div className="my-courses-container">
                <div className="my-courses-header">
                    <h1>Khoá học của tôi</h1>
                    <div className="header-actions">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm khoá học..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            className="join-class-btn"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <FaPlus />
                            Nhập mã lớp học
                        </button>
                    </div>
                </div>

                {/* Registered Courses */}
                <section className="courses-section">
                    <h2>Khoá học đã đăng ký</h2>
                    {loading ? (
                        <div className="loading-message">Đang tải khóa học...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : registeredCourses.length > 0 ? (
                        <div className="course-grid-wrapper">
                            <div className="course-grid">
                                {registeredCourses.map((course) => (
                                    <RegisteredCourseCard
                                        key={course.id}
                                        course={course}
                                        onContinue={handleContinueCourse}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="no-courses-message">Chưa có khóa học đã đăng ký</div>
                    )}
                </section>

                {/* Public Courses */}
                <section className="courses-section">
                    <h2>Khoá học công khai</h2>
                    {loading ? (
                        <div className="loading-message">Đang tải khóa học...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : publicCourses.length > 0 ? (
                        <div className="course-grid-wrapper">
                            <div className="course-grid">
                                {publicCourses.map((course) => (
                                    <PublicCourseCard
                                        key={course.id}
                                        course={course}
                                        onStart={handleStartCourse}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="no-courses-message">Chưa có khóa học công khai</div>
                    )}
                </section>
            </div>

            <JoinClassModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onJoin={handleJoinClass}
            />
        </>
    );
}

