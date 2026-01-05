import React, { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { superAdminService } from "../../../Services/superAdminService";

export default function ChangeEmailModal({ show, onClose, admin, onSuccess }) {
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newEmail || !newEmail.includes("@")) {
      setError("Email không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      const userId = admin.userId || admin.UserId;
      const response = await superAdminService.changeAdminEmail(userId, {
        newEmail: newEmail,
      });

      if (response.data?.success) {
        onSuccess(response.data?.message || "Đổi email thành công!");
        setNewEmail("");
      } else {
        setError(response.data?.message || "Không thể đổi email");
      }
    } catch (err) {
      console.error("Error changing email:", err);
      setError(err.response?.data?.message || "Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Đổi Email Admin</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="mb-3 p-3 bg-light rounded">
          <div className="mb-2">
            <small className="text-muted d-block">Admin</small>
            <strong>{admin?.fullName || admin?.FullName}</strong>
          </div>
          <div>
            <small className="text-muted d-block">Email hiện tại</small>
            <strong>{admin?.email || admin?.Email}</strong>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email mới <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="newemail@example.com"
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
          {loading ? "Đang xử lý..." : "Đổi Email"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
