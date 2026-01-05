import React, { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { superAdminService } from "../../../Services/superAdminService";

export default function ResetPasswordModal({ show, onClose, admin, onSuccess }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      const userId = admin.userId || admin.UserId;
      const response = await superAdminService.resetAdminPassword(userId, {
        newPassword: newPassword,
      });

      if (response.data?.success) {
        onSuccess(response.data?.message || "Reset password thành công!");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(response.data?.message || "Không thể reset password");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setError(err.response?.data?.message || "Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Reset Password Admin</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="mb-3 p-3 bg-light rounded">
          <small className="text-muted d-block">Admin</small>
          <strong>{admin?.fullName || admin?.FullName}</strong>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu mới <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Xác nhận mật khẩu <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Đang xử lý..." : "Reset Password"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
