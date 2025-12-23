import React, { useState } from "react";
import "./ForgotPassword.css";
import { authService } from "../../Services/authService";
import { useNavigate } from "react-router-dom";
import { InputField } from "../../Components/Auth";
import { iconLock } from "../../Assets";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Validate email
  const validateEmail = (emailValue) => {
    if (!emailValue) {
      return "Vui lòng nhập email";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      return "Email không hợp lệ, email phải có định dạng example@example.com";
    }
    return "";
  };

  // Handle input change with validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
    setError("");
    setSuccess("");
  };

  const handleSendOTP = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccess("");

    // Validate email
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword({ email: email.trim() });

      if (res.data && res.data.success === true) {
        setSuccess("OTP đã được gửi đến email của bạn!");
        setEmailError("");

        setTimeout(() => {
          navigate("/reset-otp", { state: { email: email.trim() } });
        }, 800);
      } else {
        setError(res.data?.message || "Không thể gửi mã OTP. Vui lòng thử lại.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Email không tồn tại hoặc không hợp lệ.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-background">
        <div className="forgot-password-shape shape-cyan"></div>
        <div className="forgot-password-shape shape-pink"></div>
      </div>

      <div className="forgot-password-card">
        <div className="forgot-password-icon-wrapper">
          <img src={iconLock} alt="Khóa - Quên mật khẩu" className="forgot-password-icon" />
        </div>

        <h1 className="forgot-password-title">Quên mật khẩu?</h1>

        <p className="forgot-password-description">
          Nhập email bạn đã dùng để đăng ký, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
        </p>

        <form onSubmit={handleSendOTP}>
          <div className="forgot-password-form-group">
            <label className="forgot-password-label">Email</label>
            <InputField
              type="email"
              name="email"
              placeholder="email@example.com"
              value={email}
              onChange={handleEmailChange}
              error={emailError}
              disabled={loading}
            />
          </div>

          {error && <div className="forgot-password-error-message">{error}</div>}
          {success && <div className="forgot-password-success-message">{success}</div>}

          <button
            type="submit"
            className="forgot-password-submit-btn"
            onClick={handleSendOTP}
            disabled={loading || !!emailError}
          >
            {loading ? "Đang gửi..." : "Gửi mã OTP"}
          </button>
        </form>

        <button
          className="forgot-password-back-link"
          onClick={() => navigate("/login")}
          disabled={loading}
        >
          Quay lại Đăng nhập
        </button>
      </div>
    </div>
  );
}
