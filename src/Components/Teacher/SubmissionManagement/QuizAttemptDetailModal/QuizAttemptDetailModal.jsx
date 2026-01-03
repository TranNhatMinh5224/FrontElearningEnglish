import React, { useState, useEffect } from "react";
import { Modal, Spinner } from "react-bootstrap";
import { quizAttemptService } from "../../../../Services/quizAttemptService";
import { useQuestionTypes } from "../../../../hooks/useQuestionTypes";
import "./QuizAttemptDetailModal.css";

export default function QuizAttemptDetailModal({ show, onClose, attempt, quizId }) {
  const { getQuestionTypeLabel } = useQuestionTypes();
  const [attemptDetail, setAttemptDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (show && attempt) {
      fetchAttemptDetail();
    } else {
      setAttemptDetail(null);
      setError("");
    }
  }, [show, attempt]);

  const fetchAttemptDetail = async () => {
    if (!attempt) return;

    try {
      setLoading(true);
      setError("");

      const attemptId = attempt.attemptId || attempt.AttemptId;
      const response = await quizAttemptService.getAttemptDetailForReview(attemptId);

      if (response.data?.success && response.data?.data) {
        setAttemptDetail(response.data.data);
      } else {
        // If detail API doesn't have user info, try to get from scores API
        const currentQuizId = quizId || attempt.quizId || attempt.QuizId;
        if (currentQuizId) {
          await fetchFromScoresAPI(currentQuizId, attemptId);
        } else {
          setError("Không thể tải chi tiết bài làm");
        }
      }
    } catch (err) {
      console.error("Error fetching attempt detail:", err);
      // Try to get from scores API as fallback
      const currentQuizId = quizId || attempt?.quizId || attempt?.QuizId;
      if (currentQuizId) {
        await fetchFromScoresAPI(currentQuizId, attempt?.attemptId || attempt?.AttemptId);
      } else {
        setError("Không thể tải chi tiết bài làm");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFromScoresAPI = async (quizId, attemptId) => {
    try {
      const response = await quizAttemptService.getQuizScoresPaged(quizId, 1, 100);
      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        const items = data.items || data.data || [];
        const scoreData = items.find(
          (item) => (item.attemptId || item.AttemptId) === attemptId
        );
        if (scoreData) {
          // Merge score data with attempt data
          setAttemptDetail({
            ...attempt,
            email: scoreData.email || scoreData.Email,
            firstName: scoreData.firstName || scoreData.FirstName,
            lastName: scoreData.lastName || scoreData.LastName,
            percentage: scoreData.percentage !== undefined ? scoreData.percentage : (scoreData.Percentage !== undefined ? scoreData.Percentage : null),
          });
        } else {
          setAttemptDetail(attempt);
        }
      } else {
        setAttemptDetail(attempt);
      }
    } catch (err) {
      console.error("Error fetching from scores API:", err);
      setAttemptDetail(attempt);
    }
  };

  if (!attempt) return null;

  // Use attemptDetail if available, otherwise use attempt
  const displayData = attemptDetail || attempt;

  const userName = displayData.firstName || displayData.FirstName || displayData.userName || displayData.UserName || "";
  const lastName = displayData.lastName || displayData.LastName || "";
  const fullName = userName && lastName ? `${userName} ${lastName}` : (userName || lastName || "N/A");
  const email = displayData.email || displayData.Email || "N/A";
  const totalScore = displayData.totalScore !== undefined ? displayData.totalScore : (displayData.TotalScore !== undefined ? displayData.TotalScore : "N/A");
  const maxScore = displayData.maxScore !== undefined ? displayData.maxScore : (displayData.MaxScore !== undefined ? displayData.MaxScore : null);
  const percentage = displayData.percentage !== undefined ? displayData.percentage : (displayData.Percentage !== undefined ? displayData.Percentage : null);
  const timeSpentSeconds = displayData.timeSpentSeconds !== undefined ? displayData.timeSpentSeconds : (displayData.TimeSpentSeconds !== undefined ? displayData.TimeSpentSeconds : 0);
  const questions = displayData.questions || displayData.Questions || [];

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      className="quiz-attempt-detail-modal" 
      dialogClassName="quiz-attempt-detail-modal-dialog"
      style={{ zIndex: 1050 }}
    >
      <Modal.Header closeButton>
        <Modal.Title>Chi tiết bài làm Quiz</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <>
            <div className="mb-3">
              <strong>Học sinh:</strong> {fullName} ({email})
            </div>
            <div className="mb-3">
              <strong>Điểm số:</strong> {totalScore !== "N/A" && maxScore !== null ? `${totalScore} / ${maxScore}` : totalScore}
            </div>
            {percentage !== null && percentage !== undefined && (
              <div className="mb-3">
                <strong>Phần trăm:</strong> {percentage}%
              </div>
            )}
            <div className="mb-3">
              <strong>Thời gian làm bài:</strong> {timeSpentSeconds > 0 ? `${Math.floor(timeSpentSeconds / 60)} phút ${timeSpentSeconds % 60} giây` : "N/A"}
            </div>

            {questions.length > 0 && (
              <div className="questions-review-section">
                <h5>Chi tiết câu hỏi</h5>
                {questions.map((question, index) => {
                  const questionId = question.questionId || question.QuestionId;
                  const questionText = question.questionText || question.QuestionText || "";
                  const questionType = question.type || question.Type;
                  const points = question.points || question.Points || 0;
                  const score = question.score || question.Score || 0;
                  const isCorrect = question.isCorrect !== undefined ? question.isCorrect : (question.IsCorrect || false);
                  const userAnswerText = question.userAnswerText || question.UserAnswerText || "Chưa trả lời";
                  const correctAnswerText = question.correctAnswerText || question.CorrectAnswerText || "";
                  const options = question.options || question.Options || [];

                  return (
                    <div key={questionId || index} className={`question-review-item ${isCorrect ? 'correct-answer' : 'incorrect-answer'}`}>
                      <div className="question-header">
                        <span className="question-badge number">Câu {index + 1}</span>
                        <span className="question-badge type">{getQuestionTypeLabel(questionType)}</span>
                        <span className={`question-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                          {isCorrect ? '✓ Đúng' : '✗ Sai'}
                        </span>
                        <span className="question-score ms-auto">
                          {score}/{points} điểm
                        </span>
                      </div>
                      
                      <div className="question-text">
                        <strong>Câu hỏi:</strong> {questionText}
                      </div>
Label
                      {options.length > 0 && (
                        <div className="options-section">
                          <strong>Các lựa chọn:</strong>
                          <ul className="question-options">
                            {options.map((option, optIdx) => {
                              const optionId = option.optionId || option.OptionId;
                              const optionText = option.optionText || option.OptionText || "";
                              const isOptionCorrect = option.isCorrect !== undefined ? option.isCorrect : (option.IsCorrect || false);
                              const isSelected = option.isSelected !== undefined ? option.isSelected : (option.IsSelected || false);
                              
                              let className = '';
                              if (isSelected && isOptionCorrect) {
                                className = 'selected correct-option';
                              } else if (isSelected) {
                                className = 'selected';
                              } else if (isOptionCorrect) {
                                className = 'correct-option';
                              }
                              
                              return (
                                <li key={optionId || optIdx} className={className}>
                                  {isSelected && <span className="selected-indicator">[Đã chọn]</span>}
                                  {isOptionCorrect && <span className="correct-indicator">✓</span>}
                                  {optionText}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      <div className="answer-section">
                        <div className="user-answer">
                          <strong>Câu trả lời:</strong> {userAnswerText}
                        </div>

                        {!isCorrect && correctAnswerText && (
                          <div className="correct-answer-text">
                            <strong>Đáp án đúng:</strong> {correctAnswerText}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}

