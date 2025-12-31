import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "./CreateQuizModal.css";

const QUIZ_TYPES = [
    { value: 1, label: "Practice" },
    { value: 2, label: "MiniTest" },
    { value: 3, label: "FinalExam" },
];

export default function CreateQuizModal({ show, onClose, onSubmit }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [quizType, setQuizType] = useState(1);
    const [duration, setDuration] = useState("");
    const [isPublished, setIsPublished] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!show) {
            // Reset form when modal closes
            setTitle("");
            setDescription("");
            setQuizType(1);
            setDuration("");
            setIsPublished(false);
            setErrors({});
        }
    }, [show]);

    const validateForm = () => {
        const newErrors = {};
        if (!title.trim()) {
            newErrors.title = "Tiêu đề là bắt buộc";
        }
        if (duration && (isNaN(duration) || parseInt(duration) <= 0)) {
            newErrors.duration = "Thời gian phải là số dương";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const quizData = {
            title: title.trim(),
            description: description.trim() || null,
            type: quizType,
            duration: duration ? parseInt(duration) : null,
            isPublished: isPublished,
        };

        onSubmit(quizData);
    };

    return (
        <Modal show={show} onHide={onClose} centered className="create-quiz-modal">
            <Modal.Header closeButton>
                <Modal.Title>Tạo Quiz mới</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            Tiêu đề <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            isInvalid={!!errors.title}
                            placeholder="Nhập tiêu đề quiz"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.title}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Mô tả</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Nhập mô tả quiz (tùy chọn)"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Loại Quiz</Form.Label>
                        <Form.Select
                            value={quizType}
                            onChange={(e) => setQuizType(parseInt(e.target.value))}
                        >
                            {QUIZ_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Thời gian (phút)</Form.Label>
                        <Form.Control
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            isInvalid={!!errors.duration}
                            placeholder="Nhập thời gian làm bài (tùy chọn)"
                            min="1"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.duration}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            Để trống nếu không giới hạn thời gian
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label="Công khai cho học sinh (Published)"
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                        />
                        <Form.Text className="text-muted">
                            Nếu bật, học sinh sẽ nhìn thấy quiz này
                        </Form.Text>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Hủy
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!title.trim()}
                    className="create-quiz-submit-btn"
                >
                    Tạo Quiz
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

