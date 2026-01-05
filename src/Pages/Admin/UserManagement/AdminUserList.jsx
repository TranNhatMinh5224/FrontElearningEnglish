import React, { useState, useEffect } from "react";
import { adminService } from "../../../Services/adminService";
import UserStatsCards from "../../../Components/Admin/UserManagement/UserStatsCards/UserStatsCards";
import UserFilters from "../../../Components/Admin/UserManagement/UserFilters/UserFilters";
import UserTable from "../../../Components/Admin/UserManagement/UserTable/UserTable";
import UpgradeUserModal from "../../../Components/Admin/UserManagement/UpgradeUserModal/UpgradeUserModal";
import UserDetailModal from "../../../Components/Admin/UserManagement/UserDetailModal/UserDetailModal";
import "./AdminUserList.css";
import SuccessModal from "../../../Components/Common/SuccessModal/SuccessModal";

export default function AdminUserList() {
  const [activeTab, setActiveTab] = useState("all"); 
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ totalUsers: 0, totalTeachers: 0, newUsersToday: 0 });
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0 });

  // Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [upgradePackageId, setUpgradePackageId] = useState(1); 
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

  const handleViewDetail = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
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
      fetchUsers(); 
      fetchUserStats();
    } catch (error) {
      alert(`Failed to ${action} user`);
    }
  };

  const openUpgradeModal = (user) => {
    setSelectedUser(user);
    setShowUpgradeModal(true);
  };

  const handleUpgradeUser = async () => {
    if (!selectedUser) return;
    
    try {
      await adminService.upgradeUserToTeacher({
        email: selectedUser.email,
        teacherPackageId: parseInt(upgradePackageId)
      });
      setSuccessMessage("User upgraded to Teacher successfully!");
      setShowSuccessModal(true);
      setShowUpgradeModal(false);
      fetchUsers();
      fetchUserStats();
    } catch (error) {
      alert("Failed to upgrade user. Check if user is already a teacher.");
      console.error(error);
    }
  };

  return (
    <div className="user-management-container">
      {/* HEADER */}
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <button className="btn-refresh" onClick={fetchUsers}>
          Refresh Data
        </button>
      </div>

      {/* STATS */}
      <UserStatsCards stats={stats} />

      {/* FILTERS */}
      <UserFilters 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* USER TABLE */}
      <UserTable 
        users={users}
        loading={loading}
        onViewDetail={handleViewDetail}
        onUpgrade={openUpgradeModal}
        onToggleStatus={handleToggleStatus}
      />

      {/* MODALS */}
      <UpgradeUserModal 
        show={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        user={selectedUser}
        packageId={upgradePackageId}
        setPackageId={setUpgradePackageId}
        onConfirm={handleUpgradeUser}
      />

      <UserDetailModal 
        show={showDetailModal} 
        onClose={() => setShowDetailModal(false)} 
        user={selectedUser} 
      />
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Thành công"
        message={successMessage}
      />
    </div>
  );
}
