import React from "react";
import { useNavigate } from "react-router-dom";
import "./SuggestedCourseCard.css";

export default function SuggestedCourseCard({ course, isEnrolled = false }) {
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
        <div className="suggested-course-card" onClick={handleClick}>
            <div className="course-image-wrapper">
                <img 
                    src={imageUrl || "https://via.placeholder.com/300x200"} 
                    alt={title}
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
                    {isEnrolled ? "Đã đăng ký" : "Bắt đầu ngay"}
                </button>
            </div>
        </div>
    );
}

