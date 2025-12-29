import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import "./CourseDetail.css";
import MainHeader from "../../Components/Header/MainHeader";
import CourseBanner from "../../Components/Courses/CourseBanner/CourseBanner";
import CourseInfo from "../../Components/Courses/CourseInfo/CourseInfo";
import CourseSummaryCard from "../../Components/Courses/CourseSummaryCard/CourseSummaryCard";
import EnrollmentModal from "../../Components/Common/EnrollmentModal/EnrollmentModal";
import NotificationModal from "../../Components/Common/NotificationModal/NotificationModal";
import { courseService } from "../../Services/courseService";
import { enrollmentService } from "../../Services/enrollmentService";
import { paymentService } from "../../Services/paymentService";
import { useAuth } from "../../Context/AuthContext";
import { useNotificationRefresh } from "../../Context/NotificationContext";
import { ROUTE_PATHS } from "../../Routes/Paths";
import LoginRequiredModal from "../../Components/Common/LoginRequiredModal/LoginRequiredModal";
import SEO from "../../Components/SEO/SEO";

export default function CourseDetail() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { refreshNotifications } = useNotificationRefresh();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState({ isOpen: false, type: "success", message: "" });

    useEffect(() => {
        const fetchCourseDetail = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await courseService.getCourseById(courseId);

                if (response.data?.success && response.data?.data) {
                    setCourse(response.data.data);
                } else {
                    setError("Không tìm thấy khóa học");
                }
            } catch (err) {
                console.error("Error fetching course detail:", err);
                setError("Không thể tải thông tin khóa học");
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourseDetail();
        }
    }, [courseId]);

    const handleEnroll = () => {
        // Kiểm tra đăng nhập trước khi mở modal đăng ký
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }
        setShowEnrollmentModal(true);
    };

    const handleStartNow = async () => {
        setIsProcessing(true);
        try {
            // For free courses, call payment process API which will auto-complete and enroll
            const paymentResponse = await paymentService.processPayment({
                ProductId: parseInt(courseId),
                typeproduct: 1 // ProductType.Course = 1
            });

            if (paymentResponse.data?.success) {
                // Refresh course data to update enrollment status
                const response = await courseService.getCourseById(courseId);
                if (response.data?.success && response.data?.data) {
                    setCourse(response.data.data);
                }

                // Refresh notifications để hiển thị thông báo mới ngay lập tức
                refreshNotifications();

                setShowEnrollmentModal(false);
                setNotification({
                    isOpen: true,
                    type: "success",
                    message: "Đăng ký khóa học thành công!"
                });
            } else {
                const errorMsg = paymentResponse.data?.message || "Không thể đăng ký khóa học. Vui lòng thử lại.";
                setNotification({
                    isOpen: true,
                    type: "error",
                    message: errorMsg
                });
            }
        } catch (err) {
            console.error("Error enrolling:", err);
            const errorMsg = err.response?.data?.message || "Không thể đăng ký khóa học. Vui lòng thử lại.";
            setNotification({
                isOpen: true,
                type: "error",
                message: errorMsg
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePayment = () => {
        // Close modal and navigate to payment page with course information
        setShowEnrollmentModal(false);
        navigate(`${ROUTE_PATHS.PAYMENT}?courseId=${courseId}&typeproduct=1`);
    };

    const handleStartLearning = () => {
        // Navigate to course learning page
        navigate(`/course/${courseId}/learn`);
    };

    if (loading) {
        return (
            <>
                <MainHeader />
                <div className="course-detail-container">
                    <div className="loading-message">Đang tải thông tin khóa học...</div>
                </div>
            </>
        );
    }

    if (error || !course) {
        return (
            <>
                <MainHeader />
                <div className="course-detail-container">
                    <div className="error-message">{error || "Không tìm thấy khóa học"}</div>
                </div>
            </>
        );
    }

    const courseTitle = course?.title || course?.Title || "Khóa học";
    const courseDescription = course?.description || course?.descriptionMarkdown || "Khóa học tiếng Anh chất lượng tại Catalunya English";
    const courseImage = course?.imageUrl || "/logo512.png";

    return (
        <>
            <SEO
                title={`${courseTitle} - Catalunya English`}
                description={courseDescription}
                keywords={`${courseTitle}, học tiếng anh, khóa học tiếng anh online, Catalunya English`}
                image={courseImage}
                url={typeof window !== "undefined" ? `${window.location.origin}/course/${courseId}` : ""}
            />
            <MainHeader />
            <div className="course-detail-container">
                <Container fluid>
                    <Row>
                        <Col>
                            <div className="course-breadcrumb">
                                <span onClick={() => navigate("/my-courses")} className="breadcrumb-link">
                                    Khoá học của tôi
                                </span>
                                <span className="breadcrumb-separator">/</span>
                                <span className="breadcrumb-current">{course.title}</span>
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <CourseBanner
                                title={course.title}
                                imageUrl={course.imageUrl}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={8}>
                            <CourseInfo course={course} />
                        </Col>
                        <Col lg={4}>
                            <CourseSummaryCard
                                course={course}
                                onEnroll={handleEnroll}
                                onStartLearning={handleStartLearning}
                            />
                        </Col>
                    </Row>
                </Container>
            </div>

            <EnrollmentModal
                isOpen={showEnrollmentModal}
                onClose={() => !isProcessing && setShowEnrollmentModal(false)}
                course={course}
                onStartNow={handleStartNow}
                onPayment={handlePayment}
                isProcessing={isProcessing}
            />

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification({ isOpen: false, type: "success", message: "" })}
                type={notification.type}
                message={notification.message}
            />

            <LoginRequiredModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />
        </>
    );
}

