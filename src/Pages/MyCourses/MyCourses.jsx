import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination } from "react-bootstrap";
import "./MyCourses.css";
import MainHeader from "../../Components/Header/MainHeader";
import JoinClassModal from "../../Components/Common/JoinClassModal/JoinClassModal";
import NotificationModal from "../../Components/Common/NotificationModal/NotificationModal";
import SuggestedCourseCard from "../../Components/Home/SuggestedCourseCard/SuggestedCourseCard";
import AccountUpgradeSection from "../../Components/Home/AccountUpgradeSection/AccountUpgradeSection";
import { FaPlus } from "react-icons/fa";
import { enrollmentService } from "../../Services/enrollmentService";
import { courseService } from "../../Services/courseService";
import { useAuth } from "../../Context/AuthContext";
import { mochiKhoaHoc as mochiKhoaHocImage } from "../../Assets";
import LoginRequiredModal from "../../Components/Common/LoginRequiredModal/LoginRequiredModal";

export default function MyCourses() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    
    // Enrolled courses state với pagination
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(20); // Hiển thị 20 courses mỗi trang (4 columns x 5 rows)
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    
    const [notification, setNotification] = useState({
        isOpen: false,
        type: "info", // "success", "error", "info"
        message: ""
    });

    // Fetch enrolled courses với pagination
    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            try {
                setLoading(true);
                setError("");

                // Lấy danh sách khóa học đã đăng ký với phân trang
                const registeredRes = await enrollmentService.getMyCourses(currentPage, pageSize);
                
                // Handle both camelCase and PascalCase responses
                const isSuccess = registeredRes.data?.Success !== false && registeredRes.data?.success !== false;
                const data = registeredRes.data?.data ?? registeredRes.data?.Data;
                
                if (isSuccess && data) {
                    // Handle paginated response
                    if (data.items || data.Items) {
                        const items = data.items || data.Items || [];
                        const total = data.totalCount || data.TotalCount || 0;
                        const pages = data.totalPages || data.TotalPages || 1;
                        
                        const mappedCourses = items.map((course) => ({
                            id: course.courseId || course.CourseId,
                            courseId: course.courseId || course.CourseId,
                            title: course.title || course.Title,
                            imageUrl: (course.imageUrl || course.ImageUrl) && (course.imageUrl || course.ImageUrl).trim() !== ""
                                ? (course.imageUrl || course.ImageUrl)
                                : mochiKhoaHocImage,
                            price: course.price || course.Price || 0,
                        }));
                        
                        setEnrolledCourses(mappedCourses);
                        setTotalCount(total);
                        setTotalPages(pages);
                    } else {
                        // Fallback: assume it's a direct array (backward compatibility)
                        const registeredData = Array.isArray(data) ? data : [];
                        const mappedCourses = registeredData.map((course) => ({
                            id: course.courseId || course.CourseId,
                            courseId: course.courseId || course.CourseId,
                            title: course.title || course.Title,
                            imageUrl: (course.imageUrl || course.ImageUrl) && (course.imageUrl || course.ImageUrl).trim() !== ""
                                ? (course.imageUrl || course.ImageUrl)
                                : mochiKhoaHocImage,
                            price: course.price || course.Price || 0,
                        }));
                        
                        setEnrolledCourses(mappedCourses);
                        setTotalCount(mappedCourses.length);
                        setTotalPages(1);
                    }
                } else {
                    setError(
                        registeredRes.data?.Message || registeredRes.data?.message || "Không thể tải danh sách khóa học"
                    );
                }
            } catch (err) {
                console.error("Error fetching enrolled courses:", err);
                setError("Không thể tải danh sách khóa học");
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchEnrolledCourses();
        } else {
            setEnrolledCourses([]);
            setLoading(false);
        }
    }, [currentPage, pageSize, isAuthenticated]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleJoinClass = async (classCode) => {
        try {
            const response = await enrollmentService.joinByClassCode({ classCode });

            // Function to find course by classCode and navigate
            const findAndNavigateToCourse = async () => {
                try {
                    // Search all system courses to find one with matching classCode
                    const systemCoursesResponse = await courseService.getSystemCourses();
                    if (systemCoursesResponse.data?.success && systemCoursesResponse.data?.data) {
                        const allSystemCourses = systemCoursesResponse.data.data;
                        const foundCourse = allSystemCourses.find(c => c.classCode === classCode);
                        if (foundCourse) {
                            // Navigate to course detail
                            navigate(`/course/${foundCourse.courseId}`);
                            return true;
                        }
                    }
                    return false;
                } catch (err) {
                    console.error("Error finding course:", err);
                    return false;
                }
            };

            if (response.data?.success) {
                // Join thành công
                setIsModalOpen(false);
                setNotification({
                    isOpen: true,
                    type: "success",
                    message: "Đã join khóa học thành công!"
                });

                // Find and navigate to course
                const found = await findAndNavigateToCourse();
                if (!found) {
                    // Fallback: get my courses and navigate to latest
                    try {
                        const myCoursesResponse = await enrollmentService.getMyCourses();
                        if (myCoursesResponse.data?.success && myCoursesResponse.data?.data?.length > 0) {
                            const myCourses = myCoursesResponse.data.data;
                            const latestCourse = myCourses[myCourses.length - 1];
                            navigate(`/course/${latestCourse.courseId}`);
                        }
                    } catch (err) {
                        console.error("Error getting my courses:", err);
                    }
                }

                // Refresh courses list - reset to page 1
                setCurrentPage(1);
            } else {
                // Join thất bại - kiểm tra xem có phải "đã đăng ký rồi" không
                const errorMessage = response.data?.message || "";
                const isAlreadyEnrolled = errorMessage.includes("đã đăng ký") || errorMessage.includes("đã tham gia");

                if (isAlreadyEnrolled) {
                    // Nếu đã đăng ký rồi, vẫn tìm course và navigate
                    setIsModalOpen(false);
                    setNotification({
                        isOpen: true,
                        type: "info",
                        message: "Bạn đã tham gia khóa học này rồi!"
                    });

                    const found = await findAndNavigateToCourse();
                    if (!found) {
                        setNotification({
                            isOpen: true,
                            type: "error",
                            message: "Không tìm thấy khóa học. Vui lòng thử lại."
                        });
                    }
                } else {
                    // Các lỗi khác
                    setNotification({
                        isOpen: true,
                        type: "error",
                        message: errorMessage || "Không thể tham gia lớp học. Vui lòng kiểm tra lại mã lớp."
                    });
                }
            }
        } catch (error) {
            console.error("Error joining class:", error);
            const errorMessage = error.response?.data?.message || "Không thể tham gia lớp học. Vui lòng kiểm tra lại mã lớp.";

            // Kiểm tra xem có phải "đã đăng ký rồi" không
            const isAlreadyEnrolled = errorMessage.includes("đã đăng ký") || errorMessage.includes("đã tham gia");

            if (isAlreadyEnrolled) {
                setIsModalOpen(false);
                setNotification({
                    isOpen: true,
                    type: "info",
                    message: "Bạn đã tham gia khóa học này rồi!"
                });

                // Vẫn tìm course và navigate
                try {
                    const systemCoursesResponse = await courseService.getSystemCourses();
                    if (systemCoursesResponse.data?.success && systemCoursesResponse.data?.data) {
                        const allSystemCourses = systemCoursesResponse.data.data;
                        const foundCourse = allSystemCourses.find(c => c.classCode === classCode);
                        if (foundCourse) {
                            navigate(`/course/${foundCourse.courseId}`);
                        }
                    }
                } catch (err) {
                    console.error("Error finding course:", err);
                }
            } else {
                setNotification({
                    isOpen: true,
                    type: "error",
                    message: errorMessage
                });
            }
        }
    };


    // Account upgrade handlers
    const handlePackageHover = (teacherPackageId) => {
        setSelectedPackage(teacherPackageId);
    };

    const handlePackageLeave = () => {
        setSelectedPackage(null);
    };

    const handleUpgradeClick = (e, teacherPackageId, packageType) => {
        e.stopPropagation();

        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        // Kiểm tra nếu user đã là giáo viên
        const teacherSubscription = user?.teacherSubscription || user?.TeacherSubscription;
        const isTeacher = teacherSubscription?.isTeacher || teacherSubscription?.IsTeacher;
        
        if (isTeacher === true) {
            setNotification({
                isOpen: true,
                type: "info",
                message: "Gói giáo viên hiện tại của bạn đang hoạt động, vui lòng chờ đến khi hết hạn để kích hoạt gói giáo viên mới!"
            });
            return;
        }

        navigate(`/payment?packageId=${teacherPackageId}&package=${packageType}`);
    };

    return (
        <>
            <MainHeader />
            <div className="my-courses-container">
                <div className="my-courses-header">
                    <div className="my-courses-welcome-section">
                        <h1>
                            Chào mừng {user?.fullName || "bạn"}!
                        </h1>
                        <p className="welcome-message">
                            Hãy bắt đầu hành trình học tập của bạn ngay hôm nay!
                        </p>
                    </div>
                    <div className="header-actions">
                        <button
                            className="join-class-btn"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <FaPlus />
                            Nhập mã lớp học
                        </button>
                    </div>
                </div>

                {/* Main Content: 2 columns layout */}
                <div className="my-courses-main-content">
                    {/* Left: Enrolled Courses Section */}
                    <div className="suggested-courses-section">
                        {loading ? (
                            <div className="loading-message">Đang tải khóa học...</div>
                        ) : error ? (
                            <div className="error-message">{error}</div>
                        ) : enrolledCourses.length > 0 ? (
                            <>
                                <div className="suggested-courses-grid">
                                    {enrolledCourses.map((course, index) => (
                                        <SuggestedCourseCard
                                            key={course.id || index}
                                            course={course}
                                            isEnrolled={true} // Tất cả đều đã đăng ký
                                            showEnrolledBadge={true} // Hiển thị badge "Đã tham gia"
                                        />
                                    ))}
                                </div>
                                
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="pagination-wrapper">
                                        <div className="pagination-info">
                                            Trang {currentPage} / {totalPages} ({totalCount} khóa học)
                                        </div>
                                        <Pagination className="custom-pagination">
                                            <Pagination.First 
                                                onClick={() => handlePageChange(1)}
                                                disabled={currentPage === 1}
                                            />
                                            <Pagination.Prev 
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            />
                                            
                                            {[...Array(totalPages)].map((_, index) => {
                                                const pageNumber = index + 1;
                                                // Chỉ hiển thị một số trang xung quanh trang hiện tại
                                                if (
                                                    pageNumber === 1 ||
                                                    pageNumber === totalPages ||
                                                    (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                                                ) {
                                                    return (
                                                        <Pagination.Item
                                                            key={pageNumber}
                                                            active={pageNumber === currentPage}
                                                            onClick={() => handlePageChange(pageNumber)}
                                                        >
                                                            {pageNumber}
                                                        </Pagination.Item>
                                                    );
                                                } else if (
                                                    pageNumber === currentPage - 3 ||
                                                    pageNumber === currentPage + 3
                                                ) {
                                                    return <Pagination.Ellipsis key={pageNumber} />;
                                                }
                                                return null;
                                            })}
                                            
                                            <Pagination.Next 
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            />
                                            <Pagination.Last 
                                                onClick={() => handlePageChange(totalPages)}
                                                disabled={currentPage === totalPages}
                                            />
                                        </Pagination>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="no-courses-message">Chưa có khóa học đã đăng ký</div>
                        )}
                    </div>

                    {/* Right: Account Upgrade Section */}
                    <AccountUpgradeSection
                        selectedPackage={selectedPackage}
                        onPackageHover={handlePackageHover}
                        onPackageLeave={handlePackageLeave}
                        onUpgradeClick={handleUpgradeClick}
                    />
                </div>
            </div>

            <JoinClassModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onJoin={handleJoinClass}
            />

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification({ ...notification, isOpen: false })}
                type={notification.type}
                message={notification.message}
                autoClose={true}
                autoCloseDelay={3000}
            />

            <LoginRequiredModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />
        </>
    );
}

