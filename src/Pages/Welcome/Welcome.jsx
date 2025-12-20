import React from "react";
import "./Welcome.css";
import WelcomeHero from "../../Components/Welcome/WelcomeHero";
import WelcomeHabit from "../../Components/Welcome/WelcomeHabit";
import WelcomeIELTS from "../../Components/Welcome/WelcomeIELTS";
import WelcomePremium from "../../Components/Welcome/WelcomePremium";
import WelcomeFooter from "../../Components/Welcome/WelcomeFooter";
import WelcomeHeader from "../../Components/Header/WelcomeHeader";

export default function Welcome() {
  return (
    <div className="welcome-page">
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
