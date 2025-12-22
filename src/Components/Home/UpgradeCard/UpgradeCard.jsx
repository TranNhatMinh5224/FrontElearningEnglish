import React from "react";
import "./UpgradeCard.css";

export default function UpgradeCard({
    teacherPackageId,
    packageType,
    title,
    description,
    price,
    isSelected = false,
    onMouseEnter,
    onMouseLeave,
    onUpgradeClick,
}) {
    return (
        <div
            className={`upgrade-card ${isSelected ? "selected" : ""}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="upgrade-card-content">
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
            <div className="upgrade-card-footer">
                <strong>{price}</strong>
                <button
                    className="upgrade-btn"
                    onClick={(e) => onUpgradeClick?.(e, teacherPackageId, packageType)}
                >
                    Nâng cấp
                </button>
            </div>
        </div>
    );
}

