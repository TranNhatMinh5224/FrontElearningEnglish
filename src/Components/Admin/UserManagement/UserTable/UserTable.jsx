import React from "react";
import { MdBlock, MdCheckCircle, MdArrowUpward, MdVisibility } from "react-icons/md";
import "./UserTable.css";

export default function UserTable({ 
  users, 
  loading, 
  onViewDetail, 
  onUpgrade, 
  onToggleStatus 
}) {
  const getStatusBadge = (status) => {
    if (status === 'Active' || status === 1) {
      return <span className="status-badge status-active">Active</span>;
    }
    return <span className="status-badge status-blocked">Blocked</span>;
  };

  return (
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
              <tr>
                <td colSpan="5" className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.userId || user.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <img 
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`} 
                        className="rounded-circle me-2" 
                        width="40" 
                        height="40" 
                        alt="Avatar"
                      />
                      <div>
                        <div className="fw-bold">{user.firstName} {user.lastName}</div>
                        <small className="text-muted" style={{fontSize: '0.75rem'}}>{user.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${user.roles?.includes('Teacher') ? 'bg-primary' : 'bg-secondary'}`}>
                      {user.roles?.[0] || 'Student'}
                    </span>
                  </td>
                  <td className="text-muted">{user.phoneNumber || 'N/A'}</td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-sm btn-light text-info" 
                        title="View Detail"
                        onClick={() => onViewDetail(user)}
                      >
                        <MdVisibility />
                      </button>

                      {!user.roles?.includes('Teacher') && (
                        <button 
                          className="btn btn-sm btn-light text-primary" 
                          title="Upgrade to Teacher"
                          onClick={() => onUpgrade(user)}
                        >
                          <MdArrowUpward />
                        </button>
                      )}
                      
                      <button 
                        className="btn btn-sm btn-light" 
                        title={user.status === 'Active' || user.status === 1 ? "Block User" : "Unblock User"}
                        onClick={() => onToggleStatus(user)}
                      >
                        {user.status === 'Active' || user.status === 1 ? 
                          <MdBlock className="text-danger" /> : 
                          <MdCheckCircle className="text-success" />
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
  );
}
