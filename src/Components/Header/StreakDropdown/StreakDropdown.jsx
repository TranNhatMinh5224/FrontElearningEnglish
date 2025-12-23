import React from "react";
import { Dropdown } from "react-bootstrap";
import { useStreak } from "../../../Context/StreakContext";
import { useAuth } from "../../../Context/AuthContext";
import { iconStreakFire as iconFireStreak } from "../../../Assets";
import "./StreakDropdown.css";

export default function StreakDropdown() {
    const { streakDays, isActiveToday } = useStreak();
    const { isAuthenticated, isGuest } = useAuth();

    if (isGuest || !isAuthenticated) {
        return null;
    }

    return (
        <Dropdown 
            className="streak-wrapper" 
            align="end"
        >
            <Dropdown.Toggle
                as="div"
                className="streak-badge"
                id="streak-dropdown"
            >
                <img src={iconFireStreak} alt="Chuỗi ngày học" className="streak-icon" />
                <span>{streakDays || 0} ngày</span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="streak-dropdown">
                <div className="streak-content">
                    <div className="streak-icon-large">
                        <img src={iconFireStreak} alt="Chuỗi ngày học" />
                    </div>
                    <div className="streak-message">
                        <p className="streak-main-text">
                            Số ngày hoàn thành liên tục của bạn là <strong>{streakDays || 0}</strong>
                        </p>
                        {!isActiveToday && (
                            <p className="streak-encourage-text">
                                Hãy học để tăng thêm streak của ngày hôm nay nhé
                            </p>
                        )}
                        {isActiveToday && (
                            <p className="streak-success-text">
                                Bạn đã hoàn thành streak hôm nay rồi! 🎉
                            </p>
                        )}
                    </div>
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
}

