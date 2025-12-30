import React, { useState, useEffect } from "react";
import { MdSearch, MdSchool, MdPerson, MdBlock, MdCheckCircle, MdArrowUpward, MdClose } from "react-icons/md";
import { adminService } from "../../../Services/adminService";

export default function AdminUserList() {
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'teachers', 'blocked'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ totalUsers: 0, totalTeachers: 0, newUsersToday: 0 });
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0 });

  // Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUserForUpgrade, setSelectedUserForUpgrade] = useState(null);
  const [upgradePackageId, setUpgradePackageId] = useState(1); // Default Package ID

  useEffect(() => {
    fetchUserStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [activeTab, searchTerm, pagination.pageNumber]);

  const fetchUserStats = async () => {
    try {
      const res = await adminService.getUserStats();
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats", error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        searchTerm,
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize
      };

      let response;
      if (activeTab === 'teachers') {
        response = await adminService.getTeachers(params);
      } else if (activeTab === 'blocked') {
        response = await adminService.getBlockedUsers(params);
      } else {
        response = await adminService.getAllUsers(params);
      }

      if (response.data && response.data.success) {
        setUsers(response.data.data.items || []);
        setPagination({
          ...pagination,
          totalCount: response.data.data.totalCount
        });
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const isBlocked = user.status === 'Inactive' || user.status === 0;
    const action = isBlocked ? 'Unblock' : 'Block';
    
    if (!window.confirm(`Are you sure you want to ${action} user ${user.email}?`)) return;

    try {
      if (isBlocked) {
        await adminService.unblockUser(user.userId || user.id);
      } else {
        await adminService.blockUser(user.userId || user.id);
      }
      fetchUsers(); // Refresh list
      fetchUserStats(); // Refresh stats (vì có thể ảnh hưởng số lượng active)
    } catch (error) {
      alert(`Failed to ${action} user`);
    }
  };

  const openUpgradeModal = (user) => {
    setSelectedUserForUpgrade(user);
    setShowUpgradeModal(true);
  };

  const handleUpgradeUser = async () => {
    if (!selectedUserForUpgrade) return;
    
    try {
      await adminService.upgradeUserToTeacher({
        email: selectedUserForUpgrade.email,
        teacherPackageId: parseInt(upgradePackageId)
      });
      alert("User upgraded to Teacher successfully!");
      setShowUpgradeModal(false);
      fetchUsers();
      fetchUserStats();
    } catch (error) {
      alert("Failed to upgrade user. Check if user is already a teacher.");
      console.error(error);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Active' || status === 1) return <span className="status-badge status-success">Active</span>;
    return <span className="status-badge status-danger">Blocked</span>;
  };

  return (
    <div className="user-management-container">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title mb-0">User Management</h1>
        <div className="d-flex gap-2">
            <button className="btn btn-outline-primary" onClick={fetchUsers}>Refresh Data</button>
        </div>
      </div>

      {/* STATS FROM API */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
           <div className="admin-card p-3 d-flex align-items-center">
              <div className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary me-3">
                 <MdPerson size={24}/>
              </div>
              <div>
                 <h4 className="mb-0 fw-bold">{stats.totalUsers || 0}</h4>
                 <small className="text-muted">Total Users</small>
              </div>
           </div>
        </div>
        <div className="col-md-4">
           <div className="admin-card p-3 d-flex align-items-center">
              <div className="p-3 rounded-circle bg-success bg-opacity-10 text-success me-3">
                 <MdSchool size={24}/>
              </div>
              <div>
                 <h4 className="mb-0 fw-bold">{stats.totalTeachers || 0}</h4>
                 <small className="text-muted">Total Teachers</small>
              </div>
           </div>
        </div>
        <div className="col-md-4">
           <div className="admin-card p-3 d-flex align-items-center">
              <div className="p-3 rounded-circle bg-warning bg-opacity-10 text-warning me-3">
                 <MdArrowUpward size={24}/>
              </div>
              <div>
                 <h4 className="mb-0 fw-bold">{stats.newUsersToday || 0}</h4>
                 <small className="text-muted">New Users Today</small>
              </div>
           </div>
        </div>
      </div>

      {/* TABS & FILTERS */}
      <div className="admin-card mb-4 p-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="btn-group">
            <button 
              className={`btn ${activeTab === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('all')}
            >
              All Users
            </button>
            <button 
              className={`btn ${activeTab === 'teachers' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('teachers')}
            >
              Teachers Only
            </button>
            <button 
              className={`btn ${activeTab === 'blocked' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('blocked')}
            >
              Blocked Accounts
            </button>
          </div>

          <div className="input-group" style={{maxWidth: '300px'}}>
             <span className="input-group-text bg-white border-end-0"><MdSearch /></span>
             <input 
                type="text" 
                className="form-control border-start-0 ps-0" 
                placeholder="Search email, name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>
      </div>

      {/* USER TABLE */}
      <div className="admin-card">
         <div className="table-responsive">
            <table className="admin-table">
               <thead>
                  <tr>
                     <th>User Info</th>
                     <th>Role</th>
                     <th>Phone</th>
                     <th>Status</th>
                     <th>Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {loading ? (
                      <tr><td colSpan="5" className="text-center p-4">Loading data...</td></tr>
                  ) : users.length === 0 ? (
                      <tr><td colSpan="5" className="text-center p-4">No records found.</td></tr>
                  ) : (
                      users.map((user) => (
                        <tr key={user.userId || user.id}>
                            <td>
                                <div className="d-flex align-items-center">
                                <img 
                                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`} 
                                    className="rounded-circle me-2" 
                                    width="32" height="32" 
                                    alt="Avatar"
                                />
                                <div>
                                    <div className="fw-bold fs-sm">{user.firstName} {user.lastName}</div>
                                    <small className="text-muted" style={{fontSize: '11px'}}>{user.email}</small>
                                </div>
                                </div>
                            </td>
                            <td>
                                <span className={`badge ${user.role === 'Teacher' ? 'bg-primary' : 'bg-secondary'}`}>
                                    {user.role || 'Student'}
                                </span>
                            </td>
                            <td>{user.phoneNumber || 'N/A'}</td>
                            <td>{getStatusBadge(user.status)}</td>
                            <td>
                                <div className="d-flex gap-2">
                                    {/* Upgrade Button (Only for Students) */}
                                    {user.role !== 'Teacher' && (
                                        <button 
                                            className="btn btn-sm btn-light text-primary" 
                                            title="Upgrade to Teacher"
                                            onClick={() => openUpgradeModal(user)}
                                        >
                                            <MdArrowUpward />
                                        </button>
                                    )}
                                    
                                    {/* Block/Unblock Button */}
                                    <button 
                                        className="btn btn-sm btn-light" 
                                        title={user.status === 'Active' || user.status === 1 ? "Block User" : "Unblock User"}
                                        onClick={() => handleToggleStatus(user)}
                                    >
                                        {user.status === 'Active' || user.status === 1 ? 
                                            <MdBlock className="text-danger"/> : 
                                            <MdCheckCircle className="text-success"/>
                                        }
                                    </button>
                                </div>
                            </td>
                        </tr>
                      ))
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Upgrade to Teacher</h5>
                <button type="button" className="btn-close" onClick={() => setShowUpgradeModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>You are upgrading user <strong>{selectedUserForUpgrade?.email}</strong>.</p>
                <div className="mb-3">
                  <label className="form-label">Select Teacher Package</label>
                  <select 
                    className="form-select"
                    value={upgradePackageId}
                    onChange={(e) => setUpgradePackageId(e.target.value)}
                  >
                    <option value="1">Basic Teacher Package</option>
                    <option value="2">Pro Teacher Package</option>
                    <option value="3">Premium Teacher Package</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUpgradeModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleUpgradeUser}>Confirm Upgrade</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}