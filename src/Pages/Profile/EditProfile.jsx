import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";
import MainHeader from "../../Components/Header/MainHeader";
import { useAuth } from "../../Context/AuthContext";
import SuccessModal from "../../Components/Common/SuccessModal/SuccessModal";
import { authService } from "../../Services/authService";
// FaArrowLeft removed: back button hidden per UX request

export default function EditProfile() {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [successOnCloseNavigate, setSuccessOnCloseNavigate] = useState(false);

    const [formData, setFormData] = useState({
        lastName: "",
        firstName: "",
        email: "",
        phoneNumber: "",
        bio: "",
    });

    const [errors, setErrors] = useState({
        lastName: "",
        firstName: "",
        phoneNumber: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await authService.getProfile();
                const userData = response.data.data;
                setFormData({
                    lastName: userData.lastName || "",
                    firstName: userData.firstName || "",
                    email: userData.email || "",
                    phoneNumber: userData.phoneNumber || "",
                    bio: userData.bio || "",
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
                setError("Không thể tải thông tin người dùng");
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError("");

        // Real-time validation for firstName and lastName
        if (name === "firstName" || name === "lastName") {
            let error = "";
            if (value.length > 20) {
                error = `${name === "firstName" ? "Tên" : "Họ"} không được vượt quá 20 ký tự`;
            }
            setErrors((prev) => ({
                ...prev,
                [name]: error,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        // Validate form
        const newErrors = {
            firstName: formData.firstName.length > 20 ? "Tên không được vượt quá 20 ký tự" : "",
            lastName: formData.lastName.length > 20 ? "Họ không được vượt quá 20 ký tự" : "",
            phoneNumber: "",
        };

        setErrors(newErrors);

        // Check if there are any errors
        if (newErrors.firstName || newErrors.lastName) {
            return;
        }

        setLoading(true);

        try {
            const response = await authService.updateProfile(formData);
            // Update user in context
            const updatedUser = response.data.data;
            updatedUser.fullName = updatedUser.displayName || updatedUser.fullName || `${updatedUser.firstName} ${updatedUser.lastName}`.trim();

            // Refresh global user (updates header/avatar) and show success modal
            await refreshUser?.();
            setSuccess(true);
            setSuccessMessage("Lưu thông tin thành công!");
            setSuccessOnCloseNavigate(true);
            setShowSuccessModal(true);
        } catch (error) {
            setError(
                error.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin"
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
            <div className="edit-profile-container">
                <div className="edit-profile-header">
                    {/* Back button removed — streamlined header */}
                </div>

                <div className="edit-profile-card">
                    <h1>Thay đổi thông tin</h1>

                    {error && <div className="error-message">{error}</div>}
                    <SuccessModal
                        isOpen={showSuccessModal}
                        onClose={() => {
                            setShowSuccessModal(false);
                            if (successOnCloseNavigate) navigate("/profile");
                        }}
                        title="Thành công"
                        message={successMessage}
                        autoClose={true}
                        autoCloseDelay={1500}
                    />

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="lastName">Last name:</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Nhập họ"
                                maxLength={20}
                                className={errors.lastName ? "error" : ""}
                            />
                            {errors.lastName && <span className="input-error">{errors.lastName}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="firstName">First name:</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Nhập tên"
                                maxLength={20}
                                className={errors.firstName ? "error" : ""}
                            />
                            {errors.firstName && <span className="input-error">{errors.firstName}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <div className="email-input-wrapper">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Nhập email"
                                    disabled
                                    className="email-disabled"
                                />
                                <span className="email-note">Email không thể thay đổi</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="phoneNumber">Số điện thoại:</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Nhập số điện thoại"
                            />
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
                                disabled={loading}
                            >
                                {loading ? "Đang lưu..." : "Lưu thông tin"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

