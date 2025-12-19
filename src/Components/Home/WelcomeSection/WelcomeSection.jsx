import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { courseService } from "../../../Services/courseService";
import { mochiKhoaHoc as mochiKhoaHocImage } from "../../../Assets";
import "./WelcomeSection.css";

export default function WelcomeSection({ displayName }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchTimeoutRef = useRef(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // If search query is empty, clear results
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        // Debounce search - wait 300ms after user stops typing
        setIsSearching(true);
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await courseService.searchCourses(searchQuery.trim());
                const courses = response.data?.data || [];
                
                const mappedCourses = courses.map((course) => ({
                    id: course.courseId,
                    courseId: course.courseId,
                    title: course.title,
                    imageUrl: course.imageUrl && course.imageUrl.trim() !== "" 
                        ? course.imageUrl 
                        : mochiKhoaHocImage,
                }));
                
                setSearchResults(mappedCourses);
                setShowDropdown(mappedCourses.length > 0);
            } catch (error) {
                console.error("Error searching courses:", error);
                setSearchResults([]);
                setShowDropdown(false);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleCourseClick = (courseId) => {
        setShowDropdown(false);
        setSearchQuery("");
        navigate(`/course/${courseId}`);
    };

    return (
        <section className="welcome-section">
            <div className="welcome-section__left">
                <h1>Chào mừng trở lại, {displayName}</h1>
                <p>Hãy tiếp tục hành trình học tiếng Anh nào.</p>
            </div>
            <div className="welcome-section__right" ref={dropdownRef}>
                <div className="welcome-search-box">
                    <FaSearch className="welcome-search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm khóa học..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => {
                            if (searchResults.length > 0) {
                                setShowDropdown(true);
                            }
                        }}
                    />
                </div>
                {showDropdown && (
                    <div className="welcome-search-dropdown">
                        {isSearching ? (
                            <div className="welcome-search-loading">Đang tìm kiếm...</div>
                        ) : searchResults.length > 0 ? (
                            <div className="welcome-search-results">
                                {searchResults.map((course) => (
                                    <div
                                        key={course.id}
                                        className="welcome-search-result-item"
                                        onClick={() => handleCourseClick(course.courseId || course.id)}
                                    >
                                        <img
                                            src={course.imageUrl}
                                            alt={course.title}
                                            className="welcome-search-result-image"
                                        />
                                        <span className="welcome-search-result-title">{course.title}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="welcome-search-no-results">Không tìm thấy khóa học nào</div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

