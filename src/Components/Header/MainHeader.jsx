// src/Components/Header/MainHeader.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import "./Header.css";
import { mochiWelcome as logo, iconHome, iconCourse, iconOntap, iconSotay } from "../../Assets";
import ProfileDropdown from "./ProfileDropdown";
import NotificationDropdown from "./NotificationDropdown/NotificationDropdown";
import StreakDropdown from "./StreakDropdown/StreakDropdown";
import { useAuth } from "../../Context/AuthContext";
import { ROUTE_PATHS } from "../../Routes/Paths";
import LoginRequiredModal from "../Common/LoginRequiredModal/LoginRequiredModal";

export default function MainHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Kiểm tra đăng nhập trước khi navigate
  const handleNavigation = (path, requiresAuth = false) => {
    if (requiresAuth && !isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    navigate(path);
  };


  return (
    <Navbar className="main-header" fixed="top" expand="lg">
      <Container fluid className="px-4">
        {/* LEFT: logo + brand */}
        <Navbar.Brand
          className="main-header__left"
          onClick={() => navigate(ROUTE_PATHS.HOME)}
          style={{ cursor: "pointer" }}
        >
          <img src={logo} alt="Catalunya English - Logo" className="main-header__logo" />
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
              <img src={iconHome} alt="Trang chủ" className="nav-icon" />
              <span className="nav-text">Trang chủ</span>
            </Nav.Item>

            <Nav.Item
              onClick={() => handleNavigation(ROUTE_PATHS.MY_COURSES, true)}
              className={`nav-item ${isActive("/my-courses") ? "active" : ""}`}
            >
              <img src={iconCourse} alt="Khóa học của tôi" className="nav-icon" />
              <span className="nav-text">Khóa học của tôi</span>
            </Nav.Item>

            <Nav.Item
              onClick={() => handleNavigation(ROUTE_PATHS.VOCABULARY_REVIEW, true)}
              className={`nav-item ${isActive("/vocabulary-review") ? "active" : ""}`}
            >
              <img src={iconOntap} alt="Ôn tập từ vựng" className="nav-icon" />
              <span className="nav-text">Ôn tập từ vựng</span>
            </Nav.Item>

            <Nav.Item
              onClick={() => handleNavigation(ROUTE_PATHS.VOCABULARY_NOTEBOOK, true)}
              className={`nav-item ${isActive("/vocabulary-notebook") ? "active" : ""}`}
            >
              <img src={iconSotay} alt="Sổ tay từ vựng" className="nav-icon" />
              <span className="nav-text">Sổ tay từ vựng</span>
            </Nav.Item>
          </Nav>

          {/* RIGHT: streak + notification + profile */}
          <div className="main-header__right d-flex align-items-center gap-3">
            <StreakDropdown />
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </Navbar.Collapse>
      </Container>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </Navbar>
  );
}
