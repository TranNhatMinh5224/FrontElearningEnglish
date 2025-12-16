import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";
import MainHeader from "../../Components/Header/MainHeader";
import { useAuth } from "../../Context/AuthContext";
import { authService } from "../../Services/authService";
import { FaArrowLeft } from "react-icons/fa";

export default function EditProfile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        lastName: "",
        firstName: "",
        email: "",
        phoneNumber: "",
        bio: "",
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await authService.updateProfile(formData);
            // Update user in context
            const updatedUser = response.data.data;
            updatedUser.fullName = updatedUser.displayName || updatedUser.fullName || `${updatedUser.firstName} ${updatedUser.lastName}`.trim();

            // Navigate back to profile
            navigate("/profile");
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
                    <button className="back-button" onClick={() => navigate("/profile")}>
                        <FaArrowLeft /> Quay lại profile
                    </button>
                </div>

                <div className="edit-profile-card">
                    <h1>Thay đổi thông tin</h1>

                    {error && <div className="error-message">{error}</div>}

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
                            />
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
                            />
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

                        <div className="form-group">
                            <label htmlFor="bio">Tiểu sử:</label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Nhập tiểu sử của bạn"
                                rows="4"
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
                                {loading ? "Đang lưu..." : "Thay đổi thông tin"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

