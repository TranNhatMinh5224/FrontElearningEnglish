import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import "./AuthCallback.css";

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code and state from URL
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const errorParam = searchParams.get("error");

        // Check for OAuth errors
        if (errorParam) {
          setError("Đăng nhập bằng Google đã bị hủy hoặc có lỗi xảy ra.");
          setLoading(false);
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        // Validate code and state
        if (!code || !state) {
          setError("Thiếu thông tin xác thực. Vui lòng thử lại.");
          setLoading(false);
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        // Verify state token (CSRF protection) - warning only, not blocking
        const storedState = sessionStorage.getItem("google_oauth_state");
        sessionStorage.removeItem("google_oauth_state");

        if (storedState && storedState !== state) {
          console.warn("State mismatch - possible CSRF, but proceeding with login");
        }

        // Send code and state to backend - let backend handle final validation
        await googleLogin(
          {
            Code: code,
            State: state,
          },
          navigate
        );
        
        // If we reach here, login succeeded - googleLogin will handle redirect
        // No need to set loading=false or show error
      } catch (err) {
        console.error("Google callback error:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Đăng nhập bằng Google thất bại.";
        setError(errorMessage);
        setLoading(false);
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, googleLogin]);

  return (
    <div className="auth-callback-container">
      <div className="auth-callback-card">
        {loading ? (
          <>
            <div className="auth-callback-spinner"></div>
            <p>Đang xử lý đăng nhập Google...</p>
          </>
        ) : (
          <>
            <div className="auth-callback-error">⚠️</div>
            <p>{error || "Có lỗi xảy ra"}</p>
            <p className="auth-callback-redirect">
              Đang chuyển hướng về trang đăng nhập...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

