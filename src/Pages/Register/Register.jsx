import React, { useState } from "react";
import "./Register.css";
import Header from "../../Components/Header/LogoHeader";
import { useNavigate } from "react-router-dom";
import { authService } from "../../Services/authService";
import { InputField, DatePicker } from "../../Components/Auth";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    dateOfBirth: null,
    gender: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
  });

  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    if (!email) {
      return "Vui lòng nhập email";
    }
    const trimmed = email.trim();
    const lower = trimmed.toLowerCase();
      // Allow common TLDs (longer variants first)
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.(?:com\.vn|org\.vn|edu\.vn|co\.uk|com|net|org|info|io|co|gov|edu|vn)$/i;
      if (!emailRegex.test(lower)) {
        return "Email không hợp lệ. Chấp nhận .com, .net, .org, .io, .vn, .com.vn, .co.uk...";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Vui lòng nhập mật khẩu";
    }
    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (password.length > 20) {
      return "Mật khẩu không được vượt quá 20 ký tự";
    }
    if (!/[A-Z]/.test(password)) {
      return "Mật khẩu phải có ít nhất một chữ hoa";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return "Mật khẩu phải có ít nhất một ký tự đặc biệt";
    }
    return "";
  };

  const validatePhoneNumber = (phone) => {
    if (!phone) {
      return "Vui lòng nhập số điện thoại";
    }
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      if (phone.length < 10) {
        return "Số điện thoại phải có đúng 10 chữ số";
      } else if (phone.length > 10) {
        return "Số điện thoại không được vượt quá 10 chữ số";
      } else if (!phone.startsWith("0")) {
        return "Số điện thoại phải bắt đầu bằng số 0";
      } else {
        return "Số điện thoại không hợp lệ";
      }
    }
    return "";
  };

  const validateDateOfBirth = (date) => {
    if (!date) {
      return "Vui lòng chọn ngày sinh";
    }
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 5) {
      return "Ứng dụng dành cho trẻ từ 5 tuổi trở lên";
    }
    return "";
  };

  // Handle input changes with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setGeneralError("");

    // Real-time validation
    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(value),
      }));
    } else if (name === "password") {
      const passwordError = validatePassword(value);
      setErrors((prev) => ({
        ...prev,
        password: passwordError,
        confirmPassword: formData.confirmPassword && value !== formData.confirmPassword
          ? "Mật khẩu không khớp"
          : prev.confirmPassword,
      }));
    } else if (name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value !== formData.password ? "Mật khẩu không khớp" : "",
      }));
    } else if (name === "phoneNumber") {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: validatePhoneNumber(value),
      }));
    }
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      dateOfBirth: date,
    }));

    setGeneralError("");
    setErrors((prev) => ({
      ...prev,
      dateOfBirth: validateDateOfBirth(date),
    }));
  };

  // Handle gender change
  const handleGenderChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      gender: value,
    }));

    setGeneralError("");
    setErrors((prev) => ({
      ...prev,
      gender: value ? "" : "Vui lòng chọn giới tính",
    }));
  };

  // Handle form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setGeneralError("");

    // Validate all fields
    const validationErrors = {
      firstName: !formData.firstName ? "Vui lòng nhập tên" : formData.firstName.length > 20 ? "Tên không được vượt quá 20 ký tự" : "",
      lastName: !formData.lastName ? "Vui lòng nhập họ" : formData.lastName.length > 20 ? "Họ không được vượt quá 20 ký tự" : "",
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: formData.confirmPassword
        ? (formData.password !== formData.confirmPassword ? "Mật khẩu không khớp" : "")
        : "Vui lòng xác nhận mật khẩu",
      phoneNumber: validatePhoneNumber(formData.phoneNumber),
      dateOfBirth: validateDateOfBirth(formData.dateOfBirth),
      gender: formData.gender ? "" : "Vui lòng chọn giới tính",
    };

    setErrors(validationErrors);

    // Check if there are any errors
    if (Object.values(validationErrors).some((error) => error)) {
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        isMale: formData.gender === "male",
      });

      // Lưu thông tin đăng ký vào sessionStorage để có thể gửi lại OTP
      const registerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        isMale: formData.gender === "male",
      };
      sessionStorage.setItem("pendingRegisterData", JSON.stringify(registerData));

      // Navigate to OTP page
      navigate("/otp", {
        state: { email: formData.email },
      });
    } catch (err) {
      setGeneralError(
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Header />

      <div className="auth-card">
        <h1 className="auth-title">Tạo tài khoản của bạn</h1>

        {/* General error message */}
        {generalError && (
          <div className="auth-error-message">{generalError}</div>
        )}

        <form onSubmit={handleRegister}>
          {/* Name Row */}
          <div className="form-row">
            <InputField
              type="text"
              name="firstName"
              placeholder="Họ"
              value={formData.firstName}
              onChange={handleInputChange}
              error={errors.firstName}
              disabled={loading}
              maxLength={20}
            />
            <InputField
              type="text"
              name="lastName"
              placeholder="Tên"
              value={formData.lastName}
              onChange={handleInputChange}
              error={errors.lastName}
              disabled={loading}
              maxLength={20}
            />
          </div>

          {/* Email */}
          <InputField
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            disabled={loading}
            required
            pattern="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(com\.vn|org\.vn|edu\.vn|co\.uk|com|net|org|info|io|co|gov|edu|vn)$"
            title="Email phải có đuôi hợp lệ (ví dụ: .com, .net, .org, .io, .vn, .com.vn)"
          />

          {/* Password */}
          <InputField
            type="password"
            name="password"
            placeholder="Tạo mật khẩu"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            disabled={loading}
            showPasswordToggle={true}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
          <p className="password-note">
            * chú ý mật khẩu tối thiểu 6 ký tự bao gồm chữ hoa & ký tự đặc biệt!
          </p>

          {/* Confirm Password */}
          <InputField
            type="password"
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            disabled={loading}
            showPasswordToggle={true}
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          {/* Phone Number */}
          <InputField
            type="tel"
            name="phoneNumber"
            placeholder="Số điện thoại"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            error={errors.phoneNumber}
            disabled={loading}
          />

          {/* Date of Birth */}
          <div className="date-picker-wrapper">
            <DatePicker
              value={formData.dateOfBirth}
              onChange={handleDateChange}
              disabled={loading}
              hasError={!!errors.dateOfBirth}
            />
            {errors.dateOfBirth && (
              <span className="input-field-error">{errors.dateOfBirth}</span>
            )}
          </div>

          {/* Gender Radio Buttons */}
          <div className="gender-radio-wrapper">
            <div className="gender-radio-label">Giới tính</div>
            <div className="gender-radio-group">
              <label className="gender-radio-option">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleGenderChange}
                  disabled={loading}
                />
                <span className="radio-label">Nữ</span>
              </label>
              <label className="gender-radio-option">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleGenderChange}
                  disabled={loading}
                />
                <span className="radio-label">Nam</span>
              </label>
            </div>
            {errors.gender && (
              <span className="input-field-error">{errors.gender}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            className="auth-btn primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          Đã có tài khoản?{" "}
          <span className="auth-link" onClick={() => navigate("/login")}>
            Đăng nhập ngay
          </span>
        </p>
      </div>
    </div>
  );
}
