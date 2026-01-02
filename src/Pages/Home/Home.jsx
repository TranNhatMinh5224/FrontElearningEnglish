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

export default function Home() {
  const { user, isGuest, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(null); // null hoặc teacherPackageId
  const [showLoginModal, setShowLoginModal] = useState(false);

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
    </>
  );
}
