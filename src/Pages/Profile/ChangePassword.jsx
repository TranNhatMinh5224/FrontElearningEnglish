import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ChangePassword.css";
import MainHeader from "../../Components/Header/MainHeader";
import { authService } from "../../Services/authService";
import { FaEye, FaEyeSlash, FaTimes, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";
import SuccessModal from "../../Components/Common/SuccessModal/SuccessModal";

export default function ChangePassword() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [validationErrors, setValidationErrors] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const validatePassword = (password) => {
        const errors = [];

        if (password.length < 8) {
            errors.push("ít nhất 8 ký tự");
        }

        if (!/[A-Z]/.test(password)) {
            errors.push("chữ hoa");
        }

        if (!/[a-z]/.test(password)) {
            errors.push("chữ thường");
        }

        if (!/[0-9]/.test(password)) {
            errors.push("số");
        }

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push("ký tự đặc biệt");
        }

        return errors;
    };

    const validateField = (name, value) => {
        const errors = { ...validationErrors };

        switch (name) {
            case "currentPassword":
                if (!value) {
                    errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
                } else {
                    errors.currentPassword = "";
                }
                break;

            case "newPassword":
                if (!value) {
                    errors.newPassword = "Vui lòng nhập mật khẩu mới";
                } else {
                    const passwordErrors = validatePassword(value);
                    if (passwordErrors.length > 0) {
                        errors.newPassword = `Mật khẩu phải có ${passwordErrors.join(", ")}`;
                    } else {
                        errors.newPassword = "";
                    }

                    // Validate confirm password again if it has value
                    if (formData.confirmPassword) {
                        if (value !== formData.confirmPassword) {
                            errors.confirmPassword = "Mật khẩu không khớp";
                        } else {
                            errors.confirmPassword = "";
                        }
                    }
                }
                break;

            case "confirmPassword":
                if (!value) {
                    errors.confirmPassword = "Vui lòng nhập lại mật khẩu";
                } else if (formData.newPassword && value !== formData.newPassword) {
                    errors.confirmPassword = "Mật khẩu không khớp";
                } else {
                    errors.confirmPassword = "";
                }
                break;

            default:
                break;
        }

        setValidationErrors(errors);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError("");
        validateField(name, value);
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const validateForm = () => {
        // Calculate all errors at once
        const errors = {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        };

        // Validate current password
        if (!formData.currentPassword) {
            errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
        }

        // Validate new password
        if (!formData.newPassword) {
            errors.newPassword = "Vui lòng nhập mật khẩu mới";
        } else {
            const passwordErrors = validatePassword(formData.newPassword);
            if (passwordErrors.length > 0) {
                errors.newPassword = `Mật khẩu phải có ${passwordErrors.join(", ")}`;
            } else {
                // Check if new password is different from current password (only when submit)
                if (formData.currentPassword && formData.newPassword === formData.currentPassword) {
                    errors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
                }
            }
        }

        // Validate confirm password
        if (!formData.confirmPassword) {
            errors.confirmPassword = "Vui lòng nhập lại mật khẩu";
        } else if (formData.newPassword && formData.confirmPassword !== formData.newPassword) {
            errors.confirmPassword = "Mật khẩu không khớp";
        }

        // Update validation errors state
        setValidationErrors(errors);

        // Check if there are any errors
        const hasErrors =
            !!errors.currentPassword ||
            !!errors.newPassword ||
            !!errors.confirmPassword;

        if (hasErrors) {
            setError("Vui lòng kiểm tra lại thông tin đã nhập");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await authService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            setSuccess(true);
            setSuccessMessage("Đổi mật khẩu thành công!");
            setShowSuccessModal(true);
            // Clear form
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            // showSuccessModal will handle navigation on close
        } catch (error) {
            setError(
                error.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/profile");
    };

    return (
        <>
            <MainHeader />
            <div className="change-password-container">
                <div className="change-password-header">
                        {/* Back button removed — streamlined header */}
                    </div>

                <div className="change-password-card">
                    <h1>Thay đổi mật khẩu</h1>

                    {error && (
                        <div className="alert-banner error" role="alert">
                            <div className="alert-left">
                                <FaExclamationCircle className="alert-icon" />
                                <div className="alert-text">{error}</div>
                            </div>
                            <button className="alert-close" onClick={() => setError("")} aria-label="Đóng thông báo">
                                <FaTimes />
                            </button>
                        </div>
                    )}

                    {success && !showSuccessModal && (
                        <div className="alert-banner success" role="status">
                            <div className="alert-left">
                                <FaCheckCircle className="alert-icon" />
                                <div className="alert-text">Đổi mật khẩu thành công!</div>
                            </div>
                        </div>
                    )}

                    <SuccessModal
                        isOpen={showSuccessModal}
                        onClose={() => {
                            setShowSuccessModal(false);
                            navigate("/profile");
                        }}
                        title="Chúc mừng"
                        message={successMessage}
                        autoClose={true}
                        autoCloseDelay={1500}
                    />

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="currentPassword">Mật khẩu hiện tại:</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPasswords.current ? "text" : "password"}
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập mật khẩu hiện tại"
                                    className={validationErrors.currentPassword ? "error" : ""}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => togglePasswordVisibility("current")}
                                >
                                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {validationErrors.currentPassword && (
                                <span className="field-error">{validationErrors.currentPassword}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">Mật khẩu mới:</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPasswords.new ? "text" : "password"}
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập mật khẩu mới"
                                    className={validationErrors.newPassword ? "error" : ""}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => togglePasswordVisibility("new")}
                                >
                                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {validationErrors.newPassword && (
                                <span className="field-error">{validationErrors.newPassword}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Nhập lại:</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPasswords.confirm ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập lại mật khẩu mới"
                                    className={validationErrors.confirmPassword ? "error" : ""}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => togglePasswordVisibility("confirm")}
                                >
                                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {validationErrors.confirmPassword && (
                                <span className="field-error">{validationErrors.confirmPassword}</span>
                            )}
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Huỷ
                            </button>
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={
                                    loading ||
                                    success ||
                                    !formData.currentPassword ||
                                    !formData.newPassword ||
                                    !formData.confirmPassword ||
                                    !!validationErrors.currentPassword ||
                                    !!validationErrors.newPassword ||
                                    !!validationErrors.confirmPassword
                                }
                            >
                                {loading ? "Đang đổi..." : "Đổi mật khẩu"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

