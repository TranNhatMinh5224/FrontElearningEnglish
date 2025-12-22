import React, { useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CourseCard from "../CourseCard/CourseCard";
import { courseService } from "../../../Services/courseService";
import { mochiKhoaHoc as mochiKhoaHocImage } from "../../../Assets";
import "./MyCoursesSection.css";

export default function MyCoursesSection({ courses = [] }) {
    const [systemCourses, setSystemCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const scrollContainerRef = useRef(null);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(true);

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
                        courseId: course.courseId,
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

    // Check scroll position and update button visibility
    const checkScrollPosition = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        const canScroll = scrollWidth > clientWidth; // Kiểm tra xem có thể scroll không
        
        if (!canScroll) {
            // Nếu không thể scroll (tất cả items đều hiển thị), ẩn cả 2 nút
            setShowLeftButton(false);
            setShowRightButton(false);
            return;
        }

        const isAtStart = scrollLeft <= 0;
        const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1; // -1 để tránh lỗi làm tròn

        setShowLeftButton(!isAtStart);
        setShowRightButton(!isAtEnd);
    };

    // Scroll handlers - scroll 2 cards mỗi lần
    const handleScrollLeft = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const cards = container.querySelectorAll('.course-card');
        if (cards.length === 0) return;

        // Lấy chiều rộng của 1 card và gap
        const firstCard = cards[0];
        const cardWidth = firstCard.offsetWidth;
        const gap = 28; // gap giữa các cards (theo CSS)
        
        // Tính scroll distance cho 2 cards (2 * cardWidth + 2 * gap - 1 gap vì chỉ có 1 gap giữa 2 cards)
        const scrollDistance = (cardWidth * 2) + gap;

        // Scroll về trước 2 cards
        const newScrollLeft = Math.max(0, container.scrollLeft - scrollDistance);
        container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    };

    const handleScrollRight = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const cards = container.querySelectorAll('.course-card');
        if (cards.length === 0) return;

        // Lấy chiều rộng của 1 card và gap
        const firstCard = cards[0];
        const cardWidth = firstCard.offsetWidth;
        const gap = 28; // gap giữa các cards (theo CSS)
        
        // Tính scroll distance cho 2 cards (2 * cardWidth + gap)
        const scrollDistance = (cardWidth * 2) + gap;

        // Scroll về sau 2 cards
        const maxScroll = container.scrollWidth - container.clientWidth;
        const newScrollLeft = Math.min(maxScroll, container.scrollLeft + scrollDistance);
        container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    };

    // Check scroll position on mount and when courses change
    useEffect(() => {
        // Delay check to ensure DOM is updated
        const timer = setTimeout(() => {
            checkScrollPosition();
        }, 100);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [systemCourses.length, courses.length]);

    // Check scroll position on window resize
    useEffect(() => {
        const handleResize = () => {
            checkScrollPosition();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Use systemCourses from API, fallback to prop courses, then empty array
    const displayCourses = systemCourses.length > 0 
        ? systemCourses 
        : courses.length > 0 
        ? courses 
        : [];

    return (
        <section className="my-courses-section">
            <h2>Kho tàng khóa học nổi bật</h2>
            {loading ? (
                <div className="loading-message">Đang tải khóa học...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : displayCourses.length > 0 ? (
                <div className="course-grid-wrapper">
                    {showLeftButton && (
                        <button 
                            className="scroll-button scroll-button-left"
                            onClick={handleScrollLeft}
                            aria-label="Scroll left"
                        >
                            <FaChevronLeft />
                        </button>
                    )}
                    <div 
                        className="course-grid"
                        ref={scrollContainerRef}
                        onScroll={checkScrollPosition}
                    >
                        {displayCourses.map((course, index) => (
                            <CourseCard key={course.id || index} course={course} />
                        ))}
                    </div>
                    {showRightButton && (
                        <button 
                            className="scroll-button scroll-button-right"
                            onClick={handleScrollRight}
                            aria-label="Scroll right"
                        >
                            <FaChevronRight />
                        </button>
                    )}
                </div>
            ) : (
                <div className="no-courses-message">Chưa có khóa học nào</div>
            )}
        </section>
    );
}

