import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyCourses.css";
import MainHeader from "../../Components/Header/MainHeader";
import JoinClassModal from "../../Components/Common/JoinClassModal/JoinClassModal";
import RegisteredCourseCard from "../../Components/Courses/RegisteredCourseCard/RegisteredCourseCard";
import PublicCourseCard from "../../Components/Courses/PublicCourseCard/PublicCourseCard";
import { FaSearch, FaPlus } from "react-icons/fa";
import { enrollmentService } from "../../Services/enrollmentService";

export default function MyCourses() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [registeredCourses, setRegisteredCourses] = useState([]);
    const [publicCourses, setPublicCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    // Mock data - sau này sẽ thay thế bằng API call
    React.useEffect(() => {
        // TODO: Gọi API để lấy registered courses và public courses
        // const fetchCourses = async () => {
        //   try {
        //     const registeredRes = await enrollmentService.getMyCourses();
        //     const publicRes = await courseService.getSystemCourses();
        //     setRegisteredCourses(registeredRes.data.data);
        //     setPublicCourses(publicRes.data.data);
        //   } catch (error) {
        //     console.error("Error fetching courses:", error);
        //   }
        // };
        // fetchCourses();
    }, []);

    const handleJoinClass = async (classCode) => {
        try {
            setLoading(true);
            // TODO: Gọi API để join class
            // await enrollmentService.joinByClassCode({ classCode });
            console.log("Joining class with code:", classCode);
            setIsModalOpen(false);
            // Refresh courses list
        } catch (error) {
            console.error("Error joining class:", error);
            alert("Không thể tham gia lớp học. Vui lòng kiểm tra lại mã lớp.");
        } finally {
            setLoading(false);
        }
    };

    const handleContinueCourse = (course) => {
        // Navigate to course detail or learning page
        navigate(`/course/${course.id}`);
    };

    const handleStartCourse = (course) => {
        // Navigate to course detail or enroll
        navigate(`/course/${course.id}`);
    };

    // Mock data
    const mockRegisteredCourses = [
        { id: 1, title: "IELTS 6.5", progress: 40 },
        { id: 2, title: "IELTS 6.5", progress: 40 },
        { id: 3, title: "IELTS 6.5", progress: 40 },
        { id: 4, title: "IELTS 6.5", progress: 40 },
    ];

    const mockPublicCourses = [
        { id: 5, title: "IELTS 6.5" },
        { id: 6, title: "IELTS 6.5" },
        { id: 7, title: "IELTS 6.5" },
        { id: 8, title: "IELTS 6.5" },
    ];

    const displayRegisteredCourses = registeredCourses.length > 0 ? registeredCourses : mockRegisteredCourses;
    const displayPublicCourses = publicCourses.length > 0 ? publicCourses : mockPublicCourses;

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
                    <h2>Khoá học đã đăng ký.</h2>
                    <div className="courses-grid">
                        {displayRegisteredCourses.map((course) => (
                            <RegisteredCourseCard
                                key={course.id}
                                course={course}
                                onContinue={handleContinueCourse}
                            />
                        ))}
                    </div>
                </section>

                {/* Public Courses */}
                <section className="courses-section">
                    <h2>Khoá học công khai</h2>
                    <div className="courses-grid">
                        {displayPublicCourses.map((course) => (
                            <PublicCourseCard
                                key={course.id}
                                course={course}
                                onStart={handleStartCourse}
                            />
                        ))}
                    </div>
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

