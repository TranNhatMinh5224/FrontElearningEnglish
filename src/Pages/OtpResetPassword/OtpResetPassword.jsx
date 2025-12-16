import React, { useState, useRef, useEffect } from "react";
import "./OtpResetPassword.css";
import { authService } from "../../Services/authService";
import { useNavigate, useLocation } from "react-router-dom";

export default function OtpResetPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  useEffect(() => {
    if (!email) navigate("/forgot-password");
  }, [email, navigate]);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (e, index) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      setTimeout(() => inputRefs.current[index + 1]?.focus(), 10);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length < 6) {
      setErrorMessage("Vui lòng nhập đầy đủ mã OTP.");
      return;
    }

    try {
      // 🔥 API verify OTP cho QUÊN MẬT KHẨU
      const res = await authService.verifyResetOtp({
        email,
        otpCode: code,
      });

      if (res.data?.success) {
        navigate("/reset-password", { state: { email, otpCode: code } });
      } else {
        const errorMsg = res.data?.message || "Mã OTP không hợp lệ.";
        setErrorMessage(errorMsg);
        
        // Xóa hết OTP để nhập lại
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);

        // Kiểm tra hết lần thử → quay về forgot-password
        if (errorMsg.includes("quá") || errorMsg.includes("5 lần")) {
          setTimeout(() => {
            alert("Bạn đã nhập sai quá 5 lần. Vui lòng yêu cầu mã OTP mới.");
            navigate("/forgot-password");
          }, 1500);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Mã OTP không hợp lệ.";
      setErrorMessage(msg);
      
      // Xóa hết OTP để nhập lại
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);

      // Kiểm tra hết lần thử → quay về forgot-password
      if (msg.includes("quá") || msg.includes("5 lần")) {
        setTimeout(() => {
          alert("Bạn đã nhập sai quá 5 lần. Vui lòng yêu cầu mã OTP mới.");
          navigate("/forgot-password");
        }, 1500);
      }
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-box">
        <h2>Xác minh OTP</h2>
        <p className="otp-desc">
          Mã OTP đặt lại mật khẩu đã được gửi đến email <strong>{email}</strong>
        </p>

        <div className="otp-input-group">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              value={digit}
              className="otp-input"
              maxLength={1}
              type="text"
              inputMode="numeric"
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              autoComplete="off"
            />
          ))}
        </div>

        {errorMessage && <p className="otp-error">{errorMessage}</p>}

        <button className="otp-btn" onClick={handleVerify}>
          Xác minh
        </button>
      </div>
    </div>
  );
}
