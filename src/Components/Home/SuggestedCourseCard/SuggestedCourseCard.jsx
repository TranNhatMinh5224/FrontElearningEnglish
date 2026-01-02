import React from "react";
import { useNavigate } from "react-router-dom";
import "./SuggestedCourseCard.css";

export default function SuggestedCourseCard({ course, isEnrolled = false, showEnrolledBadge = true }) {
    const navigate = useNavigate();
    const {
        id,
        courseId,
        title = "Khóa học",
        imageUrl,
        price = 0,
    } = course || {};

    const handleClick = () => {
        const finalCourseId = courseId || id;
        if (finalCourseId) {
            navigate(`/course/${finalCourseId}`);
        }
    };

    const formatPrice = (price) => {
        if (!price || price === 0) {
            return "Miễn phí";
        }
        return `${price.toLocaleString("vi-VN")}đ`;
    };

    return (
        <div className={`suggested-course-card ${isEnrolled ? 'enrolled-course' : ''}`} onClick={handleClick}>
            {isEnrolled && showEnrolledBadge && (
                <div className="enrolled-badge">
                    <span className="checkmark-icon">✓</span>
                    <span className="enrolled-text">Đã tham gia</span>
                </div>
            )}
            <div className="course-image-wrapper">
                <img 
                    src={imageUrl || "https://via.placeholder.com/300x200"} 
                    alt={`Ảnh khóa học ${title}`}
                    className="course-image"
                />
            </div>
            <div className="course-content">
                <h4 className="course-title">{title}</h4>
                <div className="course-price">{formatPrice(price)}</div>
                <button 
                    className={`course-action-btn ${isEnrolled ? 'enrolled' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClick();
                    }}
                >
                    {isEnrolled ? "Vào học ngay" : "Đăng ký ngay"}
                </button>
            </div>
        </div>
    );
}

