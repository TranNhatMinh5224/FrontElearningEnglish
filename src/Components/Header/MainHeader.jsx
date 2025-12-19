// src/Components/Header/MainHeader.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import { mochiWelcome as logo, iconHome, iconCourse, iconOntap, iconSotay, iconBell, iconStreakFire as iconFireStreak } from "../../Assets";
import ProfileDropdown from "./ProfileDropdown";
import { useStreak } from "../../Context/StreakContext";

export default function MainHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { streakDays } = useStreak();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="main-header">
      {/* LEFT: logo + brand */}
      <div className="main-header__left" onClick={() => navigate("/my-courses")} style={{ cursor: "pointer" }}>
        <img src={logo} alt="logo" className="main-header__logo" />
        <span className="main-header__brand">Catalunya English</span>
      </div>

      {/* CENTER: navigation */}
      <nav className="main-header__nav">
        <div
          onClick={() => navigate("/home")}
          className={`nav-item ${isActive("/home") ? "active" : ""}`}
        >
          <img src={iconHome} alt="Home" className="nav-icon" />
          <span>Trang chủ</span>
        </div>

        <div
          onClick={() => navigate("/my-courses")}
          className={`nav-item ${isActive("/my-courses") ? "active" : ""}`}
        >
          <img src={iconCourse} alt="Courses" className="nav-icon" />
          <span>Khóa học của tôi</span>
        </div>

        <div
          onClick={() => navigate("/vocabulary-review")}
          className={`nav-item ${isActive("/vocabulary-review") ? "active" : ""}`}
        >
          <img src={iconOntap} alt="Review" className="nav-icon" />
          <span>Ôn tập từ vựng</span>
        </div>

        <div
          onClick={() => navigate("#")}
          className="nav-item"
        >
          <img src={iconSotay} alt="Notebook" className="nav-icon" />
          <span>Sổ tay từ vựng</span>
        </div>
      </nav>

      {/* RIGHT: streak + notification + profile */}
      <div className="main-header__right">
        <div className="streak-badge">
          <img src={iconFireStreak} alt="Streak" className="streak-icon" />
          <span>{streakDays || 0} ngày</span>
        </div>
        <button className="notification-button" onClick={() => navigate("/notifications")}>
          <img src={iconBell} alt="Notifications" className="notification-icon" />
        </button>
        <ProfileDropdown />
      </div>
    </header>
  );
}
