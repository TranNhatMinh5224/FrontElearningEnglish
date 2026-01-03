import React, { useState, useEffect } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { quizService } from "../../../Services/quizService";
import DateTimePicker from "../DateTimePicker/DateTimePicker";
import { useEnums } from "../../../Context/EnumContext";
import "./CreateQuizModal.css";

export default function CreateQuizModal({ show, onClose, onSuccess, assessmentId, quizToUpdate = null, isAdmin = false }) {
  const { getEnumOptions, loading: enumsLoading } = useEnums();
  const isUpdateMode = !!quizToUpdate;
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [type, setType] = useState(1); // Practice
  const [status, setStatus] = useState(1); // Open
  const [totalQuestions, setTotalQuestions] = useState("");
  const [passingScore, setPassingScore] = useState("");
  const [duration, setDuration] = useState("");
  const [availableFrom, setAvailableFrom] = useState(null);
  const [showAnswersAfterSubmit, setShowAnswersAfterSubmit] = useState(true);
  const [showScoreImmediately, setShowScoreImmediately] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleAnswers, setShuffleAnswers] = useState(true);
  const [allowUnlimitedAttempts, setAllowUnlimitedAttempts] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({});

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Load quiz data when in update mode
  useEffect(() => {
    if (show && isUpdateMode && quizToUpdate) {
      loadQuizData();
    }
  }, [show, isUpdateMode, quizToUpdate]);

  const loadQuizData = async () => {
    if (!quizToUpdate) return;
    
    setLoadingQuiz(true);
    try {
      const quizId = quizToUpdate.quizId || quizToUpdate.QuizId;
      const response = isAdmin
        ? await quizService.getAdminQuizById(quizId)
        : await quizService.getTeacherQuizById(quizId);
      
      if (response.data?.success && response.data?.data) {
        const quiz = response.data.data;
        setTitle(quiz.title || quiz.Title || "");
        setDescription(quiz.description || quiz.Description || "");
        setInstructions(quiz.instructions || quiz.Instructions || "");
        setType(quiz.type !== undefined ? quiz.type : (quiz.Type !== undefined ? quiz.Type : 1));
        setStatus(quiz.status !== undefined ? quiz.status : (quiz.Status !== undefined ? quiz.Status : 1));
        setTotalQuestions((quiz.totalQuestions !== undefined ? quiz.totalQuestions : (quiz.TotalQuestions !== undefined ? quiz.TotalQuestions : "")).toString());
        setPassingScore((quiz.passingScore !== undefined ? quiz.passingScore : (quiz.PassingScore !== undefined ? quiz.PassingScore : "")).toString());
        setDuration((quiz.duration !== undefined ? quiz.duration : (quiz.Duration !== undefined ? quiz.Duration : "")).toString());
        
        const availableFromValue = quiz.availableFrom || quiz.AvailableFrom;
        setAvailableFrom(availableFromValue ? new Date(availableFromValue) : null);
        
        setShowAnswersAfterSubmit(quiz.showAnswersAfterSubmit !== undefined ? quiz.showAnswersAfterSubmit : (quiz.ShowAnswersAfterSubmit !== undefined ? quiz.ShowAnswersAfterSubmit : true));
        setShowScoreImmediately(quiz.showScoreImmediately !== undefined ? quiz.showScoreImmediately : (quiz.ShowScoreImmediately !== undefined ? quiz.ShowScoreImmediately : true));
        setShuffleQuestions(quiz.shuffleQuestions !== undefined ? quiz.shuffleQuestions : (quiz.ShuffleQuestions !== undefined ? quiz.ShuffleQuestions : true));
        setShuffleAnswers(quiz.shuffleAnswers !== undefined ? quiz.shuffleAnswers : (quiz.ShuffleAnswers !== undefined ? quiz.ShuffleAnswers : true));
        
        const allowUnlimited = quiz.allowUnlimitedAttempts !== undefined ? quiz.allowUnlimitedAttempts : (quiz.AllowUnlimitedAttempts !== undefined ? quiz.AllowUnlimitedAttempts : false);
        setAllowUnlimitedAttempts(allowUnlimited);
        
        const maxAttemptsValue = quiz.maxAttempts !== undefined ? quiz.maxAttempts : (quiz.MaxAttempts !== undefined ? quiz.MaxAttempts : null);
        setMaxAttempts(allowUnlimited ? "" : (maxAttemptsValue ? maxAttemptsValue.toString() : ""));
      }
    } catch (error) {
      console.error("Error loading quiz data:", error);
      setErrors({ ...errors, submit: "Không thể tải dữ liệu quiz" });
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setTitle("");
      setDescription("");
      setInstructions("");
      setType(1);
      setStatus(1);
      setTotalQuestions("");
      setPassingScore("");
      setDuration("");
      setAvailableFrom(null);
      setShowAnswersAfterSubmit(true);
      setShowScoreImmediately(true);
      setShuffleQuestions(true);
      setShuffleAnswers(true);
      setAllowUnlimitedAttempts(false);
      setMaxAttempts("");
      setErrors({});
    }
  }, [show]);

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    }

    if (!totalQuestions || parseInt(totalQuestions) <= 0) {
      newErrors.totalQuestions = "Tổng số câu hỏi phải lớn hơn 0";
    }

    if (!passingScore || parseInt(passingScore) < 0) {
      newErrors.passingScore = "Điểm đạt yêu cầu không được để trống";
    }

    if (!duration || parseInt(duration) <= 0) {
      newErrors.duration = "Thời gian làm bài (phút) phải lớn hơn 0";
    }

    if (!allowUnlimitedAttempts && (!maxAttempts || parseInt(maxAttempts) <= 0)) {
      newErrors.maxAttempts = "Số lần làm tối đa phải lớn hơn 0 khi không cho phép làm lại không giới hạn";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        assessmentId: parseInt(assessmentId),
        title: title.trim(),
        description: description.trim() || null,
        instructions: instructions.trim() || null,
        type: parseInt(type),
        status: parseInt(status),
        totalQuestions: parseInt(totalQuestions),
        passingScore: parseInt(passingScore),
        duration: parseInt(duration),
        availableFrom: availableFrom ? availableFrom.toISOString() : null,
        showAnswersAfterSubmit: showAnswersAfterSubmit,
        showScoreImmediately: showScoreImmediately,
        shuffleQuestions: shuffleQuestions,
        shuffleAnswers: shuffleAnswers,
        allowUnlimitedAttempts: allowUnlimitedAttempts,
        maxAttempts: allowUnlimitedAttempts ? null : parseInt(maxAttempts),
      };

      let response;
      if (isUpdateMode && quizToUpdate) {
        const quizId = quizToUpdate.quizId || quizToUpdate.QuizId;
        response = isAdmin 
          ? await quizService.updateAdminQuiz(quizId, submitData)
          : await quizService.updateQuiz(quizId, submitData);
      } else {
        response = isAdmin
          ? await quizService.createAdminQuiz(submitData)
          : await quizService.createQuiz(submitData);
      }

      if (response.data?.success) {
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.data?.message || (isUpdateMode ? "Cập nhật Quiz thất bại" : "Tạo Quiz thất bại"));
      }
    } catch (error) {
      console.error(`Error ${isUpdateMode ? "updating" : "creating"} quiz:`, error);
      const errorMessage = error.response?.data?.message || error.message || (isUpdateMode ? "Có lỗi xảy ra khi cập nhật Quiz" : "Có lỗi xảy ra khi tạo Quiz");
      setErrors({ ...errors, submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  // Get current date/time for min values
  const now = new Date();
  now.setSeconds(0, 0);

  const isFormValid = 
    title.trim() && 
    totalQuestions && 
    parseInt(totalQuestions) > 0 &&
    passingScore !== "" && 
    parseInt(passingScore) >= 0 &&
    duration && 
    parseInt(duration) > 0 &&
    (allowUnlimitedAttempts || (maxAttempts && parseInt(maxAttempts) > 0));

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      className="create-quiz-modal" 
      dialogClassName="create-quiz-modal-dialog"
      style={{ zIndex: 1050 }}
    >
      <Modal.Header closeButton>
        <Modal.Title>{isUpdateMode ? "Cập nhật Quiz" : "Tạo Quiz mới"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loadingQuiz ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
          {/* Tiêu đề */}
          <div className="mb-3">
            <label className="form-label required">Tiêu đề</label>
            <input
              type="text"
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors({ ...errors, title: null });
              }}
              placeholder="Nhập tiêu đề Quiz"
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            <div className="form-text">*Bắt buộc</div>
          </div>

          {/* Mô tả */}
          <div className="mb-3">
            <label className="form-label">Mô tả</label>
            <textarea
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({ ...errors, description: null });
              }}
              placeholder="Nhập mô tả Quiz (không bắt buộc)"
              rows={2}
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            <div className="form-text">Không bắt buộc</div>
          </div>

          {/* Hướng dẫn */}
          <div className="mb-3">
            <label className="form-label">Hướng dẫn</label>
            <textarea
              className={`form-control ${errors.instructions ? "is-invalid" : ""}`}
              value={instructions}
              onChange={(e) => {
                setInstructions(e.target.value);
                setErrors({ ...errors, instructions: null });
              }}
              placeholder="Nhập hướng dẫn làm bài (không bắt buộc)"
              rows={2}
            />
            {errors.instructions && <div className="invalid-feedback">{errors.instructions}</div>}
            <div className="form-text">Không bắt buộc</div>
          </div>

          {/* Loại Quiz và Trạng thái */}
          <Row className="g-3 mb-3">
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label required">Loại Quiz</label>
                <select
                  className={`form-select ${errors.type ? "is-invalid" : ""}`}
                  value={type}
                  onChange={(e) => {
                    setType(parseInt(e.target.value));
                    setErrors({ ...errors, type: null });
                  }}
                  disabled={enumsLoading}
                >
                  {getEnumOptions('QuizType').map((qt) => (
                    <option key={qt.value} value={qt.value}>
                      {qt.label}
                    </option>
                  ))}
                </select>
                {errors.type && <div className="invalid-feedback">{errors.type}</div>}
                <div className="form-text">*Bắt buộc</div>
              </div>
            </Col>

            <Col md={6}>
              <div className="mb-3">
                <label className="form-label required">Trạng thái</label>
                <select
                  className={`form-select ${errors.status ? "is-invalid" : ""}`}
                  value={status}
                  onChange={(e) => {
                    setStatus(parseInt(e.target.value));
                    setErrors({ ...errors, status: null });
                  }}
                  disabled={enumsLoading}
                >
                  {getEnumOptions('QuizStatus').map((qs) => (
                    <option key={qs.value} value={qs.value}>
                      {qs.label}
                    </option>
                  ))}
                </select>
                {errors.status && <div className="invalid-feedback">{errors.status}</div>}
                <div className="form-text">*Bắt buộc</div>
              </div>
            </Col>
          </Row>

          {/* Tổng số câu hỏi và Điểm đạt yêu cầu */}
          <Row className="g-3 mb-3">
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label required">Tổng số câu hỏi</label>
                <input
                  type="number"
                  className={`form-control ${errors.totalQuestions ? "is-invalid" : ""}`}
                  value={totalQuestions}
                  onChange={(e) => {
                    setTotalQuestions(e.target.value);
                    setErrors({ ...errors, totalQuestions: null });
                  }}
                  placeholder="Nhập tổng số câu hỏi"
                  min="1"
                />
                {errors.totalQuestions && <div className="invalid-feedback">{errors.totalQuestions}</div>}
                <div className="form-text">*Bắt buộc</div>
              </div>
            </Col>

            <Col md={6}>
              <div className="mb-3">
                <label className="form-label required">Điểm đạt yêu cầu</label>
                <input
                  type="number"
                  className={`form-control ${errors.passingScore ? "is-invalid" : ""}`}
                  value={passingScore}
                  onChange={(e) => {
                    setPassingScore(e.target.value);
                    setErrors({ ...errors, passingScore: null });
                  }}
                  placeholder="Nhập điểm đạt yêu cầu"
                  min="0"
                />
                {errors.passingScore && <div className="invalid-feedback">{errors.passingScore}</div>}
                <div className="form-text">*Bắt buộc</div>
              </div>
            </Col>
          </Row>

          {/* Thời gian làm bài và Thời gian có thể làm */}
          <Row className="g-3 mb-3">
            <Col md={6}>
              <div className="mb-3">
                <label className="form-label required">Thời gian làm bài (phút)</label>
                <input
                  type="number"
                  className={`form-control ${errors.duration ? "is-invalid" : ""}`}
                  value={duration}
                  onChange={(e) => {
                    setDuration(e.target.value);
                    setErrors({ ...errors, duration: null });
                  }}
                  placeholder="Nhập thời gian làm bài (phút)"
                  min="1"
                />
                {errors.duration && <div className="invalid-feedback">{errors.duration}</div>}
                <div className="form-text">*Bắt buộc</div>
              </div>
            </Col>

            <Col md={6}>
              <div className="mb-3">
                <DateTimePicker
                  value={availableFrom}
                  onChange={(date) => {
                    setAvailableFrom(date);
                    setErrors({ ...errors, availableFrom: null });
                  }}
                  min={now}
                  placeholder="dd/mm/yyyy HH:mm"
                  hasError={!!errors.availableFrom}
                  label="Thời gian có thể làm (tùy chọn)"
                  required={false}
                />
                {errors.availableFrom && <div className="invalid-feedback" style={{ marginTop: "4px" }}>{errors.availableFrom}</div>}
                <div className="form-text">Không bắt buộc</div>
              </div>
            </Col>
          </Row>

          {/* Cài đặt hiển thị */}
          <div className="card bg-light border rounded-3 p-4 mb-3">
            <h5 className="fw-semibold mb-3">Cài đặt hiển thị</h5>
            <div className="d-flex flex-column gap-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showAnswersAfterSubmit"
                  checked={showAnswersAfterSubmit}
                  onChange={(e) => setShowAnswersAfterSubmit(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="showAnswersAfterSubmit">
                  Hiển thị đáp án sau khi nộp bài
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showScoreImmediately"
                  checked={showScoreImmediately}
                  onChange={(e) => setShowScoreImmediately(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="showScoreImmediately">
                  Hiển thị điểm ngay lập tức
                </label>
              </div>
            </div>
          </div>

          {/* Cài đặt xáo trộn */}
          <div className="card bg-light border rounded-3 p-4 mb-3">
            <h5 className="fw-semibold mb-3">Cài đặt xáo trộn</h5>
            <div className="d-flex flex-column gap-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="shuffleQuestions"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="shuffleQuestions">
                  Xáo trộn câu hỏi
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="shuffleAnswers"
                  checked={shuffleAnswers}
                  onChange={(e) => setShuffleAnswers(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="shuffleAnswers">
                  Xáo trộn đáp án
                </label>
              </div>
            </div>
          </div>

          {/* Cài đặt số lần làm */}
          <div className="card bg-light border rounded-3 p-4 mb-3">
            <h5 className="fw-semibold mb-3">Cài đặt số lần làm</h5>
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="allowUnlimitedAttempts"
                checked={allowUnlimitedAttempts}
                onChange={(e) => {
                  setAllowUnlimitedAttempts(e.target.checked);
                  if (e.target.checked) {
                    setMaxAttempts("");
                  }
                  setErrors({ ...errors, maxAttempts: null });
                }}
              />
              <label className="form-check-label" htmlFor="allowUnlimitedAttempts">
                Cho phép làm lại không giới hạn
              </label>
            </div>
            {!allowUnlimitedAttempts && (
              <div className="mb-3">
                <label className="form-label required">Số lần làm tối đa</label>
                <input
                  type="number"
                  className={`form-control ${errors.maxAttempts ? "is-invalid" : ""}`}
                  value={maxAttempts}
                  onChange={(e) => {
                    setMaxAttempts(e.target.value);
                    setErrors({ ...errors, maxAttempts: null });
                  }}
                  placeholder="Nhập số lần làm tối đa"
                  min="1"
                />
                {errors.maxAttempts && <div className="invalid-feedback">{errors.maxAttempts}</div>}
                <div className="form-text">*Bắt buộc khi không cho phép làm lại không giới hạn</div>
              </div>
            )}
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className="alert alert-danger mt-3">{errors.submit}</div>
          )}
        </form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Huỷ
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!isFormValid || submitting || loadingQuiz}
        >
          {submitting ? (isUpdateMode ? "Đang cập nhật..." : "Đang tạo...") : (isUpdateMode ? "Cập nhật" : "Tạo")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

