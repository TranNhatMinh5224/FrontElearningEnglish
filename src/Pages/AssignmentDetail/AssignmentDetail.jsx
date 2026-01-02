import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaBook, FaClock, FaArrowRight } from "react-icons/fa";
import MainHeader from "../../Components/Header/MainHeader";
import { assessmentService } from "../../Services/assessmentService";
import { moduleService } from "../../Services/moduleService";
import { courseService } from "../../Services/courseService";
import { lessonService } from "../../Services/lessonService";
import "./AssignmentDetail.css";

export default function AssignmentDetail() {
    const { courseId, lessonId, moduleId } = useParams();
    const navigate = useNavigate();
    
    const [assessments, setAssessments] = useState([]);
    const [module, setModule] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch info
                const [courseRes, lessonRes, moduleRes, assessRes] = await Promise.all([
                    courseService.getCourseById(courseId),
                    lessonService.getLessonById(lessonId),
                    moduleService.getModuleById(moduleId),
                    assessmentService.getByModule(moduleId)
                ]);

                if (courseRes.data?.success) setCourse(courseRes.data.data);
                if (lessonRes.data?.success) setLesson(lessonRes.data.data);
                if (moduleRes.data?.success) setModule(moduleRes.data.data);

                if (assessRes.data?.success) {
                    // Filter published assessments
                    const allData = assessRes.data.data || [];
                    const published = allData.filter(a => a.isPublished || a.IsPublished);
                    setAssessments(published);
                    
                    // Auto-redirect if only 1 assessment (Smart Navigation)
                    if (published.length === 1) {
                        const singleId = published[0].assessmentId || published[0].AssessmentId;
                        navigate(`/course/${courseId}/lesson/${lessonId}/module/${moduleId}/assignment/${singleId}`, { replace: true });
                    }
                }
            } catch (err) {
                console.error(err);
                setError("Không thể tải danh sách bài tập.");
            } finally {
                setLoading(false);
            }
        };

        if (moduleId) fetchData();
    }, [moduleId]);

    const handleAssessmentClick = (id) => {
        navigate(`/course/${courseId}/lesson/${lessonId}/module/${moduleId}/assignment/${id}`);
    };

    if (loading) return <div className="text-center py-5">Loading...</div>;

    const moduleName = module?.name || "Assignment";

    return (
        <>
            <MainHeader />
            <div className="assignment-detail-container">
                <Container>
                    {/* Breadcrumb ... (Giữ nguyên logic breadcrumb cũ) */}
                    <div className="mb-4 pt-3">
                        <h2 className="text-primary fw-bold">{moduleName}</h2>
                        <p className="text-muted">Danh sách các bài kiểm tra trong module này.</p>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <Row>
                        {assessments.map((a) => {
                            const aId = a.assessmentId || a.AssessmentId;
                            return (
                                <Col md={6} lg={4} key={aId} className="mb-4">
                                    <Card 
                                        className="h-100 shadow-sm border-0 assessment-card-item" 
                                        onClick={() => handleAssessmentClick(aId)}
                                        style={{cursor: 'pointer', transition: 'transform 0.2s'}}
                                    >
                                        <Card.Body>
                                            <div className="d-flex align-items-center mb-3">
                                                <div className="bg-light p-3 rounded-circle text-primary me-3">
                                                    <FaBook size={24} />
                                                </div>
                                                <h5 className="fw-bold mb-0 text-dark">{a.title}</h5>
                                            </div>
                                            <p className="text-muted small mb-3 line-clamp-2">
                                                {a.description || "Không có mô tả."}
                                            </p>
                                            <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                                                <small className="text-muted"><FaClock className="me-1"/> {a.timeLimit || "Không giới hạn"}</small>
                                                <Button variant="outline-primary" size="sm" className="rounded-pill">
                                                    Chi tiết <FaArrowRight className="ms-1"/>
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                        {assessments.length === 0 && !error && (
                            <Col>
                                <div className="text-center text-muted py-5">Chưa có bài kiểm tra nào.</div>
                            </Col>
                        )}
                    </Row>
                </Container>
            </div>
        </>
    );
}

