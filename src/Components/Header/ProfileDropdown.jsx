// Components/Header/ProfileDropdown.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

export default function ProfileDropdown() {
  const navigate = useNavigate();
  const { user: authUser, roles, isGuest, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const isTeacher = roles.includes("Teacher");
  const isAdmin = roles.includes("Admin");
  const isPremium = authUser?.teacherSubscription?.subscriptionType === "Premium";

  // Use user from auth context (includes avatarUrl)
  const user = authUser;

  return (
    <div className="profile-wrapper">
      {/* AVATAR */}
      <div className="profile-trigger" onClick={() => setOpen(!open)}>
        <div className="avatar">
          {isGuest ? (
            "👤"
          ) : user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="avatar-img" />
          ) : (
            user?.fullName?.charAt(0)
          )}
        </div>
        {!isGuest && (
          <div className="user-info">
            <span className="name">{user?.fullName}</span>
            <span className="role">Học sinh</span>
          </div>
        )}
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="profile-dropdown">
          {/* ===== GUEST ===== */}
          {isGuest && (
            <>
              <button onClick={() => navigate("/login")}>
                Đăng nhập
              </button>
              <button onClick={() => navigate("/register")}>
                Đăng ký
              </button>
            </>
          )}

          {/* ===== USER / TEACHER ===== */}
          {!isGuest && !isAdmin && (
            <>
              <button onClick={() => navigate("/profile")}>
                Thông tin cá nhân
              </button>

              <button onClick={() => navigate("/transactions")}>
                Lịch sử giao dịch
              </button>

              {isTeacher && user?.teacherSubscription && (
                <button
                  className="teacher"
                  onClick={() => navigate("/teacher")}
                >
                  {isPremium
                    ? "Gói giáo viên Premium"
                    : "Gói giáo viên cơ bản"}
                </button>
              )}

              <div className="divider" />

              <button
                className="logout"
                onClick={() => logout(navigate)}
              >
                Đăng xuất
              </button>
            </>
          )}

          {/* ===== ADMIN ===== */}
          {isAdmin && (
            <>
              <button onClick={() => navigate("/admin")}>
                Trang quản trị
              </button>
              <button
                className="logout"
                onClick={() => logout(navigate)}
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
