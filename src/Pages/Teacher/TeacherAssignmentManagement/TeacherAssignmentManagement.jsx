import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TeacherHeader from "../../../Components/Header/TeacherHeader";
import AssignmentManagementView from "../../../Components/Teacher/AssignmentManagement/AssignmentManagementView";
import { ROUTE_PATHS } from "../../../Routes/Paths";
import { teacherService } from "../../../Services/teacherService";
import "./TeacherAssignmentManagement.css";

export default function TeacherAssignmentManagement() {
  const { courseId, lessonId, moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModule();
  }, [moduleId]);

  const loadModule = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getModuleById(parseInt(moduleId));
      if (response.data?.success && response.data?.data) {
        setModule(response.data.data);
      }
    } catch (err) {
      console.error("Error loading module:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(ROUTE_PATHS.TEACHER_LESSON_DETAIL(courseId, lessonId));
  };

  if (loading) {
    return (
      <>
        <TeacherHeader />
        <div className="teacher-assignment-management-page">
          <div className="loading-message">Đang tải...</div>
        </div>
      </>
    );
  }

  const moduleName = module?.name || module?.Name || "Assignment";
  const moduleDescription = module?.description || module?.Description || null;

  return (
    <>
      <TeacherHeader />
      <div className="teacher-assignment-management-page">
        <AssignmentManagementView
          moduleId={parseInt(moduleId)}
          courseId={parseInt(courseId)}
          lessonId={parseInt(lessonId)}
          moduleName={moduleName}
          moduleDescription={moduleDescription}
          onBack={handleBack}
          onNavigate={navigate}
        />
      </div>
    </>
  );
}

