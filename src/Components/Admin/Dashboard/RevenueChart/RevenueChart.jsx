import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import "./RevenueChart.css";

export default function RevenueChart({ data, loading, formatCurrency }) {
  return (
    <div className="col-lg-8">
      <div className="admin-card">
        <h5 className="fw-bold mb-4">Revenue Growth Trend</h5>
        <div style={{ width: '100%', height: 350 }}>
          {loading ? (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
              Loading chart...
            </div>
          ) : data.length === 0 ? (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
              No revenue data available for this period.
            </div>
          ) : (
            <ResponsiveContainer>
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val) => val >= 1000000 ? `${val / 1000000}M` : val} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#colorRevenue)"
                  name="Total Revenue"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
