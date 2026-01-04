import React from "react";
import { Table, Button, Badge } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function PackageList({ packages, onEdit, onDelete }) {
    const getLevelBadge = (level) => {
        const levels = ["Basic", "Standard", "Premium", "Professional"];
        const colors = ["secondary", "info", "warning", "danger"];
        const levelName = levels[level] || "Unknown";
        const color = colors[level] || "secondary";
        return <Badge bg={color}>{levelName}</Badge>;
    };

    const formatPrice = (price) => {
        if (!price || isNaN(price)) return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(0);
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="table-responsive">
            <Table hover className="align-middle shadow-sm bg-white rounded">
                <thead className="bg-light text-secondary">
                    <tr>
                        <th className="py-3 ps-4 border-0 rounded-start">ID</th>
                        <th className="py-3 border-0">Tên gói</th>
                        <th className="py-3 border-0">Cấp độ</th>
                        <th className="py-3 border-0">Giá</th>
                        <th className="py-3 border-0">Giới hạn (C/L/S)</th>
                        <th className="py-3 border-0 rounded-end text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {packages && packages.length > 0 ? (
                        packages.map((pkg) => (
                            <tr key={pkg.teacherPackageId || pkg.TeacherPackageId} className="border-bottom">
                                <td className="ps-4 fw-bold text-muted">#{pkg.teacherPackageId || pkg.TeacherPackageId}</td>
                                <td className="fw-medium text-primary">{pkg.packageName || pkg.PackageName}</td>
                                <td>{getLevelBadge(pkg.level !== undefined ? pkg.level : pkg.Level)}</td>
                                <td className="fw-bold text-success">{formatPrice(pkg.price || pkg.Price)}</td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <Badge bg="light" text="dark" className="border" title="Max Courses">
                                            <i className="fa fa-book me-1"></i>{pkg.maxCourses || pkg.MaxCourses}
                                        </Badge>
                                        <Badge bg="light" text="dark" className="border" title="Max Lessons">
                                            <i className="fa fa-file-text me-1"></i>{pkg.maxLessons || pkg.MaxLessons}
                                        </Badge>
                                        <Badge bg="light" text="dark" className="border" title="Max Students">
                                            <i className="fa fa-users me-1"></i>{pkg.maxStudents || pkg.MaxStudents}
                                        </Badge>
                                    </div>
                                </td>
                                <td className="text-center">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2 rounded-circle"
                                        style={{ width: '32px', height: '32px', padding: 0 }}
                                        onClick={() => onEdit(pkg)}
                                        title="Chỉnh sửa"
                                    >
                                        <FaEdit size={14} />
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="rounded-circle"
                                        style={{ width: '32px', height: '32px', padding: 0 }}
                                        onClick={() => onDelete(pkg)}
                                        title="Xóa"
                                    >
                                        <FaTrash size={14} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center py-5 text-muted">
                                <div className="d-flex flex-column align-items-center">
                                    <i className="fa fa-box-open fa-3x mb-3 opacity-50"></i>
                                    <p>Chưa có gói dịch vụ nào.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
}
