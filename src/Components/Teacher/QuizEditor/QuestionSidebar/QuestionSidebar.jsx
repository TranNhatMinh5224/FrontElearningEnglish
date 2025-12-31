import React, { useState } from "react";
import "./QuestionSidebar.css";
import { FaPlus, FaEllipsisV } from "react-icons/fa";
import { getQuestionTypeLabel } from "../../../../Utils/questionTypeUtils";

export default function QuestionSidebar({
  questions,
  selectedQuestion,
  onQuestionSelect,
  onCreateQuestion,
  onDeleteQuestion,
}) {
  const [showMenuForQuestion, setShowMenuForQuestion] = useState(null);

  const handleMenuClick = (e, questionId) => {
    e.stopPropagation();
    setShowMenuForQuestion(showMenuForQuestion === questionId ? null : questionId);
  };

  const handleDelete = (e, questionId) => {
    e.stopPropagation();
    setShowMenuForQuestion(null);
    onDeleteQuestion(questionId);
  };

  const handleQuestionClick = (question) => {
    setShowMenuForQuestion(null);
    onQuestionSelect(question);
  };

  return (
    <div className="question-sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">Tạo Câu hỏi Quiz</h3>
        <button
          className="btn-add-question-header"
          onClick={onCreateQuestion}
          title="Thêm câu hỏi"
        >
          <FaPlus />
        </button>
      </div>

      <div className="sidebar-questions-count">
        Câu hỏi ({questions.length})
      </div>

      <div className="sidebar-content">
        {questions.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có câu hỏi nào</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={onCreateQuestion}
            >
              <FaPlus /> Thêm câu hỏi đầu tiên
            </button>
          </div>
        ) : (
          <div className="questions-list">
            {questions.map((question, index) => {
              const questionId = question.questionId || question.QuestionId;
              const questionType = question.type || question.Type || 0;
              const isSelected =
                selectedQuestion &&
                (selectedQuestion.questionId === questionId ||
                  selectedQuestion.QuestionId === questionId);

              return (
                <div
                  key={questionId}
                  className={`question-item ${isSelected ? "selected" : ""}`}
                  onClick={() => handleQuestionClick(question)}
                >
                  <div className="question-item-content">
                    <div className="question-number">Câu {index + 1}</div>
                    <div className="question-type-label">
                      {getQuestionTypeLabel(questionType)}
                    </div>
                  </div>
                  <div className="question-item-actions">
                    <button
                      className="btn-menu"
                      onClick={(e) => handleMenuClick(e, questionId)}
                      title="Tùy chọn"
                    >
                      <FaEllipsisV />
                    </button>
                    {showMenuForQuestion === questionId && (
                      <div className="question-menu-dropdown">
                        <button
                          className="menu-item delete"
                          onClick={(e) => handleDelete(e, questionId)}
                        >
                          Xóa câu hỏi
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
