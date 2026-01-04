import React from "react";
import "./RevenueBreakdown.css";

export default function RevenueBreakdown({ breakdown, totalRevenue, formatCurrency }) {
  return (
    <div className="admin-card">
      <h6 className="fw-bold mb-3">Revenue Source Breakdown</h6>

      <div className="mb-3">
        <div className="d-flex justify-content-between small mb-1">
          <span>Course Sales</span>
          <span className="fw-bold">{formatCurrency(breakdown.fromCourses)}</span>
        </div>
        <div className="progress" style={{ height: '6px' }}>
          <div
            className="progress-bar bg-primary"
            role="progressbar"
            style={{ width: `${totalRevenue > 0 ? (breakdown.fromCourses / totalRevenue) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      <div>
        <div className="d-flex justify-content-between small mb-1">
          <span>Teacher Packages</span>
          <span className="fw-bold">{formatCurrency(breakdown.fromPackages)}</span>
        </div>
        <div className="progress" style={{ height: '6px' }}>
          <div
            className="progress-bar bg-info"
            role="progressbar"
            style={{ width: `${totalRevenue > 0 ? (breakdown.fromPackages / totalRevenue) * 100 : 0}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
