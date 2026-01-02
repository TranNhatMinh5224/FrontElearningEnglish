import React, { useState, useEffect } from "react";
import { Container, Row, Col, Nav, Tab } from "react-bootstrap";
import { FaFileAlt, FaClipboardList } from "react-icons/fa";
import TeacherHeader from "../../../Components/Header/TeacherHeader";
import { useAuth } from "../../../Context/AuthContext";
import { teacherService } from "../../../Services/teacherService";
import EssaySubmissionTab from "../../../Components/Teacher/SubmissionManagement/EssaySubmissionTab/EssaySubmissionTab";
import QuizAttemptTab from "../../../Components/Teacher/SubmissionManagement/QuizAttemptTab/QuizAttemptTab";
import "./TeacherSubmissionManagement.css";

export default function TeacherSubmissionManagement() {
  const { user, roles, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("essay");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isTeacher = roles.includes("Teacher") || user?.teacherSubscription?.isTeacher === true;

  useEffect(() => {
    if (!isAuthenticated || !isTeacher) {
      return;
    }

    fetchCourses();
  }, [isAuthenticated, isTeacher]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await teacherService.getMyCourses({
        pageNumber: 1,
        pageSize: 100, // Get all courses
      });

      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        const items = data.items || data || [];
        setCourses(items);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Không thể tải danh sách khóa học");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !isTeacher) {
    return null;
  }

  if (loading) {
    return (
      <>
        <TeacherHeader />
        <div className="teacher-submission-management-container">
          <Container>
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          </Container>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <TeacherHeader />
        <div className="teacher-submission-management-container">
          <Container>
            <div className="alert alert-danger text-center">{error}</div>
          </Container>
        </div>
      </>
    );
  }

  return (
    <>
      <TeacherHeader />
      <div className="teacher-submission-management-container">
        <Container>
          <div className="mb-4">
            <h1 className="mb-0 fw-bold text-primary">Quản lý bài nộp</h1>
            <p className="text-muted mt-2">Xem và chấm bài nộp của học sinh</p>
          </div>

          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || "essay")}>
            <Nav variant="tabs" className="mb-4 border-0">
              <Nav.Item>
                <Nav.Link eventKey="essay" className="d-flex align-items-center gap-2">
                  <FaFileAlt />
                  <span>Bài Essay</span>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="quiz" className="d-flex align-items-center gap-2">
                  <FaClipboardList />
                  <span>Bài Quiz</span>
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="essay">
                <EssaySubmissionTab courses={courses} />
              </Tab.Pane>
              <Tab.Pane eventKey="quiz">
                <QuizAttemptTab courses={courses} />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Container>
      </div>
    </>
  );
}

