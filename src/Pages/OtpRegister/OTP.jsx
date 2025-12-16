import React, { useState, useRef, useEffect } from "react";
import "./OTP.css";
import { authService } from "../../Services/authService";
import { useNavigate, useLocation } from "react-router-dom";

export default function OTP() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;

    // Chỉ cho phép số
    const numericValue = value.replace(/\D/g, "");

    // Nếu không có gì hoặc xóa
    if (numericValue === "") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      // Không xóa error message ngay, để người dùng thấy số lần thử còn lại
      return;
    }

    // Lấy ký tự cuối cùng (trường hợp paste nhiều số)
    const digit = numericValue.slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    
    // Chỉ xóa error message khi người dùng đã nhập đủ 6 số (sẵn sàng verify lại)
    // Không xóa ngay khi bắt đầu nhập để giữ message từ backend
    const fullCode = newOtp.join("");
    if (fullCode.length === 6) {
      // Khi đã nhập đủ 6 số, xóa error để chuẩn bị cho lần verify mới
      setErrorMessage("");
    }

    // Auto focus sang ô tiếp theo
    if (digit && index < 5) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e, index) => {
    // Backspace: nếu ô trống thì quay về ô trước
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Arrow left
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Arrow right
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

    if (pastedData.length === 6) {
      setOtp(pastedData.split(""));
      inputRefs.current[5]?.focus();
      // Xóa error message khi paste đủ 6 số để chuẩn bị verify
      setErrorMessage("");
    }
  };

  const clearOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    setErrorMessage("");
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  };

  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length < 6) {
      setErrorMessage("Vui lòng nhập đầy đủ mã OTP.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await authService.verifyEmail({ email, otpCode: code });

      if (res.data?.success) {
        // Xác thực thành công - xóa thông tin đăng ký trong sessionStorage
        sessionStorage.removeItem("pendingRegisterData");
        alert("Xác thực email thành công! Vui lòng đăng nhập.");
        navigate("/login");
      } else {
        // Xác thực thất bại - Backend sẽ trả về message nếu quá số lần thử
        const errorMsg = res.data?.message || "Mã OTP không đúng hoặc đã hết hạn.";
        clearOtp(); // Xóa các số khi nhập sai

        // Kiểm tra chính xác message về giới hạn số lần thử
        // Backend trả về: "Bạn đã nhập sai OTP quá 5 lần. Vui lòng yêu cầu mã OTP mới"
        // Chỉ bắt khi có từ "quá" và "lần" cùng nhau (không phải "lần thử" trong "Còn X lần thử")
        const isMaxAttemptsReached = errorMsg.includes("quá") && errorMsg.includes("lần") && 
                                     (errorMsg.includes("5 lần") || errorMsg.includes("quá 5"));
        
        if (isMaxAttemptsReached) {
          setMaxAttemptsReached(true);
          setErrorMessage("Bạn đã nhập sai quá 5 lần. Vui lòng đăng ký lại.");
          setTimeout(() => {
            alert("Bạn đã nhập sai quá 5 lần. Vui lòng quay lại trang đăng ký.");
            navigate("/register");
          }, 2000);
        } else {
          setErrorMessage(errorMsg);
        }
      }
    } catch (err) {
      clearOtp(); // Xóa các số khi nhập sai

      const msg = err.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn.";

      // Kiểm tra chính xác message về giới hạn số lần thử
      // Backend trả về: "Bạn đã nhập sai OTP quá 5 lần. Vui lòng yêu cầu mã OTP mới"
      // Chỉ bắt khi có từ "quá" và "lần" cùng nhau (không phải "lần thử" trong "Còn X lần thử")
      const isMaxAttemptsReached = msg.includes("quá") && msg.includes("lần") && 
                                   (msg.includes("5 lần") || msg.includes("quá 5"));
      
      if (isMaxAttemptsReached) {
        setMaxAttemptsReached(true);
        setErrorMessage("Bạn đã nhập sai quá 5 lần. Vui lòng đăng ký lại.");
        setTimeout(() => {
          alert("Bạn đã nhập sai quá 5 lần. Vui lòng quay lại trang đăng ký.");
          navigate("/register");
        }, 2000);
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setErrorMessage("Email không hợp lệ. Vui lòng quay lại trang đăng ký.");
      return;
    }

    // Lấy thông tin đăng ký từ sessionStorage
    const storedData = sessionStorage.getItem("pendingRegisterData");
    if (!storedData) {
      setErrorMessage("Không tìm thấy thông tin đăng ký. Vui lòng quay lại trang đăng ký.");
      setTimeout(() => {
        navigate("/register");
      }, 2000);
      return;
    }

    try {
      const registerData = JSON.parse(storedData);
      setLoading(true);
      setErrorMessage("");
      setMaxAttemptsReached(false); // Reset trạng thái khi gửi lại OTP

      // Gọi lại API register để gửi OTP mới
      // Backend sẽ xóa user cũ chưa verify và tạo OTP mới
      const res = await authService.register(registerData);

      if (res.data?.success || res.status === 200) {
        // Gửi lại OTP thành công
        setErrorMessage("");
        clearOtp();
        alert("Mã OTP mới đã được gửi đến email của bạn!");
      } else {
        setErrorMessage(res.data?.message || "Không thể gửi lại mã OTP. Vui lòng thử lại.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể gửi lại mã OTP. Vui lòng thử lại.";
      setErrorMessage(msg);

      // Nếu lỗi là do thông tin không hợp lệ, xóa sessionStorage và quay về đăng ký
      if (msg.includes("tồn tại") || msg.includes("không hợp lệ")) {
        sessionStorage.removeItem("pendingRegisterData");
        setTimeout(() => {
          navigate("/register");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-box">
        <h2>Xác minh OTP</h2>
        <p className="otp-desc">
          Mã xác minh đã được gửi đến email <strong>{email}</strong>
        </p>

        <div className="otp-input-group">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              value={digit}
              className="otp-input"
              maxLength={1}
              inputMode="numeric"
              type="text"
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              autoComplete="off"
              disabled={loading || maxAttemptsReached}
            />
          ))}
        </div>

        {errorMessage && (
          <p className={`otp-error ${maxAttemptsReached ? "otp-error-max" : ""}`}>
            {errorMessage}
          </p>
        )}

        <button
          className="otp-btn"
          onClick={handleVerify}
          disabled={loading || maxAttemptsReached}
        >
          {loading ? "Đang xác minh..." : "Xác minh"}
        </button>

        <div className="otp-resend">
          <span>Chưa nhận được mã? </span>
          <button
            className="resend-btn"
            onClick={handleResendOtp}
            disabled={maxAttemptsReached}
          >
            Gửi lại mã OTP
          </button>
        </div>
      </div>
    </div>
  );
}
