import React from "react";
import "./Welcome.css";
import WelcomeHero from "../../Components/Welcome/WelcomeHero";
import WelcomeHabit from "../../Components/Welcome/WelcomeHabit";
import WelcomeIELTS from "../../Components/Welcome/WelcomeIELTS";
import WelcomePremium from "../../Components/Welcome/WelcomePremium";
import WelcomeFooter from "../../Components/Welcome/WelcomeFooter";
import WelcomeHeader from "../../Components/Header/WelcomeHeader";
import SEO from "../../Components/SEO/SEO";

export default function Welcome() {
  return (
    <div className="welcome-page">
      <SEO
        title="Catalunya English - Học Tiếng Anh Online Hiệu Quả"
        description="Khám phá Catalunya English - Nền tảng học tiếng Anh online hàng đầu với các khóa học chất lượng, bài học tương tác, luyện thi IELTS, và công cụ học tập hiện đại. Bắt đầu hành trình học tiếng Anh của bạn ngay hôm nay!"
        keywords="học tiếng anh online, khóa học tiếng anh, luyện thi IELTS, từ vựng tiếng anh, phát âm tiếng anh, học tiếng anh miễn phí, Catalunya English"
      />
      {/* Header */}
      <WelcomeHeader />

      {/* Hero Section */}
      <WelcomeHero />

      {/* Habit Section */}
      <WelcomeHabit />

      {/* IELTS Section */}
      <WelcomeIELTS />

      {/* Premium Section */}
      <WelcomePremium />

      {/* Footer */}
      <WelcomeFooter />
    </div>
  );
}
