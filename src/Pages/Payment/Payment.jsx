import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Payment.css";
import { paymentService } from "../../Services/paymentService";
import { teacherPackageService } from "../../Services/teacherPackageService";
import { FaArrowLeft } from "react-icons/fa";

export default function Payment() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const packageId = searchParams.get("packageId"); // teacherPackageId từ Home
    const packageType = searchParams.get("package"); // fallback: packageType string
    const courseId = searchParams.get("courseId"); // courseId từ CourseDetail
    const paymentIdParam = searchParams.get("paymentId"); // paymentId đã tạo sẵn từ CourseDetail

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Helper function để parse error message từ backend
    const parseErrorMessage = (error) => {
        if (!error) return "Có lỗi xảy ra khi xử lý thanh toán";
        
        const response = error.response;
        if (!response?.data) return error.message || "Có lỗi xảy ra khi xử lý thanh toán";

        const data = response.data;
        return (
            data.message ||
            data.Message ||
            data.detail ||
            data.error ||
            (typeof data === 'string' ? data : JSON.stringify(data)) ||
            error.message ||
            "Có lỗi xảy ra khi xử lý thanh toán"
        );
    };

    useEffect(() => {
        const processPayment = async () => {
            try {
                setLoading(true);
                setError("");

                let currentPaymentId = null;

                // Case 1: Có paymentId sẵn (từ CourseDetail)
                if (paymentIdParam) {
                    currentPaymentId = parseInt(paymentIdParam);
                }
                // Case 2: Có courseId - tạo payment mới cho Course
                else if (courseId) {
                    const paymentResponse = await paymentService.processPayment({
                        ProductId: parseInt(courseId),
                        typeproduct: 1 // ProductType.Course = 1
                    });
                    currentPaymentId = paymentResponse.data.data.paymentId;
                }
                // Case 3: Có packageId - tạo payment mới cho TeacherPackage
                else if (packageId || packageType) {
                    let selectedPackage = null;

                    if (packageId) {
                        const packagesResponse = await teacherPackageService.getAll();
                        const packages = packagesResponse.data?.data || [];
                        selectedPackage = packages.find(
                            (pkg) => pkg.teacherPackageId === parseInt(packageId)
                        );
                    } else if (packageType) {
                        const packagesResponse = await teacherPackageService.getAll();
                        const packages = packagesResponse.data?.data || [];
                        selectedPackage = packages.find(
                            (pkg) => pkg.packageName?.toLowerCase().includes(packageType?.toLowerCase() || "")
                        );
                    }

                    if (!selectedPackage) {
                        setError("Không tìm thấy gói đăng ký");
                        setLoading(false);
                        return;
                    }

                    // ✅ SỬA: GỬI SỐ 2 THAY VÌ STRING "TeacherPackage"
                    // ProductType enum: Course = 1, TeacherPackage = 2
                    const paymentResponse = await paymentService.processPayment({
                        ProductId: selectedPackage.teacherPackageId,
                        typeproduct: 2 // ProductType.TeacherPackage = 2
                    });
                    currentPaymentId = paymentResponse.data.data.paymentId;
                } else {
                    setError("Không tìm thấy thông tin thanh toán");
                    setLoading(false);
                    return;
                }

                // Tạo PayOS link để lấy checkoutUrl
                const payOsResponse = await paymentService.createPayOsLink(currentPaymentId);
                const url = payOsResponse.data.data.checkoutUrl; // ✅ Đọc checkoutUrl

                if (!url) {
                    setError("Không thể tạo link thanh toán");
                    setLoading(false);
                    return;
                }

                // ✅ Redirect trực tiếp đến trang PayOS
                window.location.href = url;
            } catch (error) {
                console.error("Error processing payment:", error);
                // ✅ CẢI THIỆN HIỂN THỊ LỖI
                const errorMsg = parseErrorMessage(error);
                setError(errorMsg);
                setLoading(false);
            }
        };

        processPayment();
    }, [packageId, packageType, courseId, paymentIdParam]);

    const handleBack = () => {
        navigate("/home");
    };

    return (
        <div className="payment-container">
            <div className="payment-header">
                <button className="back-button" onClick={handleBack}>
                    <FaArrowLeft /> Quay lại
                </button>
            </div>

            <div className="payment-card">
                <h1 className="payment-title">Thanh toán PayOS</h1>

                {loading ? (
                    <div className="payment-loading">Đang chuyển hướng đến trang thanh toán...</div>
                ) : error ? (
                    <div className="payment-error">{error}</div>
                ) : null}
            </div>
        </div>
    );
}

