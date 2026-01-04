import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { teacherPackageService } from "../../../Services/teacherPackageService";
import { toast } from "react-toastify";

export default function PackageFormModal({ show, onClose, onSuccess, packageToEdit }) {
    const [formData, setFormData] = useState({
        packageName: "",
        level: 0,
        price: 0,
        durationMonths: 12,
        maxCourses: 0,
        maxLessons: 0,
        maxStudents: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (packageToEdit) {
            setFormData({
                packageName: packageToEdit.packageName || packageToEdit.PackageName,
                level: packageToEdit.level || packageToEdit.Level || 0,
                price: packageToEdit.price || packageToEdit.Price || 0,
                durationMonths: packageToEdit.durationMonths || packageToEdit.DurationMonths || 12,
                maxCourses: packageToEdit.maxCourses || packageToEdit.MaxCourses || 0,
                maxLessons: packageToEdit.maxLessons || packageToEdit.MaxLessons || 0,
                maxStudents: packageToEdit.maxStudents || packageToEdit.MaxStudents || 0
            });
        } else {
            setFormData({
                packageName: "",
                level: 0, // Basic
                price: 0,
                durationMonths: 12,
                maxCourses: 5,
                maxLessons: 50,
                maxStudents: 100
            });
        }
    }, [packageToEdit, show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "packageName" ? value : Number(value)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let response;
            if (packageToEdit) {
                const id = packageToEdit.teacherPackageId || packageToEdit.TeacherPackageId;
                response = await teacherPackageService.update(id, formData);
            } else {
                response = await teacherPackageService.create(formData);
            }

            if (response.data?.success) {
                toast.success(packageToEdit ? "Cập nhật gói thành công!" : "Tạo gói mới thành công!");
                onSuccess();
                onClose();
            } else {
                toast.error(response.data?.message || "Có lỗi xảy ra.");
            }
        } catch (error) {
            console.error("Error saving package:", error);
            toast.error(error.response?.data?.message || "Lỗi kết nối.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>{packageToEdit ? "Cập nhật Gói" : "Thêm Gói Mới"}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Tên gói <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="packageName"
                                    value={formData.packageName}
                                    onChange={handleChange}
                                    required
                                    placeholder="VD: Basic Plan"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Cấp độ (Level)</Form.Label>
                                <Form.Select
                                    name="level"
                                    value={formData.level}
                                    onChange={handleChange}
                                >
                                    <option value={0}>Basic</option>
                                    <option value={1}>Standard</option>
                                    <option value={2}>Premium</option>
                                    <option value={3}>Professional</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Giá (VND) <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Thời hạn (Tháng) <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="number"
                                    name="durationMonths"
                                    value={formData.durationMonths}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <h6 className="mt-4 mb-3 text-primary border-bottom pb-2">Giới hạn tài nguyên</h6>
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Max Khóa học</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="maxCourses"
                                    value={formData.maxCourses}
                                    onChange={handleChange}
                                    min="1"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Max Bài học</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="maxLessons"
                                    value={formData.maxLessons}
                                    onChange={handleChange}
                                    min="1"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Max Học viên</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="maxStudents"
                                    value={formData.maxStudents}
                                    onChange={handleChange}
                                    min="1"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Hủy
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? "Đang lưu..." : "Lưu"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
