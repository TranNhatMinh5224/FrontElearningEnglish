import React, { useState, useEffect } from "react";
import { Card, Spinner } from "react-bootstrap";
import { FaClipboardCheck } from "react-icons/fa";
import { assessmentService } from "../../../../Services/assessmentService";
import "./AssessmentList.css";

export default function AssessmentList({ moduleId, onSelect, isAdmin = false }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssessments();
  }, [moduleId]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError("");
      // Use teacher or admin API based on isAdmin prop
      const response = isAdmin 
        ? await assessmentService.getAdminAssessmentsByModule(moduleId)
        : await assessmentService.getTeacherAssessmentsByModule(moduleId);
      if (response.data?.success) {
        const data = response.data.data || [];
        setAssessments(data);
      }
    } catch (err) {
      console.error("Error fetching assessments:", err);
      setError("Không thể tải danh sách assessment");
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
    <div className="assessment-list">
      {assessments.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p>Chưa có assessment nào</p>
        </div>
      ) : (
        <div className="assessment-grid">
          {assessments.map((assessment) => {
            const assessmentId = assessment.assessmentId || assessment.AssessmentId;
            const title = assessment.title || assessment.Title || "Untitled Assessment";

            return (
              <Card
                key={assessmentId}
                className="assessment-card"
                onClick={() => onSelect(assessment)}
                style={{ cursor: "pointer" }}
              >
                <Card.Body className="d-flex align-items-center gap-3">
                  <div className="assessment-icon">
                    <FaClipboardCheck size={24} />
                  </div>
                  <div className="flex-grow-1">
                    <Card.Title className="assessment-title mb-0">{title}</Card.Title>
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

