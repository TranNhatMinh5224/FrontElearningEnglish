import React, { useState, useEffect } from "react";
import { Card, Table, Badge, Pagination, Spinner, Button } from "react-bootstrap";
import { quizAttemptService } from "../../../../Services/quizAttemptService";
import QuizAttemptDetailModal from "../QuizAttemptDetailModal/QuizAttemptDetailModal";
import "./QuizAttemptList.css";

export default function QuizAttemptList({ quizId, quizTitle, onBack, isAdmin = false }) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchAttempts();
  }, [quizId, currentPage]);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = isAdmin
        ? await quizAttemptService.getAdminQuizAttemptsPaged(quizId, currentPage, pageSize)
        : await quizAttemptService.getQuizAttemptsPaged(quizId, currentPage, pageSize);
      if (response.data?.success) {
        const data = response.data.data || {};
        const items = data.items || data.data || [];
        setAttempts(items);
        setTotalPages(data.totalPages || Math.ceil((data.totalCount || 0) / pageSize));
      }
    } catch (err) {
      console.error("Error fetching attempts:", err);
      setError("Không thể tải danh sách bài làm");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (attempt) => {
    try {
      const attemptId = attempt.attemptId || attempt.AttemptId;
      const response = isAdmin
        ? await quizAttemptService.getAdminAttemptDetailForReview(attemptId)
        : await quizAttemptService.getAttemptDetailForReview(attemptId);
      if (response.data?.success) {
        setSelectedAttempt(response.data.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error("Error fetching attempt detail:", err);
      alert("Không thể tải chi tiết bài làm");
    }
  };

  const getStatusBadge = (status) => {
    const statusNum = status !== undefined ? status : (status !== undefined ? status : 0);
    if (statusNum === 2 || statusNum === "Completed" || statusNum === "Hoàn thành") {
      return <Badge bg="success">Hoàn thành</Badge>;
    } else if (statusNum === 1 || statusNum === "InProgress" || statusNum === "Đang làm") {
      return <Badge bg="warning">Đang làm</Badge>;
    } else if (statusNum === 0 || statusNum === "NotStarted" || statusNum === "Chưa bắt đầu") {
      return <Badge bg="secondary">Chưa bắt đầu</Badge>;
    }
    return <Badge bg="secondary">N/A</Badge>;
  };

  if (loading && attempts.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="quiz-attempt-list">
      <Card className="mb-3">
        <Card.Header>
          <h5 className="mb-0">Bài Quiz: {quizTitle}</h5>
        </Card.Header>
        <Card.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          
          {attempts.length === 0 ? (
            <div className="text-center text-muted py-5">
              <p>Chưa có bài làm nào</p>
            </div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Học sinh</th>
                    <th>Lần làm</th>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày nộp</th>
                    <th>Trạng thái</th>
                    <th>Điểm</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => {
                    const attemptId = attempt.attemptId || attempt.AttemptId;
                    const userName = attempt.userName || attempt.UserName || "N/A";
                    const attemptNumber = attempt.attemptNumber !== undefined ? attempt.attemptNumber : (attempt.AttemptNumber !== undefined ? attempt.AttemptNumber : 1);
                    const startedAt = attempt.startedAt || attempt.StartedAt;
                    const submittedAt = attempt.submittedAt || attempt.SubmittedAt;
                    const status = attempt.status !== undefined ? attempt.status : (attempt.Status !== undefined ? attempt.Status : 0);
                    const totalScore = attempt.totalScore !== undefined ? attempt.totalScore : (attempt.TotalScore !== undefined ? attempt.TotalScore : null);

                    return (
                      <tr key={attemptId}>
                        <td>{userName}</td>
                        <td>{attemptNumber}</td>
                        <td>{startedAt ? new Date(startedAt).toLocaleString("vi-VN") : "N/A"}</td>
                        <td>{submittedAt ? new Date(submittedAt).toLocaleString("vi-VN") : "-"}</td>
                        <td>{getStatusBadge(status)}</td>
                        <td>
                          {totalScore !== null && totalScore !== undefined ? (
                            <span className="fw-bold">{totalScore}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleViewDetail(attempt)}
                            className="view-btn"
                          >
                            Xem
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <Pagination.First
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    />
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Pagination.Item
                            key={page}
                            active={page === currentPage}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Pagination.Item>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <Pagination.Ellipsis key={page} />;
                      }
                      return null;
                    })}
                    <Pagination.Next
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {selectedAttempt && (
        <QuizAttemptDetailModal
          show={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAttempt(null);
          }}
          attempt={selectedAttempt}
          quizId={quizId}
        />
      )}
    </div>
  );
}

