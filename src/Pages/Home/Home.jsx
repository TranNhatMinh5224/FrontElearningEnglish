import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import MainHeader from "../../Components/Header/MainHeader";
import { useAuth } from "../../Context/AuthContext";
import {
  WelcomeSection,
  MyCoursesSection,
  SuggestedCoursesSection,
  AccountUpgradeSection,
} from "../../Components/Home";

export default function Home() {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(null); // null, 'vip', hoặc 'premium'

  const displayName = isGuest ? "bạn" : user?.fullName || "bạn";

  const handlePackageHover = (packageType) => {
    setSelectedPackage(packageType);
  };

  const handlePackageLeave = () => {
    // Giữ nguyên selected package khi hover ra (hoặc có thể set về null nếu muốn)
    // setSelectedPackage(null);
  };

  const handleUpgradeClick = (e, packageType) => {
    e.stopPropagation(); // Ngăn event bubble lên package card
    // Navigate đến trang thanh toán với package type
    navigate(`/payment?package=${packageType}`);
  };

  return (
    <>
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
    </>
  );
}
