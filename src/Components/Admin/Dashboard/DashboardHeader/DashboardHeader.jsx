import React from "react";
import { MdCalendarToday } from "react-icons/md";
import "./DashboardHeader.css";

export default function DashboardHeader({ timeRange, onTimeRangeChange, onRefresh }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 className="page-title mb-1">Dashboard Overview</h1>
        <p className="text-muted mb-0">Real-time system analytics</p>
      </div>

      <div className="d-flex align-items-center gap-2">
        <div className="bg-white p-1 rounded border d-flex align-items-center">
          <MdCalendarToday className="text-muted ms-2 me-1" />
          <select
            className="form-select border-0 shadow-none py-1"
            style={{ width: 'auto', fontWeight: 500 }}
            value={timeRange}
            onChange={(e) => onTimeRangeChange(parseInt(e.target.value))}
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 3 Months</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={onRefresh}>
          Refresh Data
        </button>
      </div>
    </div>
  );
}
