import React, { useState, useRef, useEffect } from "react";
import "./OtpVerifier.css";

/**
 * Props:
 * - email: string
 * - title: string (optional)
 * - description: string (optional)
 * - initialSeconds: number (default 120)
 * - verifyFn: async (code) => { success: boolean, message?: string, data?: any }
 * - resendFn: async () => { success: boolean, message?: string }
 * - onVerifySuccess: (res) => void
 */
export default function OtpVerifier({
  email,
  title = "Xác minh OTP",
  description,
  initialSeconds = 120,
  verifyFn,
  resendFn,
  onVerifySuccess,
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const timerRef = useRef(null);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // start timer on mount
    startTimer(initialSeconds);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTimer = (seconds) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRemainingSeconds(seconds);
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setErrorMessage("Mã OTP đã hết hạn. Vui lòng gửi lại mã OTP.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, "");
    if (numericValue === "") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }
    const digit = numericValue.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    const fullCode = newOtp.join("");
    if (fullCode.length === 6) setErrorMessage("");
    if (digit && index < 5) setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 6) {
      setOtp(pastedData.split(""));
      inputRefs.current[5]?.focus();
      setErrorMessage("");
    }
  };

  const clearOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    setErrorMessage("");
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setErrorMessage("Vui lòng nhập đầy đủ mã OTP.");
      return;
    }
    if (remainingSeconds === 0) {
      setErrorMessage("Mã OTP đã hết hạn. Vui lòng gửi lại mã OTP.");
      return;
    }
    if (!verifyFn) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await verifyFn(code);
      if (res?.success) {
        if (onVerifySuccess) onVerifySuccess(res);
      } else {
        clearOtp();
        const msg = res?.message || "Mã OTP không đúng hoặc đã hết hạn.";
        const isMaxAttemptsReached = msg.includes("quá") && msg.includes("lần") && (msg.includes("5 lần") || msg.includes("quá 5"));
        if (isMaxAttemptsReached) {
          setMaxAttemptsReached(true);
          setErrorMessage("Bạn đã nhập sai quá 5 lần. Vui lòng yêu cầu mã OTP mới.");
        } else {
          setErrorMessage(msg);
        }
      }
    } catch (err) {
      clearOtp();
      const msg = err?.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn.";
      const isMaxAttemptsReached = msg.includes("quá") && msg.includes("lần") && (msg.includes("5 lần") || msg.includes("quá 5"));
      if (isMaxAttemptsReached) {
        setMaxAttemptsReached(true);
        setErrorMessage("Bạn đã nhập sai quá 5 lần. Vui lòng yêu cầu mã OTP mới.");
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!resendFn) return;
    setLoading(true);
    setErrorMessage("");
    setMaxAttemptsReached(false);
    try {
      const res = await resendFn();
      if (res?.success) {
        clearOtp();
        startTimer(initialSeconds);
      } else {
        setErrorMessage(res?.message || "Không thể gửi lại mã OTP. Vui lòng thử lại.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể gửi lại mã OTP. Vui lòng thử lại.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-box">
        <h2>{title}</h2>
        {description ? (
          <p className="otp-desc">{description}</p>
        ) : (
          <p className="otp-desc">Mã xác minh đã được gửi đến email <strong>{email}</strong></p>
        )}

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

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <span className="otp-timer">Thời gian còn lại: {formatTime(remainingSeconds)}</span>
        </div>

        {errorMessage && (
          <p className={`otp-error ${maxAttemptsReached ? "otp-error-max" : ""}`}>{errorMessage}</p>
        )}

        <button className="otp-btn" onClick={handleVerify} disabled={loading || maxAttemptsReached || remainingSeconds === 0}>
          {loading ? "Đang xác minh..." : "Xác minh"}
        </button>

        <div className="otp-resend">
          <span>Chưa nhận được mã? </span>
          <button className="resend-btn" onClick={handleResend} disabled={loading || maxAttemptsReached || remainingSeconds > 0}>
            {loading ? "Đang gửi..." : "Gửi lại mã OTP"}
          </button>
          {remainingSeconds === 0 && <span className="otp-expired"> &nbsp;Mã đã hết hạn</span>}
        </div>
      </div>
    </div>
  );
}
