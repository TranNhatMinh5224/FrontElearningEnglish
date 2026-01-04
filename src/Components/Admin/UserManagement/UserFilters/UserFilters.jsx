import React from "react";
import { MdSearch } from "react-icons/md";
import "./UserFilters.css";

export default function UserFilters({ activeTab, setActiveTab, searchTerm, setSearchTerm }) {
  return (
    <div className="user-filters-container">
      <div className="filters-content">
        <div className="btn-group" role="group">
          <button 
            className={`filter-tab ${activeTab === 'all' ? 'active-all' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Users
          </button>
          <button 
            className={`filter-tab ${activeTab === 'teachers' ? 'active-teachers' : ''}`}
            onClick={() => setActiveTab('teachers')}
          >
            Teachers Only
          </button>
          <button 
            className={`filter-tab ${activeTab === 'blocked' ? 'active-blocked' : ''}`}
            onClick={() => setActiveTab('blocked')}
          >
            Blocked Accounts
          </button>
        </div>

        <div className="search-box">
          <span className="search-icon">
            <MdSearch />
          </span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search email, name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
