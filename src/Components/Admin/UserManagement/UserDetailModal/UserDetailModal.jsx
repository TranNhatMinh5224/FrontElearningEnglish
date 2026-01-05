import React from "react";
import { MdClose, MdLocalFireDepartment, MdCardMembership, MdPerson, MdEmail, MdPhone, MdWc, MdCake, MdVerifiedUser } from "react-icons/md";
import "./UserDetailModal.css";

export default function UserDetailModal({ show, onClose, user }) {
  if (!show || !user) return null;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered user-detail-modal-dialog">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          
          {/* Header Gradient */}
          <div className="p-4 text-white d-flex justify-content-between align-items-start" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            <div className="d-flex align-items-center">
              <img 
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random&size=128`} 
                className="rounded-circle border border-4 border-white shadow-sm me-3" 
                width="80" height="80" 
                alt="Avatar"
              />
              <div>
                <h4 className="mb-1 fw-bold">{user.firstName} {user.lastName}</h4>
                <span className="badge bg-white text-primary rounded-pill px-3 py-2 fw-bold">
                  {user.roles?.[0] || 'Student'}
                </span>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white shadow-none" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-light">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px' }}>
              <h6 className="text-muted text-uppercase fw-bold small mb-4 border-bottom pb-2">
                <MdPerson className="me-2" size={18}/>
                Thông tin tài khoản
              </h6>
              
              <div className="row g-4">
                {/* Email */}
                <div className="col-md-6">
                  <div className="d-flex align-items-start">
                    <div className="icon-wrapper me-3" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MdEmail className="text-primary" size={20}/>
                    </div>
                    <div className="flex-grow-1">
                      <small className="text-muted d-block mb-1">Email</small>
                      <div className="d-flex align-items-center">
                        <span className="fw-medium">{user.email}</span>
                        {user.emailVerified && <MdVerifiedUser className="ms-2 text-success" size={16} title="Đã xác thực"/>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="col-md-6">
                  <div className="d-flex align-items-start">
                    <div className="icon-wrapper me-3" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MdPhone className="text-primary" size={20}/>
                    </div>
                    <div className="flex-grow-1">
                      <small className="text-muted d-block mb-1">Số điện thoại</small>
                      <span className="fw-medium">{user.phoneNumber || user.phone || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                </div>

                {/* Gender */}
                <div className="col-md-6">
                  <div className="d-flex align-items-start">
                    <div className="icon-wrapper me-3" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MdWc className="text-primary" size={20}/>
                    </div>
                    <div className="flex-grow-1">
                      <small className="text-muted d-block mb-1">Giới tính</small>
                      <span className="fw-medium">{user.isMale ? "Nam" : "Nữ"}</span>
                    </div>
                  </div>
                </div>

                {/* Birthday */}
                <div className="col-md-6">
                  <div className="d-flex align-items-start">
                    <div className="icon-wrapper me-3" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MdCake className="text-primary" size={20}/>
                    </div>
                    <div className="flex-grow-1">
                      <small className="text-muted d-block mb-1">Ngày sinh</small>
                      <span className="fw-medium">{formatDate(user.dateOfBirth)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer bg-light border-0 p-3">
            <button type="button" className="btn btn-secondary px-4" onClick={onClose} style={{ borderRadius: '8px' }}>Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
}
