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
import WelcomeFooter from "../../Components/Welcome/WelcomeFooter";

export default function Home() {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(null); // null hoặc teacherPackageId

  const displayName = isGuest ? "bạn" : user?.fullName || "bạn";

  const handlePackageHover = (teacherPackageId) => {
    setSelectedPackage(teacherPackageId);
  };

  const handlePackageLeave = () => {
    setSelectedPackage(null);
  };

  const handleUpgradeClick = (e, teacherPackageId, packageType) => {
    e.stopPropagation(); // Ngăn event bubble lên package card
    // Navigate đến trang thanh toán với teacherPackageId
    navigate(`/payment?packageId=${teacherPackageId}&package=${packageType}`);
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

      <WelcomeFooter />
    </>
  );
}
