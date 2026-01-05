import React from "react";
import { Modal, Badge } from "react-bootstrap";
import { MdEmail, MdPhone, MdPerson, MdVerifiedUser, MdAdminPanelSettings } from "react-icons/md";
import "./AdminDetailModal.css";

export default function AdminDetailModal({ show, onClose, admin }) {
  if (!show || !admin) return null;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "SuperAdmin": return "danger";
      case "ContentAdmin": return "primary";
      case "FinanceAdmin": return "success";
      default: return "secondary";
    }
  };

  const roles = admin.roles || admin.Roles || [];
  const permissions = admin.permissions || admin.Permissions || [];

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      className="admin-detail-modal"
      dialogClassName="admin-detail-modal-dialog"
    >
      <Modal.Header closeButton className="admin-modal-header">
        <Modal.Title>
          <MdAdminPanelSettings className="me-2" size={28}/>
          Chi tiết Admin
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="admin-modal-body p-4">
        <div className="row g-4">
          {/* Thông tin cơ bản */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm p-3 h-100 admin-info-card">
              <h6 className="text-muted text-uppercase fw-bold small mb-3 border-bottom pb-2">
                <MdPerson className="me-2" size={18}/>
                Thông tin cá nhân
              </h6>
              
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Họ tên</small>
                <span className="fw-medium">{admin.fullName || admin.FullName || "N/A"}</span>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">
                  <MdEmail className="me-1" size={16}/>
                  Email
                </small>
                <span className="fw-medium">{admin.email || admin.Email || "N/A"}</span>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">
                  <MdPhone className="me-1" size={16}/>
                  Số điện thoại
                </small>
                <span className="fw-medium">{admin.phoneNumber || admin.PhoneNumber || "N/A"}</span>
              </div>

              <div>
                <small className="text-muted d-block mb-1">Ngày tạo</small>
                <span className="fw-medium">{formatDate(admin.createdAt || admin.CreatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Vai trò và quyền */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm p-3 h-100 admin-info-card">
              <h6 className="text-muted text-uppercase fw-bold small mb-3 border-bottom pb-2">
                <MdVerifiedUser className="me-2" size={18}/>
                Vai trò & Quyền hạn
              </h6>

              <div className="mb-3">
                <small className="text-muted d-block mb-2">Vai trò</small>
                <div>
                  {roles.length > 0 ? (
                    roles.map((role, index) => (
                      <Badge key={index} bg={getRoleBadgeColor(role)} className="me-1 mb-1">
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted small">Không có vai trò</span>
                  )}
                </div>
              </div>

              <div>
                <small className="text-muted d-block mb-2">Quyền hạn ({permissions.length})</small>
                <div className="permissions-scroll">
                  {permissions.length > 0 ? (
                    <div className="d-flex flex-wrap gap-1">
                      {permissions.map((perm, index) => (
                        <Badge key={index} bg="info" className="mb-1 permission-badge">
                          {perm.name || perm.Name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted small">Không có quyền hạn</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Trạng thái */}
          <div className="col-12">
            <div className="card border-0 shadow-sm p-3 admin-status-card">
              <div className="d-flex align-items-center">
                <MdVerifiedUser className="text-success me-2" size={24}/>
                <div>
                  <small className="text-muted d-block">Trạng thái</small>
                  <span className="fw-bold text-success">
                    {admin.status || admin.Status || "Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="admin-modal-footer">
        <button className="btn btn-secondary px-4" onClick={onClose}>
          Đóng
        </button>
      </Modal.Footer>
    </Modal>
  );
}
