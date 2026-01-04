import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Payment.css";
import { paymentService } from "../../Services/paymentService";
import { teacherPackageService } from "../../Services/teacherPackageService";
import { courseService } from "../../Services/courseService";
import { FaArrowLeft, FaCheckCircle, FaClock } from "react-icons/fa";
import MainHeader from "../../Components/Header/MainHeader";

export default function Payment() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const packageId = searchParams.get("packageId"); // teacherPackageId từ Home
    const packageType = searchParams.get("package"); // fallback: packageType string
    const courseId = searchParams.get("courseId"); // courseId for course payment
    const typeproduct = searchParams.get("typeproduct"); // 1 for Course, 2 for TeacherPackage

    const [qrCode, setQrCode] = useState("");
    const [checkoutUrl, setCheckoutUrl] = useState("");
    const [paymentId, setPaymentId] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, checking, completed

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
        let isCancelled = false; // Flag to prevent state updates after unmount
        
        const processPayment = async () => {
            try {
                if (isCancelled) return; // Don't proceed if component unmounted
                
                setLoading(true);
                setError("");

                let productId = null;
                let productType = null;

                // Check if this is a course payment
                if (courseId && typeproduct === "1") {
                    const courseResponse = await courseService.getCourseById(courseId);
                    if (isCancelled) return; // Check after async operation
                    
                    if (courseResponse.data?.success && courseResponse.data?.data) {
                        setSelectedCourse(courseResponse.data.data);
                        productId = parseInt(courseId);
                        productType = 1; // ProductType.Course = 1
                    } else {
                        setError("Không tìm thấy khóa học");
                        setLoading(false);
                        return;
                    }
                }
                // Check if this is a teacher package payment
                else if (packageId || packageType) {
                    let selectedPackage = null;

                    // Nếu có packageId, sử dụng trực tiếp
                    if (packageId) {
                        const packagesResponse = await teacherPackageService.getAll();
                        if (isCancelled) return; // Check after async operation
                        
                        const packages = packagesResponse.data?.data || [];
                        selectedPackage = packages.find(
                            (pkg) => pkg.teacherPackageId === parseInt(packageId)
                        );
                    } 
                    // Nếu không có packageId, tìm theo packageType (backward compatibility)
                    else if (packageType) {
                        const packagesResponse = await teacherPackageService.getAll();
                        if (isCancelled) return; // Check after async operation
                        
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

                    setSelectedPackage(selectedPackage);
                    productId = selectedPackage.teacherPackageId;
                    productType = 2; // ProductType.TeacherPackage = 2
                } else {
                    setError("Không tìm thấy sản phẩm cần thanh toán");
                    setLoading(false);
                    return;
                }

                // Create payment record
                // Generate unique IdempotencyKey to prevent duplicate payments
                const idempotencyKey = `${Date.now()}-${productId}-${productType}`;
                
                console.log("Creating payment with:", { 
                    ProductId: productId, 
                    typeproduct: productType,
                    IdempotencyKey: idempotencyKey
                });
                
                const paymentResponse = await paymentService.processPayment({
                    ProductId: productId,
                    typeproduct: productType,
                    IdempotencyKey: idempotencyKey
                });
                
                if (isCancelled) return; // Check after async operation
                console.log("Payment response:", paymentResponse.data);

                if (!paymentResponse.data?.success || !paymentResponse.data?.data?.paymentId) {
                    throw new Error(paymentResponse.data?.message || "Không thể tạo thanh toán");
                }

                const createdPaymentId = paymentResponse.data.data.paymentId;
                setPaymentId(createdPaymentId);

                // Create PayOS link to get QR code and checkout URL
                console.log("Creating PayOS link for payment:", createdPaymentId);
                const payOsResponse = await paymentService.createPayOsLink(createdPaymentId);
                
                if (isCancelled) return; // Check after async operation
                console.log("PayOS response:", payOsResponse.data);

                if (!payOsResponse.data?.success || !payOsResponse.data?.data) {
                    throw new Error(payOsResponse.data?.message || "Không thể tạo link thanh toán");
                }

                const qrCodeUrl = payOsResponse.data.data.qrCode;
                const checkoutLink = payOsResponse.data.data.checkoutUrl;

                setQrCode(qrCodeUrl);
                setCheckoutUrl(checkoutLink);
                setLoading(false);
            } catch (error) {
                console.error("Error processing payment:", error);
                console.error("Error details:", {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                
                let errorMessage = "Có lỗi xảy ra khi xử lý thanh toán";
                
                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response?.data?.errors) {
                    // Handle validation errors
                    const errors = error.response.data.errors;
                    errorMessage = Object.values(errors).flat().join(", ");
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                setError(errorMessage);
                setLoading(false);
            }
        };

        if (courseId || packageId || packageType) {
            processPayment();
        } else {
            setError("Không tìm thấy sản phẩm cần thanh toán");
            setLoading(false);
        }
        
        // Cleanup function to prevent state updates after unmount
        return () => {
            isCancelled = true;
        };
    }, [courseId, packageId, packageType, typeproduct]);

    const handleBack = () => {
        navigate("/home");
    };

    const handleOpenCheckout = () => {
        if (checkoutUrl) {
            window.open(checkoutUrl, "_blank");
        }
    };

    return (
        <>
            <MainHeader />
            <div className="payment-container">
                {/* header intentionally left minimal for checkout */}

                <div className="payment-card">
                    {loading ? (
                        <>
                            <h1 className="payment-title">Đang xử lý thanh toán...</h1>
                            <div className="payment-loading">
                                <div className="spinner"></div>
                                <p>Vui lòng đợi trong giây lát</p>
                            </div>
                        </>
                    ) : error ? (
                        <>
                            <h1 className="payment-title">Có lỗi xảy ra</h1>
                            <div className="payment-error">{error}</div>
                            <button className="btn-back" onClick={handleBack}>
                                Quay lại trang chủ
                            </button>
                        </>
                    ) : (
                        <>
                            <h1 className="payment-title">Thanh toán</h1>
                            
                            {selectedCourse && (
                                <div className="package-info">
                                    <h3>{selectedCourse.title}</h3>
                                    <p className="package-price">
                                        {selectedCourse.price > 0 
                                            ? `${selectedCourse.price.toLocaleString("vi-VN")}đ`
                                            : "Miễn phí"}
                                    </p>
                                </div>
                            )}
                            
                            {selectedPackage && (
                                <div className="package-info">
                                    <h3>{selectedPackage.packageName}</h3>
                                    <p className="package-price">
                                        {selectedPackage.price > 0 
                                            ? `${selectedPackage.price.toLocaleString("vi-VN")}đ/tháng`
                                            : "Miễn phí"}
                                    </p>
                                </div>
                            )}

                            <div className="payment-methods">
                                <div className="payment-method web-method">
                                    <h2 className="method-title">
                                        <FaCheckCircle /> Thanh toán trực tuyến
                                    </h2>
                                    <p className="method-description">
                                        Thanh toán nhanh chóng qua cổng thanh toán PayOS
                                    </p>
                                    <button className="btn-checkout" onClick={handleOpenCheckout}>
                                        Mở trang thanh toán
                                    </button>
                                </div>
                            </div>

                            <div className="payment-note">
                                <p>
                                    💡 <strong>Lưu ý:</strong> Sau khi thanh toán thành công, 
                                    bạn sẽ được chuyển hướng tự động. Vui lòng không đóng trang này.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

