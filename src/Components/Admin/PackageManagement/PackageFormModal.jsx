import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { teacherPackageService } from "../../../Services/teacherPackageService";
import { toast } from "react-toastify";
import "./PackageFormModal.css";

export default function PackageFormModal({ show, onClose, onSuccess, packageToEdit }) {
    const [formData, setFormData] = useState({
        packageName: "",
        level: 1,  // Basic = 1 in backend enum
        price: 0,
        maxCourses: 5,
        maxLessons: 50,
        maxStudents: 100
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (packageToEdit) {
            setFormData({
                packageName: packageToEdit.packageName || packageToEdit.PackageName,
                level: packageToEdit.level || packageToEdit.Level || 1,  // Basic = 1
                price: packageToEdit.price || packageToEdit.Price || 0,
                maxCourses: packageToEdit.maxCourses || packageToEdit.MaxCourses || 5,
                maxLessons: packageToEdit.maxLessons || packageToEdit.MaxLessons || 50,
                maxStudents: packageToEdit.maxStudents || packageToEdit.MaxStudents || 100
            });
        } else {
            setFormData({
                packageName: "",
                level: 1, // Basic = 1
                price: 0,
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
            // Prepare data matching backend DTO exactly
            const dataToSend = {
                packageName: formData.packageName,
                level: Number(formData.level),
                price: Number(formData.price),
                maxCourses: Number(formData.maxCourses),
                maxLessons: Number(formData.maxLessons),
                maxStudents: Number(formData.maxStudents)
            };

            console.log("Data being sent to API:", dataToSend);

            let response;
            if (packageToEdit) {
                const id = packageToEdit.teacherPackageId || packageToEdit.TeacherPackageId;
                response = await teacherPackageService.update(id, dataToSend);
            } else {
                response = await teacherPackageService.create(dataToSend);
            }

            console.log("API Response:", response);

            if (response.data?.success) {
                const message = packageToEdit ? "Cập nhật gói thành công!" : "Tạo gói mới thành công!";
                onClose();
                onSuccess(message);
            } else {
                toast.error(response.data?.message || "Có lỗi xảy ra.");
            }
        } catch (error) {
            console.error("Error saving package:", error);
            console.error("Error details:", error.response?.data);
            toast.error(error.response?.data?.message || error.response?.data?.title || "Lỗi kết nối.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            show={show} 
            onHide={onClose} 
            centered 
            className="package-form-modal"
            dialogClassName="package-form-modal-dialog"
        >
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
                                    <option value={1}>Basic</option>
                                    <option value={2}>Standard</option>
                                    <option value={3}>Premium</option>
                                    <option value={4}>Professional</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col md={12}>
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
