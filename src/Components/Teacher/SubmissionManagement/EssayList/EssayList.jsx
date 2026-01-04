import React, { useState, useEffect } from "react";
import { Card, Spinner } from "react-bootstrap";
import { FaFileAlt } from "react-icons/fa";
import { essayService } from "../../../../Services/essayService";
import "./EssayList.css";

export default function EssayList({ assessmentId, onSelect, isAdmin = false }) {
  const [essays, setEssays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEssays();
  }, [assessmentId]);

  const fetchEssays = async () => {
    try {
      setLoading(true);
      setError("");
      const response = isAdmin
        ? await essayService.getAdminEssaysByAssessment(assessmentId)
        : await essayService.getTeacherEssaysByAssessment(assessmentId);
      if (response.data?.success) {
        const data = response.data.data || [];
        setEssays(data);
      }
    } catch (err) {
      console.error("Error fetching essays:", err);
      setError("Không thể tải danh sách essay");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="essay-list">
      {essays.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p>Chưa có essay nào</p>
        </div>
      ) : (
        <div className="essay-grid">
          {essays.map((essay) => {
            const essayId = essay.essayId || essay.EssayId;
            const title = essay.title || essay.Title || "Untitled Essay";

            return (
              <Card
                key={essayId}
                className="essay-card"
                onClick={() => onSelect(essay)}
                style={{ cursor: "pointer" }}
              >
                <Card.Body className="d-flex align-items-center gap-3">
                  <div className="essay-icon">
                    <FaFileAlt size={24} />
                  </div>
                  <div className="flex-grow-1">
                    <Card.Title className="essay-title mb-0">{title}</Card.Title>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

