import React, { useState, useEffect } from "react";
import { Card, Table, Badge, Pagination, Spinner, Button } from "react-bootstrap";
import { FaDownload } from "react-icons/fa";
import { essaySubmissionService } from "../../../../Services/essaySubmissionService";
import EssaySubmissionDetailModal from "../EssaySubmissionDetailModal/EssaySubmissionDetailModal";
import "./EssaySubmissionList.css";

export default function EssaySubmissionList({ essayId, essayTitle, onBack, isAdmin = false }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [essayId, currentPage]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError("");
      const response = isAdmin
        ? await essaySubmissionService.getAdminSubmissionsByEssay(essayId, currentPage, pageSize)
        : await essaySubmissionService.getSubmissionsByEssay(essayId, currentPage, pageSize);
      if (response.data?.success) {
        const data = response.data.data || {};
        const items = data.items || data.data || [];
        setSubmissions(items);
        setTotalCount(data.totalCount || data.totalItems || 0);
        setTotalPages(data.totalPages || Math.ceil((data.totalCount || 0) / pageSize));
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Không thể tải danh sách bài nộp");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (submission) => {
    try {
      const submissionId = submission.submissionId || submission.SubmissionId;
      const response = isAdmin
        ? await essaySubmissionService.getAdminSubmissionDetail(submissionId)
        : await essaySubmissionService.getSubmissionDetail(submissionId);
      if (response.data?.success) {
        setSelectedSubmission(response.data.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error("Error fetching submission detail:", err);
      alert("Không thể tải chi tiết bài nộp");
    }
  };

  const handleDownload = async (submissionId) => {
    try {
      // Find submission to get attachmentType
      const submission = submissions.find(
        (s) => (s.submissionId || s.SubmissionId) === submissionId
      );
      
      const response = isAdmin
        ? await essaySubmissionService.downloadAdminSubmissionFile(submissionId)
        : await essaySubmissionService.downloadSubmissionFile(submissionId);
      
      // Get filename from Content-Disposition header or use attachmentType
      let fileName = `submission-${submissionId}`;
      const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // If no filename from header, try to get from attachmentType
      if (fileName === `submission-${submissionId}` && submission) {
        const attachmentType = submission.attachmentType || submission.AttachmentType;
        if (attachmentType) {
          // Map MIME type to extension
          const mimeToExt = {
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/docx': 'docx',
            'text/plain': 'txt',
            'application/docm': 'docm',
            'application/dotx': 'dotx',
            'application/dotm': 'dotm'
          };
          
          // Try to get extension from attachmentType
          let extension = 'pdf'; // default
          if (attachmentType.includes('word') || attachmentType.includes('docx')) {
            extension = 'docx';
          } else if (attachmentType.includes('doc') && !attachmentType.includes('docx')) {
            extension = 'doc';
          } else if (attachmentType.includes('pdf')) {
            extension = 'pdf';
          } else if (attachmentType.includes('txt') || attachmentType.includes('text/plain')) {
            extension = 'txt';
          } else {
            // Try to find in mimeToExt
            for (const [mime, ext] of Object.entries(mimeToExt)) {
              if (attachmentType.includes(mime.split('/')[1])) {
                extension = ext;
                break;
              }
            }
          }
          
          fileName = `submission-${submissionId}.${extension}`;
        }
      }
      
      // Get content type from response
      const contentType = response.headers['content-type'] || response.headers['Content-Type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading file:", err);
      alert("Không thể tải file");
    }
  };

  const getStatusBadge = (status) => {
    // Handle enum (number) or string
    let statusValue = status;
    if (typeof status === "number") {
      // SubmissionStatus enum: InProgress = 0, Submitted = 1, UnderReview = 2, Graded = 3, Returned = 4, Resubmitted = 5
      switch (status) {
        case 0:
          return <Badge bg="warning">Đang làm</Badge>;
        case 1:
          return <Badge bg="primary">Đã nộp</Badge>;
        case 2:
          return <Badge bg="info">Đang xem xét</Badge>;
        case 3:
          return <Badge bg="success">Đã chấm</Badge>;
        case 4:
          return <Badge bg="secondary">Đã trả lại</Badge>;
        case 5:
          return <Badge bg="primary">Đã nộp lại</Badge>;
        default:
          return <Badge bg="secondary">N/A</Badge>;
      }
    } else if (typeof status === "string") {
      const statusLower = status.toLowerCase();
      if (statusLower === "submitted" || statusLower === "đã nộp" || statusLower === "1") {
        return <Badge bg="primary">Đã nộp</Badge>;
      } else if (statusLower === "graded" || statusLower === "đã chấm" || statusLower === "3") {
        return <Badge bg="success">Đã chấm</Badge>;
      } else if (statusLower === "pending" || statusLower === "chờ chấm" || statusLower === "underreview" || statusLower === "2") {
        return <Badge bg="warning">Chờ chấm</Badge>;
      } else if (statusLower === "inprogress" || statusLower === "đang làm" || statusLower === "0") {
        return <Badge bg="warning">Đang làm</Badge>;
      }
    }
    return <Badge bg="secondary">{status || "N/A"}</Badge>;
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="essay-submission-list">
      <Card className="mb-3">
        <Card.Header>
          <h5 className="mb-0">Bài Essay: {essayTitle}</h5>
        </Card.Header>
        <Card.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          
          {submissions.length === 0 ? (
            <div className="text-center text-muted py-5">
              <p>Chưa có bài nộp nào</p>
            </div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Học sinh</th>
                    <th>Ngày nộp</th>
                    <th>Trạng thái</th>
                    <th>Điểm</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => {
                    const submissionId = submission.submissionId || submission.SubmissionId;
                    const userName = submission.userName || submission.UserName || "N/A";
                    const submittedAt = submission.submittedAt || submission.SubmittedAt;
                    const status = submission.status !== undefined ? submission.status : (submission.Status !== undefined ? submission.Status : null);
                    // Score: TeacherScore takes priority over AiScore
                    const score = submission.teacherScore !== undefined ? submission.teacherScore : 
                                  (submission.TeacherScore !== undefined ? submission.TeacherScore :
                                  (submission.aiScore !== undefined ? submission.aiScore :
                                  (submission.AiScore !== undefined ? submission.AiScore :
                                  (submission.score !== undefined ? submission.score :
                                  (submission.Score !== undefined ? submission.Score : null)))));
                    const hasAttachment = submission.attachmentUrl || submission.AttachmentUrl || submission.attachmentKey || submission.AttachmentKey;

                    return (
                      <tr key={submissionId}>
                        <td>{userName}</td>
                        <td>{submittedAt ? new Date(submittedAt).toLocaleString("vi-VN") : "N/A"}</td>
                        <td>{getStatusBadge(status)}</td>
                        <td>
                          {score !== null && score !== undefined ? (
                            <span className="fw-bold">{score}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleViewDetail(submission)}
                              className="view-btn"
                            >
                              Xem
                            </Button>
                            {hasAttachment && (
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={() => handleDownload(submissionId)}
                                style={{ fontSize: "13px", padding: "6px 10px" }}
                              >
                                <FaDownload />
                              </Button>
                            )}
                          </div>
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

      {selectedSubmission && (
        <EssaySubmissionDetailModal
          show={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSubmission(null);
          }}
          submission={selectedSubmission}
          isAdmin={isAdmin}
          onGradeSuccess={() => {
            fetchSubmissions();
            setShowDetailModal(false);
          }}
        />
      )}
    </div>
  );
}

