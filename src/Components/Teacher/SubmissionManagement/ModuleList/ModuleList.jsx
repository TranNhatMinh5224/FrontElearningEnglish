import React, { useState, useEffect } from "react";
import { Card, Spinner } from "react-bootstrap";
import { FaClipboardList } from "react-icons/fa";
import { teacherService } from "../../../../Services/teacherService";
import { adminService } from "../../../../Services/adminService";
import "./ModuleList.css";

const MODULE_TYPE_ASSESSMENT = 3; // Assessment module type

export default function ModuleList({ lessonId, onSelect, isAdmin = false }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchModules();
  }, [lessonId]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError("");
      const service = isAdmin ? adminService : teacherService;
      const response = await service.getModulesByLesson(lessonId);
      if (response.data?.success) {
        const data = response.data.data || [];
        // Filter only Assessment modules (type = 3)
        const assessmentModules = data.filter(
          (module) =>
            (module.contentType === MODULE_TYPE_ASSESSMENT ||
              module.ContentType === MODULE_TYPE_ASSESSMENT ||
              module.moduleType === MODULE_TYPE_ASSESSMENT ||
              module.ModuleType === MODULE_TYPE_ASSESSMENT)
        );
        setModules(assessmentModules);
      }
    } catch (err) {
      console.error("Error fetching modules:", err);
      setError("Không thể tải danh sách module");
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
    <div className="module-list">
      {modules.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p>Chưa có module Assessment nào</p>
        </div>
      ) : (
        <div className="module-grid">
          {modules.map((module) => {
            const moduleId = module.moduleId || module.ModuleId;
            const name = module.name || module.Name || "Untitled Module";

            return (
              <Card
                key={moduleId}
                className="module-card"
                onClick={() => onSelect(module)}
                style={{ cursor: "pointer" }}
              >
                <Card.Body className="d-flex align-items-center gap-3">
                  <div className="module-icon">
                    <FaClipboardList size={24} />
                  </div>
                  <div className="flex-grow-1">
                    <Card.Title className="module-title mb-0">{name}</Card.Title>
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

