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
            <div className="row g-4">
              
              {/* Account Info Section */}
              <div className="col-md-7">
                <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '12px' }}>
                  <h6 className="text-muted text-uppercase fw-bold small mb-3 border-bottom pb-2">Thông tin tài khoản</h6>
                  <div className="d-flex align-items-center mb-3">
                    <MdEmail className="text-primary me-3" size={20}/>
                    <div>
                      <small className="text-muted d-block">Email</small>
                      <span className="fw-medium">{user.email}</span>
                      {user.emailVerified && <MdVerifiedUser className="ms-2 text-success" title="Đã xác thực"/>}
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <MdPhone className="text-primary me-3" size={20}/>
                    <div>
                      <small className="text-muted d-block">Số điện thoại</small>
                      <span className="fw-medium">{user.phoneNumber || user.phone || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <div className="d-flex align-items-center mb-3">
                        <MdWc className="text-primary me-3" size={20}/>
                        <div>
                          <small className="text-muted d-block">Giới tính</small>
                          <span className="fw-medium">{user.isMale ? "Nam" : "Nữ"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center mb-3">
                        <MdCake className="text-primary me-3" size={20}/>
                        <div>
                          <small className="text-muted d-block">Ngày sinh</small>
                          <span className="fw-medium">{formatDate(user.dateOfBirth)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats & Subscription Section */}
              <div className="col-md-5">
                <div className="row g-3 h-100">
                  {/* Streak Card */}
                  <div className="col-12">
                    <div className="card border-0 shadow-sm p-3 text-center" style={{ borderRadius: '12px', background: '#fff5f2' }}>
                      <MdLocalFireDepartment className="text-danger mb-2" size={32}/>
                      <h3 className="fw-bold mb-0">{user.streak?.currentStreak || 0}</h3>
                      <small className="text-danger fw-bold">Ngày học liên tiếp</small>
                    </div>
                  </div>

                  {/* Subscription Card */}
                  <div className="col-12">
                    <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '12px', background: '#f0fdf4' }}>
                      <div className="d-flex align-items-center mb-2">
                        <MdCardMembership className="text-success me-2" size={24}/>
                        <span className="fw-bold text-success small">GÓI DỊCH VỤ</span>
                      </div>
                      {user.teacherSubscription ? (
                        <div>
                          <div className="fw-bold text-dark">{user.teacherSubscription.packageName}</div>
                          <small className="text-muted d-block mt-1">
                            Hết hạn: {formatDate(user.teacherSubscription.endDate)}
                          </small>
                        </div>
                      ) : (
                        <span className="text-muted small">Chưa đăng ký gói Pro</span>
                      )}
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
