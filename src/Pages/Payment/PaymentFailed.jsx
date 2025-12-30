import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import "./Payment.css";

export default function PaymentFailed() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const reason = searchParams.get("reason");

    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (countdown === 0) {
            navigate("/home");
        }
    }, [countdown, navigate]);

    return (
        <div className="payment-container">
            <div className="payment-card" style={{ textAlign: "center", padding: "60px 40px" }}>
                <FaTimesCircle style={{ fontSize: "80px", color: "#ef4444", marginBottom: "20px" }} />
                <h1 className="payment-title" style={{ color: "#ef4444" }}>
                    Thanh toán thất bại
                </h1>
                {reason && (
                    <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "20px" }}>
                        {reason}
                    </p>
                )}
                <p style={{ fontSize: "14px", color: "#9ca3af" }}>
                    Đang chuyển về trang chủ trong {countdown} giây...
                </p>
            </div>
        </div>
    );
}






