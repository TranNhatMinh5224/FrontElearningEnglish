import React from "react";
import "./PieChart.css";

export default function PieChart({ 
  title,
  data = [], // Array of { label, value, color }
  size = 200,
  showLegend = true
}) {
  // Filter out items with zero or negative values
  const validData = data.filter(item => item && (item.value || 0) > 0);
  
  // Calculate total for percentages
  const total = validData.reduce((sum, item) => sum + (item.value || 0), 0);
  
  // If no data, show empty state
  if (validData.length === 0 || total === 0) {
    return (
      <div className="pie-chart-container">
        {title && <h3 className="pie-chart-title">{title}</h3>}
        <div className="pie-chart-empty">
          <div className="pie-chart-empty-icon">📊</div>
          <div className="pie-chart-empty-text">Chưa có dữ liệu</div>
        </div>
      </div>
    );
  }
  
  // Calculate angles for each segment
  let currentAngle = -90; // Start from top
  const segments = validData.map((item, index) => {
    const value = item.value || 0;
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const angle = (percentage / 100) * 360;
    
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    // Calculate path for pie slice
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = 50 + 50 * Math.cos(startAngleRad);
    const y1 = 50 + 50 * Math.sin(startAngleRad);
    const x2 = 50 + 50 * Math.cos(endAngleRad);
    const y2 = 50 + 50 * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M 50 50`,
      `L ${x1} ${y1}`,
      `A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`
    ].join(" ");
    
    return {
      ...item,
      pathData,
      percentage: percentage.toFixed(1),
      startAngle,
      endAngle,
    };
  });

  return (
    <div className="pie-chart-container">
      {title && <h3 className="pie-chart-title">{title}</h3>}
      <div className="pie-chart-wrapper">
        <svg 
          viewBox="0 0 100 100" 
          className="pie-chart-svg"
          style={{ width: size, height: size }}
        >
          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.pathData}
              fill={segment.color || "#41d6e3"}
              stroke="#fff"
              strokeWidth="2"
              className="pie-segment"
              style={{
                transition: "opacity 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = "0.8";
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = "1";
              }}
            />
          ))}
        </svg>
        
        {/* Center text showing total */}
        <div className="pie-chart-center">
          <div className="pie-chart-total">{total.toLocaleString("vi-VN")}</div>
          <div className="pie-chart-total-label">Tổng</div>
        </div>
      </div>
      
      {showLegend && (
        <div className="pie-chart-legend">
          {segments.map((segment, index) => (
            <div key={index} className="pie-legend-item">
              <div 
                className="pie-legend-color" 
                style={{ backgroundColor: segment.color || "#41d6e3" }}
              />
              <div className="pie-legend-info">
                <span className="pie-legend-label">{segment.label}</span>
                <span className="pie-legend-value">
                  {segment.value.toLocaleString("vi-VN")} ({segment.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

