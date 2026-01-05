import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import MainHeader from "../../Components/Header/MainHeader";
import { useAuth } from "../../Context/AuthContext";
import { authService } from "../../Services/authService";
import { fileService } from "../../Services/fileService";
import { FaPencilAlt } from "react-icons/fa";

export default function Profile() {
    const navigate = useNavigate();
    const { user: authUser, refreshUser } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const AVATAR_BUCKET = "avatars"; // Bucket name for avatar

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await authService.getProfile();
                const userData = response.data.data;
                userData.fullName = userData.displayName || userData.fullName || `${userData.firstName} ${userData.lastName}`.trim();
                setUser(userData);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleEditProfile = () => {
        navigate("/profile/edit");
    };

    const handleChangePassword = () => {
        navigate("/profile/change-password");
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Vui lòng chọn file ảnh");
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert("Kích thước ảnh không được vượt quá 2MB");
            return;
        }

        setUploading(true);

        try {
            // 1. Upload file to temp
            const uploadResponse = await fileService.uploadTempFile(file, AVATAR_BUCKET, "temp");
            const tempKey = uploadResponse.data.data.tempKey;

            if (!tempKey) {
                throw new Error("Upload file thất bại");
            }

            // 2. Update avatar with temp key
            const updateResponse = await authService.updateAvatar({
                avatarTempKey: tempKey,
            });

            if (updateResponse.data.success) {
                // Refresh profile to get new avatar URL
                const profileResponse = await authService.getProfile();
                const userData = profileResponse.data.data;
                userData.fullName = userData.displayName || userData.fullName || `${userData.firstName} ${userData.lastName}`.trim();
                setUser(userData);
                // Refresh user in context (to update avatar in header)
                await refreshUser();
            }
        } catch (error) {
            console.error("Error uploading avatar:", error);
            alert(error.response?.data?.message || "Có lỗi xảy ra khi upload avatar");
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    if (loading) {
        return (
            <>
                <MainHeader />
                <div className="profile-container">
                    <div className="profile-loading">Đang tải...</div>
                </div>
            </>
        );
    }

    if (!user) {
        return (
            <>
                <MainHeader />
                <div className="profile-container">
                    <div className="profile-error">Không thể tải thông tin người dùng</div>
                </div>
            </>
        );
    }

    return (
        <>
            <MainHeader />
            <div className="profile-container">
                    <div className="profile-header">
                        <h1>Thông tin User</h1>
                    </div>

                <div className="profile-card">
                    {/* Avatar Section */}
                    <div className="avatar-section">
                        <div className="avatar-wrapper">
                            <div
                                className="avatar-inner"
                                onClick={() => { if (!uploading) handleAvatarClick(); }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!uploading) handleAvatarClick(); } }}
                            >
                                {uploading ? (
                                    <div className="avatar-placeholder avatar-loading">
                                        <div className="spinner"></div>
                                    </div>
                                ) : user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" className="avatar-image" />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {user.fullName?.charAt(0) || "U"}
                                    </div>
                                )}

                                {
                                    !user.avatarUrl && (
                                        <button
                                            className="avatar-edit-overlay"
                                            title="Chỉnh sửa avatar"
                                            onClick={(e) => { e.stopPropagation(); handleAvatarClick(); }}
                                            disabled={uploading}
                                            aria-label="Chỉnh sửa avatar"
                                        >
                                            <span className="pencil-circle"><FaPencilAlt /></span>
                                        </button>
                                    )
                                }
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                accept="image/*"
                                style={{ display: "none" }}
                            />
                        </div>
                    </div>

                    {/* User Information */}
                    <div className="profile-info">
                        <div className="info-row">
                            <label>Last name:</label>
                            <div className="info-value">{user.lastName || "-"}</div>
                        </div>

                        <div className="info-row">
                            <label>First name:</label>
                            <div className="info-value">{user.firstName || "-"}</div>
                        </div>

                        <div className="info-row">
                            <label>Email:</label>
                            <div className="info-value">{user.email || "-"}</div>
                        </div>

                        <div className="info-row">
                            <label>Số điện thoại:</label>
                            <div className="info-value">{user.phoneNumber || "-"}</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="profile-actions">
                        <button className="btn-change-password" onClick={handleChangePassword}>
                            Đổi mật khẩu
                        </button>
                        <button className="btn-edit-profile" onClick={handleEditProfile}>
                            Thay đổi thông tin
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

