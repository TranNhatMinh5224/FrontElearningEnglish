// src/Components/Header/MainHeader.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
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
    <Navbar className="main-header" fixed="top" expand="lg">
      <Container fluid className="px-4">
        {/* LEFT: logo + brand */}
        <Navbar.Brand
          className="main-header__left"
          onClick={() => navigate("/my-courses")}
          style={{ cursor: "pointer" }}
        >
          <img src={logo} alt="logo" className="main-header__logo" />
          <span className="main-header__brand">Catalunya English</span>
        </Navbar.Brand>

        {/* Toggle for mobile */}
        <Navbar.Toggle aria-controls="main-navbar" className="border-0" />

        <Navbar.Collapse id="main-navbar">
          {/* CENTER: navigation */}
          <Nav className="main-header__nav mx-auto">
            <Nav.Item
              onClick={() => navigate("/home")}
              className={`nav-item ${isActive("/home") ? "active" : ""}`}
            >
              <img src={iconHome} alt="Home" className="nav-icon" />
              <span className="nav-text">Trang chủ</span>
            </Nav.Item>

            <Nav.Item
              onClick={() => navigate("/my-courses")}
              className={`nav-item ${isActive("/my-courses") ? "active" : ""}`}
            >
              <img src={iconCourse} alt="Courses" className="nav-icon" />
              <span className="nav-text">Khóa học của tôi</span>
            </Nav.Item>

            <Nav.Item
              onClick={() => navigate("/vocabulary-review")}
              className={`nav-item ${isActive("/vocabulary-review") ? "active" : ""}`}
            >
              <img src={iconOntap} alt="Review" className="nav-icon" />
              <span className="nav-text">Ôn tập từ vựng</span>
            </Nav.Item>

            <Nav.Item
              onClick={() => navigate("/vocabulary-notebook")}
              className={`nav-item ${isActive("/vocabulary-notebook") ? "active" : ""}`}
            >
              <img src={iconSotay} alt="Notebook" className="nav-icon" />
              <span className="nav-text">Sổ tay từ vựng</span>
            </Nav.Item>
          </Nav>

          {/* RIGHT: streak + notification + profile */}
          <div className="main-header__right d-flex align-items-center gap-3">
            <div className="streak-badge">
              <img src={iconFireStreak} alt="Streak" className="streak-icon" />
              <span>{streakDays || 0} ngày</span>
            </div>
            <button className="notification-button" onClick={() => navigate("/notifications")}>
              <img src={iconBell} alt="Notifications" className="notification-icon" />
            </button>
            <ProfileDropdown />
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
