import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Navbar } from "react-bootstrap";
import "./WelcomeHeader.css";
import LogoHeader from "./LogoHeader";

export default function WelcomeHeader() {
  const navigate = useNavigate();

  return (
    <Navbar className="welcome-header" fixed="top" expand="lg">
      <Container fluid className="px-4">
        {/* LEFT: Logo */}
        <div className="welcome-header__left">
          <LogoHeader />
        </div>

        {/* RIGHT: Login and Register buttons */}
        <div className="welcome-header__right d-flex align-items-center gap-3">
          <button 
            className="welcome-header__btn welcome-header__btn--login"
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </button>
          <button 
            className="welcome-header__btn welcome-header__btn--register"
            onClick={() => navigate("/register")}
          >
            Đăng ký
          </button>
        </div>
      </Container>
    </Navbar>
  );
}

