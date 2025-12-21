import React from "react";
import "./CourseSummaryCard.css";
import { FaBook, FaTag, FaUsers } from "react-icons/fa";
import ProgressBar from "../../CourseLearn/ProgressBar/ProgressBar";

export default function CourseSummaryCard({ course, onEnroll, onStartLearning }) {
    // Format price display
    const getPriceDisplay = () => {
        if (course.price === null || course.price === undefined) {
            return null; // Don't show price section
        }
        if (course.price === 0) {
            return "Free";
        }
        // Format price with Vietnamese currency format
        return `${course.price.toLocaleString("vi-VN")}đ`;
    };

    const priceDisplay = getPriceDisplay();

    return (
        <div className="course-summary-card">
            {course.isEnrolled && (
                <div className="course-progress-section">
                    <ProgressBar
                        completed={course.completedLessons || 0}
                        total={course.totalLessons || 0}
                        percentage={course.progressPercentage || 0}
                    />
                </div>
            )}
            
            <div className="course-summary-stats">
                <div className="course-stat-item">
                    <FaBook className="stat-icon" />
                    <div className="stat-content">
                        <span className="stat-label">Số lượng bài giảng</span>
                        <span className="stat-value">{course.totalLessons || 0} bài giảng</span>
                    </div>
                </div>

                {course.enrollmentCount !== undefined && (
                    <div className="course-stat-item">
                        <FaUsers className="stat-icon" />
                        <div className="stat-content">
                            <span className="stat-label">Số học viên</span>
                            <span className="stat-value">{course.enrollmentCount || 0} học viên</span>
                        </div>
                    </div>
                )}

                {priceDisplay !== null && (
                    <div className="course-stat-item">
                        <FaTag className="stat-icon" />
                        <div className="stat-content">
                            <span className="stat-label">Giá khóa học</span>
                            <span className="stat-value">{priceDisplay}</span>
                        </div>
                    </div>
                )}
            </div>

            {course.isEnrolled ? (
                <div className="course-enrolled-actions">
                    <button className="course-enrolled-btn">
                        Đã đăng kí
                    </button>
                    <button 
                        className="course-start-btn"
                        onClick={onStartLearning}
                    >
                        Vào học ngay
                    </button>
                </div>
            ) : (
                <button 
                    className="course-enroll-btn"
                    onClick={onEnroll}
                >
                    Đăng kí ngay
                </button>
            )}
        </div>
    );
}

