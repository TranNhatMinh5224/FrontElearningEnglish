import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./PaymentSuccess.css";
import { FaCheckCircle } from "react-icons/fa";
import { paymentService } from "../../Services/paymentService";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const orderCode = searchParams.get("orderCode");
  
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!paymentId) {
        setLoading(false);
        return;
      }

      try {
        const response = await paymentService.getTransactionDetail(paymentId);
        if (response.data?.success && response.data?.data) {
          setPaymentDetails(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId]);

  const handleGoHome = () => {
    navigate("/home");
  };

  const handleViewHistory = () => {
    navigate("/payment-history");
  };

  return (
    <div className="payment-result-container">
      <div className="payment-result-card success">
        <div className="success-icon-wrapper">
          <FaCheckCircle className="success-icon" />
        </div>
        
        <h1 className="result-title">Thanh toán thành công!</h1>
        <p className="result-message">
          Cảm ơn bạn đã thanh toán. Giao dịch của bạn đã được xử lý thành công.
        </p>

        {loading ? (
          <div className="payment-details loading">
            <p>Đang tải thông tin giao dịch...</p>
          </div>
        ) : paymentDetails ? (
          <div className="payment-details">
            <div className="detail-row">
              <span className="detail-label">Mã giao dịch:</span>
              <span className="detail-value">{orderCode || paymentDetails.paymentId}</span>
            </div>
            {paymentDetails.productName && (
              <div className="detail-row">
                <span className="detail-label">Sản phẩm:</span>
                <span className="detail-value">{paymentDetails.productName}</span>
              </div>
            )}
            {paymentDetails.amount !== undefined && (
              <div className="detail-row">
                <span className="detail-label">Số tiền:</span>
                <span className="detail-value amount">
                  {paymentDetails.amount.toLocaleString("vi-VN")}đ
                </span>
              </div>
            )}
            {paymentDetails.paidAt && (
              <div className="detail-row">
                <span className="detail-label">Thời gian:</span>
                <span className="detail-value">
                  {new Date(paymentDetails.paidAt).toLocaleString("vi-VN")}
                </span>
              </div>
            )}
          </div>
        ) : null}

        <div className="action-buttons">
          <button className="btn-primary" onClick={handleGoHome}>
            Về trang chủ
          </button>
          <button className="btn-secondary" onClick={handleViewHistory}>
            Xem lịch sử giao dịch
          </button>
        </div>
      </div>
    </div>
  );
}

