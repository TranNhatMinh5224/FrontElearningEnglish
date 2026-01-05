import React, { useState, useEffect, useCallback } from "react";
import { Container, Button, Pagination, Badge } from "react-bootstrap";
import { FaPlus, FaUser, FaEdit, FaTrash, FaKey, FaEnvelope } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import { useAuth } from "../../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { superAdminService } from "../../../Services/superAdminService";
import { toast } from "react-toastify";
import UnauthorizedModal from "../../../Components/Common/UnauthorizedModal/UnauthorizedModal";
import CreateAdminModal from "../../../Components/Admin/AdminManagement/CreateAdminModal";
import AdminDetailModal from "../../../Components/Admin/AdminManagement/AdminDetailModal";
import ResetPasswordModal from "../../../Components/Admin/AdminManagement/ResetPasswordModal";
import ChangeEmailModal from "../../../Components/Admin/AdminManagement/ChangeEmailModal";
import ConfirmModal from "../../../Components/Common/ConfirmModal/ConfirmModal";
import SuccessModal from "../../../Components/Common/SuccessModal/SuccessModal";
import "./AdminManagement.css";

export default function AdminManagement() {
  const { roles } = useAuth();
  const navigate = useNavigate();

  // States
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
      };

      const response = await superAdminService.getAdmins(params);
      if (response.data?.success) {
        const data = response.data.data;
        setAdmins(data.items || data.Items || []);
        setTotalCount(data.totalCount || data.TotalCount || 0);
        setTotalPages(data.totalPages || data.TotalPages || 1);
      } else {
        toast.error(response.data?.message || "Không thể tải danh sách admins");
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Permission check - chỉ SuperAdmin mới có quyền
  const isSuperAdmin = roles.includes("SuperAdmin");

  if (!isSuperAdmin) {
    return (
      <UnauthorizedModal
        show={true}
        onClose={() => navigate('/admin')}
        feature="Admin Management"
      />
    );
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateSuccess = (message) => {
    setShowCreateModal(false);
    setSuccessMessage(message || "Tạo admin thành công!");
    setShowSuccessModal(true);
    fetchAdmins();
  };

  const handleViewDetail = async (admin) => {
    try {
      const response = await superAdminService.getAdminById(admin.userId || admin.UserId);
      if (response.data?.success) {
        setSelectedAdmin(response.data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error fetching admin detail:", error);
      toast.error("Không thể tải thông tin admin");
    }
  };

  const handleResetPassword = (admin) => {
    setSelectedAdmin(admin);
    setShowResetPasswordModal(true);
  };

  const handleChangeEmail = (admin) => {
    setSelectedAdmin(admin);
    setShowChangeEmailModal(true);
  };

  const handleDeleteClick = (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedAdmin) return;
    try {
      const userId = selectedAdmin.userId || selectedAdmin.UserId;
      const response = await superAdminService.deleteAdmin(userId);
      if (response.data?.success) {
        setSuccessMessage("Xóa admin thành công!");
        setShowSuccessModal(true);
        fetchAdmins();
      } else {
        toast.error(response.data?.message || "Không thể xóa admin");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("Lỗi kết nối");
    } finally {
      setShowDeleteModal(false);
      setSelectedAdmin(null);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (currentPage > 1) {
      items.push(
        <Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} />
      );
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    if (currentPage < totalPages) {
      items.push(
        <Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} />
      );
    }

    return <Pagination className="justify-content-center mt-4">{items}</Pagination>;
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "SuperAdmin": return "danger";
      case "ContentAdmin": return "primary";
      case "FinanceAdmin": return "success";
      default: return "secondary";
    }
  };

  return (
    <Container fluid className="admin-management-container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary m-0">
            <MdAdminPanelSettings className="me-2" size={32}/>
            Admin Management
          </h2>
          <p className="text-muted m-0">Quản lý tài khoản admin trong hệ thống</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)} className="shadow-sm">
          <FaPlus className="me-2" /> Tạo Admin Mới
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3">Admin</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Số điện thoại</th>
                      <th className="px-4 py-3">Vai trò</th>
                      <th className="px-4 py-3">Ngày tạo</th>
                      <th className="px-4 py-3 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.length > 0 ? (
                      admins.map((admin) => {
                        const userId = admin.userId || admin.UserId;
                        const fullName = admin.fullName || admin.FullName || "N/A";
                        const email = admin.email || admin.Email || "";
                        const phone = admin.phoneNumber || admin.PhoneNumber || "N/A";
                        const roles = admin.roles || admin.Roles || [];
                        const createdAt = admin.createdAt || admin.CreatedAt;

                        return (
                          <tr key={userId}>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center">
                                <div className="avatar-circle me-3">
                                  <FaUser size={16} />
                                </div>
                                <span className="fw-medium">{fullName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">{email}</td>
                            <td className="px-4 py-3">{phone}</td>
                            <td className="px-4 py-3">
                              {roles.map((role, index) => (
                                <Badge key={index} bg={getRoleBadgeColor(role)} className="me-1">
                                  {role}
                                </Badge>
                              ))}
                            </td>
                            <td className="px-4 py-3">
                              {createdAt ? new Date(createdAt).toLocaleDateString('vi-VN') : "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex justify-content-center gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleViewDetail(admin)}
                                  title="Xem chi tiết"
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => handleResetPassword(admin)}
                                  title="Reset mật khẩu"
                                >
                                  <FaKey />
                                </Button>
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  onClick={() => handleChangeEmail(admin)}
                                  title="Đổi email"
                                >
                                  <FaEnvelope />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteClick(admin)}
                                  title="Xóa admin"
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted">
                          Chưa có admin nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {renderPagination()}
        </>
      )}

      {/* Modals */}
      <CreateAdminModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <AdminDetailModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        admin={selectedAdmin}
      />

      <ResetPasswordModal
        show={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        admin={selectedAdmin}
        onSuccess={(message) => {
          setShowResetPasswordModal(false);
          setSuccessMessage(message);
          setShowSuccessModal(true);
        }}
      />

      <ChangeEmailModal
        show={showChangeEmailModal}
        onClose={() => setShowChangeEmailModal(false)}
        admin={selectedAdmin}
        onSuccess={(message) => {
          setShowChangeEmailModal(false);
          setSuccessMessage(message);
          setShowSuccessModal(true);
          fetchAdmins();
        }}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa admin"
        message={`Bạn có chắc chắn muốn xóa admin "${selectedAdmin?.fullName || selectedAdmin?.FullName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="delete"
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Thành công"
        message={successMessage}
      />
    </Container>
  );
}
