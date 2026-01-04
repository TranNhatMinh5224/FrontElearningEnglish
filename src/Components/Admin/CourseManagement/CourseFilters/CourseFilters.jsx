import React from "react";
import { MdSearch, MdFilterList } from "react-icons/md";
import "./CourseFilters.css";

export default function CourseFilters({ activeTab, setActiveTab, searchTerm, setSearchTerm, onSearch }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className="course-filters-container">
      <div className="filters-content">
        <div className="btn-group" role="group">
          <button 
            className={`filter-tab ${activeTab === 'all' ? 'active-all' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Courses
          </button>
          <button 
            className={`filter-tab ${activeTab === 'system' ? 'active-system' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            System Courses
          </button>
          <button 
            className={`filter-tab ${activeTab === 'teacher' ? 'active-teacher' : ''}`}
            onClick={() => setActiveTab('teacher')}
          >
            Teacher Courses
          </button>
        </div>

        <div className="filter-actions">
          <div className="search-box">
            <span className="search-icon">
              <MdSearch />
            </span>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search course..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button className="btn-filter">
            <MdFilterList />
          </button>
        </div>
      </div>
    </div>
  );
}
