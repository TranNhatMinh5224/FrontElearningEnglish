import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";
import { paymentService } from "../../Services/paymentService";
import { enrollmentService } from "../../Services/enrollmentService";
import "./Payment.css";

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const paymentId = searchParams.get("paymentId");
    const courseId = searchParams.get("courseId");
    const orderCode = searchParams.get("orderCode");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [enrolled, setEnrolled] = useState(false);

    useEffect(() => {
        const confirmPayment = async () => {
            if (!paymentId) {
                setError("Không tìm thấy thông tin thanh toán");
                setLoading(false);
                return;
            }

            try {
                const response = await paymentService.confirmPayOs(parseInt(paymentId));

                if (response.data?.success) {
                    try {
                        const detailResponse = await paymentService.getTransactionDetail(parseInt(paymentId));
                        if (detailResponse.data?.success && detailResponse.data?.data) {
                            const payment = detailResponse.data.data;
                            const productId = payment.productId;
                            const productType = payment.productType;

                            if (productType === 1 && productId) {
                                try {
                                    await enrollmentService.enroll({ courseId: productId });
                                    setEnrolled(true);
                                } catch (enrollErr) {
                                    const enrollErrorMsg = enrollErr.response?.data?.message || "";
                                    if (
                                        enrollErrorMsg.includes("đã đăng ký") ||
                                        enrollErrorMsg.includes("already enrolled")
                                    ) {
                                        setEnrolled(true);
                                    } else {
                                        setEnrolled(true);
                                    }
                                }
                            }
                        }
                    } catch (detailErr) {
                    }

                    setLoading(false);
                } else {
                    setError(response.data?.message || "Không thể xác nhận thanh toán");
                    setLoading(false);
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message;
                if (errorMsg?.includes("Payment not completed on PayOS")) {
                    try {
                        const statusResponse = await paymentService.getTransactionDetail(parseInt(paymentId));
                        if (statusResponse.data?.success && statusResponse.data?.data) {
                            const status = statusResponse.data.data.status;
                            if (status === 2 || status === "Completed" || status === "completed") {
                                setLoading(false);
                                return;
                            }
                        }
                    } catch (statusErr) {
                    }
                }
                setError(errorMsg || "Có lỗi xảy ra khi xác nhận thanh toán");
                setLoading(false);
            }
        };

        confirmPayment();
    }, [paymentId]);

    const handleGoHome = () => {
        navigate("/home");
    };

    const handleGoToCourse = async () => {
        if (!courseId) {
            try {
                const detailResponse = await paymentService.getTransactionDetail(parseInt(paymentId));
                if (detailResponse.data?.success && detailResponse.data?.data) {
                    const payment = detailResponse.data.data;
                    if (payment.productType === 1 && payment.productId) {
                        navigate(`/course/${payment.productId}`);
                        return;
                    }
                }
            } catch (err) {
            }
            handleGoHome();
        } else {
            navigate(`/course/${courseId}`);
        }
    };

    if (loading) {
        return (
            <div className="payment-container">
                <div className="payment-card" style={{ textAlign: "center", padding: "60px 40px" }}>
                    <FaSpinner
                        className="fa-spin"
                        style={{ fontSize: "80px", color: "#3b82f6", marginBottom: "20px" }}
                    />
                    <h1 className="payment-title" style={{ color: "#3b82f6" }}>
                        Đang xác nhận thanh toán...
                    </h1>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-container">
                <div className="payment-card" style={{ textAlign: "center", padding: "60px 40px" }}>
                    <h1 className="payment-title" style={{ color: "#ef4444" }}>
                        Xác nhận thanh toán thất bại
                    </h1>
                    <p style={{ fontSize: "18px", color: "#6b7280", marginBottom: "30px" }}>{error}</p>
                    <button
                        onClick={handleGoHome}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-container">
            <div className="payment-card" style={{ textAlign: "center", padding: "60px 40px" }}>
                <FaCheckCircle style={{ fontSize: "80px", color: "#10b981", marginBottom: "20px" }} />
                <h1 className="payment-title" style={{ color: "#10b981" }}>
                    Thanh toán thành công!
                </h1>
                <p style={{ fontSize: "18px", color: "#6b7280", marginBottom: "30px" }}>
                    Cảm ơn bạn đã thanh toán. Giao dịch của bạn đã được xử lý thành công.
                </p>
                {orderCode && (
                    <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "20px" }}>
                        Mã giao dịch: {orderCode}
                    </p>
                )}
                {enrolled && (
                    <p
                        style={{
                            fontSize: "16px",
                            color: "#10b981",
                            fontWeight: "600",
                            marginBottom: "20px",
                        }}
                    >
                        Bạn đã được đăng ký vào khóa học!
                    </p>
                )}
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "20px" }}>
                    {enrolled && (
                        <button
                            onClick={handleGoToCourse}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "white",
                                color: "#3b82f6",
                                border: "2px solid #3b82f6",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                        >
                            Xem khóa học
                        </button>
                    )}
                    <button
                        onClick={handleGoHome}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
}



