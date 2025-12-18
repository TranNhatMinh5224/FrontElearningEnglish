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

    const [qrCode, setQrCode] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const processPayment = async () => {
            try {
                setLoading(true);
                setError("");

                let selectedPackage = null;

                // Nếu có packageId, sử dụng trực tiếp
                if (packageId) {
                    const packagesResponse = await teacherPackageService.getAll();
                    const packages = packagesResponse.data?.data || [];
                    selectedPackage = packages.find(
                        (pkg) => pkg.teacherPackageId === parseInt(packageId)
                    );
                } 
                // Nếu không có packageId, tìm theo packageType (backward compatibility)
                else if (packageType) {
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

                // 2. Tạo payment với ProductType = TeacherPackage
                const paymentResponse = await paymentService.processPayment({
                    ProductId: selectedPackage.teacherPackageId,
                    typeproduct: "TeacherPackage"
                });

                const paymentId = paymentResponse.data.data.paymentId;

                // 3. Tạo PayOS link để lấy QR code
                const payOsResponse = await paymentService.createPayOsLink(paymentId);
                const qrCodeUrl = payOsResponse.data.data.qrCode;

                setQrCode(qrCodeUrl);
                setLoading(false);
            } catch (error) {
                console.error("Error processing payment:", error);
                setError(error.response?.data?.message || "Có lỗi xảy ra khi xử lý thanh toán");
                setLoading(false);
            }
        };

        if (packageId || packageType) {
            processPayment();
        } else {
            setError("Không tìm thấy loại gói đăng ký");
            setLoading(false);
        }
    }, [packageId, packageType]);

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
                <h1 className="payment-title">Chuyển khoản ngân hàng</h1>

                {loading ? (
                    <div className="payment-loading">Đang tải...</div>
                ) : error ? (
                    <div className="payment-error">{error}</div>
                ) : (
                    <>
                        <div className="qr-code-wrapper">
                            <img src={qrCode} alt="QR Code" className="qr-code" />
                        </div>

                        <div className="payment-logos">
                            <div className="payment-logo vietqr">VIETQR</div>
                            <div className="payment-logo napas">napas 247</div>
                        </div>

                        <div className="payment-instructions">
                            <div className="instruction-step">
                                Bước 1: Mở ứng dụng ngân hàng/ví điện tử.
                            </div>
                            <div className="instruction-step">
                                Bước 2: Quét mã QR. Xác nhận thanh toán.
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

