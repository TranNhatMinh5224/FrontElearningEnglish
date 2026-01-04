import React from "react";
import "./KPICard.css";

export default function KPICard({ title, value, formatValue, icon: Icon, iconColor, iconBgColor, subtitle }) {
  return (
    <div className="col-md-3">
      <div className="admin-card d-flex justify-content-between align-items-start h-100">
        <div>
          <p className="text-muted mb-1 text-uppercase fw-bold small">{title}</p>
          <h3 className="fw-bold mb-0" style={{ color: iconColor || 'inherit' }}>
            {formatValue ? formatValue(value) : value}
          </h3>
          {subtitle && (
            <small className="text-muted d-flex align-items-center mt-2">
              {subtitle}
            </small>
          )}
        </div>
        <div className="p-3 rounded" style={{ backgroundColor: iconBgColor }}>
          <Icon size={28} color={iconColor} />
        </div>
      </div>
    </div>
  );
}
