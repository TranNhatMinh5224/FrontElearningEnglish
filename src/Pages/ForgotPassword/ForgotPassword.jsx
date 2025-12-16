import React, { useState } from "react";
import "./ForgotPassword.css";
import { authService } from "../../Services/authService";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
  setError("");
  setSuccess("");

  if (!email.trim()) {
    setError("Vui lòng nhập email.");
    return;
  }

  setLoading(true);
  try {
    const res = await authService.forgotPassword({ email });

    
    if (res.data && res.data.success === true) {
      setSuccess("OTP đã được gửi đến email của bạn!");

      setTimeout(() => {
        navigate("/reset-otp", { state: { email } });
      }, 800);
    } else {
      
      setError(res.data?.message || "Email không hợp lệ.");
    }
  } catch (err) {

    const msg = err.response?.data?.message || "Email không hợp lệ.";
    setError(msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <div className="forgot-icon">🔒</div>

        <h2 className="forgot-title">Quên mật khẩu?</h2>
        <p className="forgot-desc">
          Nhập email để nhận mã OTP đặt lại mật khẩu.
        </p>

        <label className="forgot-label">Email</label>
        <input
          type="email"
          className="forgot-input"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        {error && <p className="forgot-error">{error}</p>}
        {success && <p className="forgot-success">{success}</p>}

        <button className="forgot-btn" onClick={handleSendOTP} disabled={loading}>
          {loading ? "Đang gửi..." : "Gửi mã OTP"}
        </button>

        <p className="forgot-back" onClick={() => navigate("/login")}>
          Quay lại Đăng nhập
        </p>
      </div>
    </div>
  );
}
