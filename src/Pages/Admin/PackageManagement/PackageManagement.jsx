import React, { useState, useEffect } from "react";
import { Container, Button, Row, Col, Card } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import PackageList from "../../../Components/Admin/PackageManagement/PackageList";
import PackageFormModal from "../../../Components/Admin/PackageManagement/PackageFormModal";
import ConfirmModal from "../../../Components/Common/ConfirmModal/ConfirmModal";
import SuccessModal from "../../../Components/Common/SuccessModal/SuccessModal";
import { teacherPackageService } from "../../../Services/teacherPackageService";
import { toast } from "react-toastify";
// import "./PackageManagement.css"; // Create CSS if needed

export default function PackageManagement() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);
    const [packageToEdit, setPackageToEdit] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const response = await teacherPackageService.getAllAdmin();
            if (response.data?.success) {
                setPackages(response.data.data);
            } else {
                toast.error("Không thể tải danh sách gói dịch vụ.");
            }
        } catch (error) {
            console.error("Error fetching packages:", error);
            toast.error("Lỗi kết nối.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setPackageToEdit(null);
        setShowFormModal(true);
    };

    const handleEdit = (pkg) => {
        setPackageToEdit(pkg);
        setShowFormModal(true);
    };

    const handleFormSuccess = (message) => {
        fetchPackages();
        if (message) {
            setSuccessMessage(message);
            setShowSuccessModal(true);
        }
    };

    const handleDeleteClick = (pkg) => {
        setPackageToDelete(pkg);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!packageToDelete) return;
        try {
            const id = packageToDelete.teacherPackageId || packageToDelete.TeacherPackageId;
            const response = await teacherPackageService.delete(id);
            if (response.data?.success) {
                setSuccessMessage("Xóa gói dịch vụ thành công!");
                setShowSuccessModal(true);
                fetchPackages();
            } else {
                toast.error(response.data?.message || "Không thể xóa gói dịch vụ.");
            }
        } catch (error) {
            console.error("Error deleting package:", error);
            toast.error("Lỗi kết nối.");
        } finally {
            setShowDeleteModal(false);
            setPackageToDelete(null);
        }
    };

    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-primary m-0">Quản lý Gói Giáo Viên</h2>
                    <p className="text-muted m-0">Quản lý các gói đăng ký dành cho giáo viên</p>
                </div>
                <Button variant="primary" onClick={handleCreate} className="shadow-sm">
                    <FaPlus className="me-2" /> Thêm mới
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <PackageList
                            packages={packages}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                        />
                    )}
                </Card.Body>
            </Card>

            <PackageFormModal
                show={showFormModal}
                onClose={() => setShowFormModal(false)}
                onSuccess={handleFormSuccess}
                packageToEdit={packageToEdit}
            />

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Xác nhận xóa"
                message={`Bạn có chắc chắn muốn xóa gói "${packageToDelete?.packageName || packageToDelete?.PackageName}"? Hành động này không thể hoàn tác.`}
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
