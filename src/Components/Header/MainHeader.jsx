// src/Components/Header/MainHeader.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "../../Assets/Logo/mochi-welcome.jpg";
import ProfileDropdown from "./ProfileDropdown";
import { streakService } from "../../Services/streakService";

import {
  FaHome,
  FaBook,
  FaListAlt,
  FaStickyNote,
} from "react-icons/fa";

export default function MainHeader() {
  const [streakDays, setStreakDays] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const response = await streakService.getMyStreak();
        const streakData = response.data.data;
        setStreakDays(streakData?.currentStreak || 0);
      } catch (error) {
        console.error("Error fetching streak:", error);
        setStreakDays(0);
      }
    };

    fetchStreak();
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="main-header">
      {/* LEFT: logo + brand */}
      <div className="main-header__left">
        <img src={logo} alt="logo" className="main-header__logo" />
        <span className="main-header__brand">Catalunya English</span>
      </div>

      {/* CENTER: navigation */}
      <nav className="main-header__nav">
        <div
          onClick={() => navigate("/home")}
          className={`nav-item ${isActive("/home") ? "active" : ""}`}
        >
          <FaHome />
          <span>Trang chủ</span>
        </div>

        <div
          onClick={() => navigate("/my-courses")}
          className={`nav-item ${isActive("/my-courses") ? "active" : ""}`}
        >
          <FaBook />
          <span>Khóa học của tôi</span>
        </div>

        <Link
          to="#"
          className="nav-item"
        >
          <FaListAlt />
          <span>Ôn tập từ vựng</span>
        </Link>

        <Link
          to="#"
          className="nav-item"
        >
          <FaStickyNote />
          <span>Sổ tay từ vựng</span>
        </Link>
      </nav>

      {/* RIGHT: streak + profile */}
      <div className="main-header__right">
        <div className="streak-badge">🔥 {streakDays} ngày</div>
        <ProfileDropdown />
      </div>
    </header>
  );
}
