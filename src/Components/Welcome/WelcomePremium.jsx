
import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import "./WelcomePremium.css";

export default function WelcomePremium() {
  const navigate = useNavigate();

  return (
    <section className="welcome-premium">
      <Container className="premium-content">
        <div className="premium-header">
          <h2 className="premium-title">Nâng cấp tài khoản</h2>
          <h3 className="premium-subtitle">Catalunya English Premium</h3>
          <Badge bg="info" className="premium-badge" style={{ fontSize: 14, fontWeight: 600 }}>
            Ưu đãi 30% cho học viên Việt Nam
          </Badge>
        </div>
        <Row className="premium-plans">
          <Col md={6} className="mb-4">
            <Card className="plan-card h-100">
              <Card.Body>
                <div className="plan-header">
                  <span className="plan-label">Gói 1 năm</span>
                  <div className="plan-price">
                    <span className="price-old">1.049.000</span>
                    <span className="price-new">749.000</span>
                    <span className="price-currency">đ</span>
                  </div>
                </div>
                <ul className="plan-features">
                  <li>✓ Truy cập không giới hạn</li>
                  <li>✓ Học mọi lúc mọi nơi</li>
                  <li>✓ Hỗ trợ 24/7</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="plan-card featured h-100" border="primary">
              <Card.Body>
                <div className="plan-badge-hot">HOT!</div>
                <div className="plan-header">
                  <span className="plan-label">Gói 3 năm</span>
                  <div className="plan-price">
                    <span className="price-old">2.099.000</span>
                    <span className="price-new">1.499.000</span>
                    <span className="price-currency">đ</span>
                  </div>
                </div>
                <ul className="plan-features">
                  <li>✓ Tiết kiệm hơn 30%</li>
                  <li>✓ Truy cập không giới hạn</li>
                  <li>✓ Học mọi lúc mọi nơi</li>
                  <li>✓ Hỗ trợ 24/7</li>
                  <li>✓ Ưu đãi đặc biệt</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
       
      </Container>
    </section>
  );
}

