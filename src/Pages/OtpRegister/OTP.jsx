import React, { useState, useEffect } from "react";
import OtpVerifier from "../../Components/Common/OtpVerifier/OtpVerifier";
import { authService } from "../../Services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import SuccessModal from "../../Components/Common/SuccessModal/SuccessModal";

export default function OTP() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successOnCloseNavigate, setSuccessOnCloseNavigate] = useState(false);

  const verifyFn = async (code) => {
    try {
      const res = await authService.verifyEmail({ email, otpCode: code });
      if (res.data?.success) {
        // on success remove pending register data
        sessionStorage.removeItem("pendingRegisterData");
        setSuccessMessage("Tài khoản của bạn đã được xác thực. Bạn sẽ được chuyển tới trang đăng nhập.");
        setSuccessOnCloseNavigate(true);
        setShowSuccessModal(true);
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  const resendFn = async () => {
    // resend by re-calling register with pendingRegisterData
    const storedData = sessionStorage.getItem("pendingRegisterData");
    if (!storedData) return { success: false, message: "Không tìm thấy thông tin đăng ký." };
    try {
      const registerData = JSON.parse(storedData);
      const res = await authService.register(registerData);
      if (res.data?.success || res.status === 200) {
        setSuccessMessage("Mã OTP mới đã được gửi đến email của bạn!");
        setShowSuccessModal(true);
        setSuccessOnCloseNavigate(false);
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể gửi lại mã OTP. Vui lòng thử lại.";
      // if message indicates bad data, clear storage and navigate back
      if (msg.includes("tồn tại") || msg.includes("không hợp lệ")) {
        sessionStorage.removeItem("pendingRegisterData");
        setTimeout(() => navigate("/register"), 1200);
      }
      return { success: false, message: msg };
    }
  };

  return (
    <>
      <OtpVerifier
        email={email}
        title="Xác minh OTP"
        description={`Mã xác minh đã được gửi đến email ${email}`}
        verifyFn={verifyFn}
        resendFn={resendFn}
        initialSeconds={120}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          if (successOnCloseNavigate) navigate("/login");
        }}
        title="Chúc mừng"
        message={successMessage || "Thao tác thành công."}
        autoClose={true}
        autoCloseDelay={1500}
      />
    </>
  );
}
