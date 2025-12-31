import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "./GroupManager.css";

export default function GroupManager({ isOpen, onClose, onSave }) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sumScore, setSumScore] = useState(0);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Tên là bắt buộc";
    }

    if (!title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      name: name.trim(),
      title: title.trim(),
      description: description.trim() || null,
      sumScore: parseFloat(sumScore) || 0,
    });

    // Reset form
    setName("");
    setTitle("");
    setDescription("");
    setSumScore(0);
    setErrors({});
  };

  const handleClose = () => {
    setName("");
    setTitle("");
    setDescription("");
    setSumScore(0);
    setErrors({});
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Tạo Group</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>
              Tên <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, name: null });
              }}
              isInvalid={!!errors.name}
              placeholder="Nhập tên group"
            />
            {errors.name && (
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Tiêu đề <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors({ ...errors, title: null });
              }}
              isInvalid={!!errors.title}
              placeholder="Nhập tiêu đề group"
            />
            {errors.title && (
              <Form.Control.Feedback type="invalid">
                {errors.title}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả group (không bắt buộc)"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tổng điểm</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.1"
              value={sumScore}
              onChange={(e) => setSumScore(e.target.value)}
              placeholder="0"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Tạo
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

