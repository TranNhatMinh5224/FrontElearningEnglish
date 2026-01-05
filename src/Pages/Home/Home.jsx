import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import MainHeader from "../../Components/Header/MainHeader";
import { useAuth } from "../../Context/AuthContext";
import SEO from "../../Components/SEO/SEO";
import {
  WelcomeSection,
  MyCoursesSection,
  SuggestedCoursesSection,
  AccountUpgradeSection,
} from "../../Components/Home";
import WelcomeFooter from "../../Components/Welcome/WelcomeFooter";
import LoginRequiredModal from "../../Components/Common/LoginRequiredModal/LoginRequiredModal";
import NotificationModal from "../../Components/Common/NotificationModal/NotificationModal";

export default function Home() {
  const { user, isGuest, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(null); // null hoặc teacherPackageId
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [notification, setNotification] = useState({ isOpen: false, type: "info", message: "" });

  const displayName = isGuest ? "bạn" : user?.fullName || "bạn";

  const handlePackageHover = (teacherPackageId) => {
    setSelectedPackage(teacherPackageId);
  };

  const handlePackageLeave = () => {
    setSelectedPackage(null);
  };

  const handleUpgradeClick = (e, teacherPackageId, packageType) => {
    e.stopPropagation(); // Ngăn event bubble lên package card

    // Kiểm tra đăng nhập trước khi navigate
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Kiểm tra nếu user đã là giáo viên
    const teacherSubscription = user?.teacherSubscription || user?.TeacherSubscription;
    const isTeacher = teacherSubscription?.isTeacher || teacherSubscription?.IsTeacher;
    
    if (isTeacher === true) {
      setNotification({
        isOpen: true,
        type: "info",
        message: "Gói giáo viên hiện tại của bạn đang hoạt động, vui lòng chờ đến khi hết hạn để kích hoạt gói giáo viên mới!"
      });
      return;
    }

    // Navigate đến trang thanh toán với teacherPackageId
    navigate(`/payment?packageId=${teacherPackageId}&package=${packageType}`);
  };

  return (
    <>
      <SEO
        title="Catalunya English - Trang Chủ | Học Tiếng Anh Online"
        description="Khám phá các khóa học tiếng Anh chất lượng tại Catalunya English. Nền tảng học tiếng Anh online với bài học tương tác, từ vựng, phát âm và nhiều hơn nữa."
        keywords="học tiếng anh online, khóa học tiếng anh, luyện thi IELTS, từ vựng tiếng anh, phát âm tiếng anh"
      />
      <MainHeader />

      <div className="home-container">
        <WelcomeSection displayName={displayName} />
        <MyCoursesSection />

        <section className="home-bottom">
          <SuggestedCoursesSection />
          <AccountUpgradeSection
            selectedPackage={selectedPackage}
            onPackageHover={handlePackageHover}
            onPackageLeave={handlePackageLeave}
            onUpgradeClick={handleUpgradeClick}
          />
        </section>
      </div>

      <WelcomeFooter />

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ isOpen: false, type: "info", message: "" })}
        type={notification.type}
        message={notification.message}
      />
    </>
  );
}
