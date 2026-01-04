import React from "react";
import { MdPerson, MdSchool, MdArrowUpward } from "react-icons/md";
import "./UserStatsCards.css";

export default function UserStatsCards({ stats }) {
  return (
    <div className="row g-4 mb-4">
      <div className="col-md-4">
        <div className="user-stat-card">
          <div className="stat-icon stat-icon-primary">
            <MdPerson size={24} />
          </div>
          <div className="stat-content">
            <h4 className="stat-value">{stats.totalUsers || 0}</h4>
            <small className="stat-label">Total Users</small>
          </div>
        </div>
      </div>
      
      <div className="col-md-4">
        <div className="user-stat-card">
          <div className="stat-icon stat-icon-success">
            <MdSchool size={24} />
          </div>
          <div className="stat-content">
            <h4 className="stat-value">{stats.totalTeachers || 0}</h4>
            <small className="stat-label">Total Teachers</small>
          </div>
        </div>
      </div>
      
      <div className="col-md-4">
        <div className="user-stat-card">
          <div className="stat-icon stat-icon-warning">
            <MdArrowUpward size={24} />
          </div>
          <div className="stat-content">
            <h4 className="stat-value">{stats.newUsersLast30Days || stats.newUsersToday || 0}</h4>
            <small className="stat-label">New Users (30d)</small>
          </div>
        </div>
      </div>
    </div>
  );
}
