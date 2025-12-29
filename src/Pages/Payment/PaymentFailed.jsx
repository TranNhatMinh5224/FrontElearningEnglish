import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./PaymentSuccess.css"; // Reuse same styles
import { FaTimesCircle } from "react-icons/fa";

export default function PaymentFailed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");

  const handleGoHome = () => {
    navigate("/home");
  };

  const handleRetry = () => {
    navigate("/home"); // Navigate to home to select package again
  };

  return (
    <div className="payment-result-container">
      <div className="payment-result-card error">
        <div className="success-icon-wrapper">
          <FaTimesCircle className="error-icon" />
        </div>
        
        <h1 className="result-title">Thanh toán thất bại</h1>
        <p className="result-message">
          Rất tiếc, giao dịch của bạn không thể hoàn tất. Vui lòng thử lại.
        </p>

        {reason && (
          <div className="error-reason">
            <strong>Lý do:</strong> {decodeURIComponent(reason)}
          </div>
        )}

        <div className="action-buttons">
          <button className="btn-primary" onClick={handleRetry}>
            Thử lại
          </button>
          <button className="btn-secondary" onClick={handleGoHome}>
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

