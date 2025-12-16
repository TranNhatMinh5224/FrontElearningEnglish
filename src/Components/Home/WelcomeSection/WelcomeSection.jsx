import React from "react";
import "./WelcomeSection.css";

export default function WelcomeSection({ displayName }) {
    return (
        <section className="welcome-section">
            <h1>Chào mừng trở lại, {displayName}</h1>
            <p>Hãy tiếp tục hành trình học tiếng Anh nào.</p>
        </section>
    );
}

