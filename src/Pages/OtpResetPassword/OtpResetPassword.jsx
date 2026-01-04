import React, { useState, useEffect } from "react";
import OtpVerifier from "../../Components/Common/OtpVerifier/OtpVerifier";
import { authService } from "../../Services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import SuccessModal from "../../Components/Common/SuccessModal/SuccessModal";

export default function OtpResetPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  useEffect(() => {
    if (!email) navigate("/forgot-password");
  }, [email, navigate]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const verifyFn = async (code) => {
    try {
      const res = await authService.verifyResetOtp({ email, otpCode: code });
      if (res.data?.success) {
        // navigate to reset-password with state
        navigate("/reset-password", { state: { email, otpCode: code } });
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  const resendFn = async () => {
    if (!email) return { success: false, message: "Email không hợp lệ." };
    try {
      const res = await authService.forgotPassword({ email: email.trim() });
      if (res.data && res.data.success === true) {
        setSuccessMessage("Mã OTP mới đã được gửi đến email của bạn!");
        setShowSuccessModal(true);
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  return (
    <>
      <OtpVerifier
        email={email}
        title="Xác minh OTP"
        description={`Mã OTP đặt lại mật khẩu đã được gửi đến email ${email}`}
        verifyFn={verifyFn}
        resendFn={resendFn}
        initialSeconds={120}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Thành công"
        message={successMessage}
      />
    </>
  );
}
