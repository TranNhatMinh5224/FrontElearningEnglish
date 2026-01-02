// src/Components/Header/TeacherHeader.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import "./Header.css";
import { mochiWelcome as logo, iconHome, iconCourse } from "../../Assets";
import ProfileDropdown from "./ProfileDropdown";
import { useAuth } from "../../Context/AuthContext";
import { ROUTE_PATHS } from "../../Routes/Paths";
import LoginRequiredModal from "../Common/LoginRequiredModal/LoginRequiredModal";
import { FaUserCog, FaChalkboardTeacher } from "react-icons/fa";

export default function TeacherHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isActive = (path) => {
    // If path is /teacher, consider it as course-management
    if (location.pathname === "/teacher") {
      return path === "/teacher/course-management";
    }
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
          onClick={() => navigate("/teacher/course-management")}
          style={{ cursor: "pointer" }}
        >
          <img src={logo} alt="Catalunya English - Logo Giáo Viên" className="main-header__logo" />
          <span className="main-header__brand">Catalunya English</span>
        </Navbar.Brand>

        {/* Toggle for mobile */}
        <Navbar.Toggle aria-controls="teacher-navbar" className="border-0" />

        <Navbar.Collapse id="teacher-navbar">
          {/* CENTER: navigation */}
          <Nav className="main-header__nav teacher-nav" style={{ marginLeft: "auto", marginRight: "auto", transform: "translateX(-150px)" }}>
            <Nav.Item
              onClick={() => handleNavigation("/teacher/course-management", true)}
              className={`nav-item ${isActive("/teacher/course-management") ? "active" : ""}`}
            >
              <FaChalkboardTeacher className="nav-icon" style={{ width: "18px", height: "18px" }} />
              <span className="nav-text">Quản lí khoá học</span>
            </Nav.Item>

            <Nav.Item
              onClick={() => handleNavigation("/teacher/submission-management", true)}
              className={`nav-item ${isActive("/teacher/submission-management") ? "active" : ""}`}
            >
              <FaUserCog className="nav-icon" style={{ width: "18px", height: "18px" }} />
              <span className="nav-text">Quản lí bài nộp</span>
            </Nav.Item>
          </Nav>

          {/* RIGHT: profile */}
          <div className="main-header__right d-flex align-items-center gap-3">
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

