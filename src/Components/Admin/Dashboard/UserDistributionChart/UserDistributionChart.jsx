import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./UserDistributionChart.css";

export default function UserDistributionChart({ userStats }) {
  const userPieData = [
    { name: 'Students', value: userStats.studentCount },
    { name: 'Teachers', value: userStats.teacherCount },
  ];

  const pieTotal = userStats.studentCount + userStats.teacherCount;
  const isPieDataEmpty = pieTotal === 0;

  return (
    <div className="admin-card mb-4" style={{ height: '350px' }}>
      <h5 className="fw-bold mb-0">User Distribution</h5>
      <div style={{ width: '100%', height: '220px' }}>
        {isPieDataEmpty ? (
          <div className="d-flex align-items-center justify-content-center h-100 text-muted">
            No user data available.
          </div>
        ) : (
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={userPieData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {userPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f59e0b'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {!isPieDataEmpty && (
        <div className="text-center mt-2">
          <span className="badge bg-success bg-opacity-10 text-success me-2">
            {((userStats.studentCount / (pieTotal || 1)) * 100).toFixed(1)}% Students
          </span>
          <span className="badge bg-warning bg-opacity-10 text-warning">
            {((userStats.teacherCount / (pieTotal || 1)) * 100).toFixed(1)}% Teachers
          </span>
        </div>
      )}
    </div>
  );
}
