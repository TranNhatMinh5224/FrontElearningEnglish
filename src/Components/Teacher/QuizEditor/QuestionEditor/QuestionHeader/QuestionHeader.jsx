import React from "react";
import { Button } from "react-bootstrap";
import { FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getQuestionTypeLabel } from "../../../../../Utils/questionTypeUtils";
import "./QuestionHeader.css";

export default function QuestionHeader({
  question,
  questionType,
  questionNumber,
  totalQuestions,
  onNavigate,
  onDelete,
}) {
  return (
    <div className="question-editor-header">
      <div className="header-left">
        <h3 className="editor-title">
          {question
            ? `Câu ${questionNumber}: ${getQuestionTypeLabel(questionType)}`
            : "Tạo câu hỏi mới"}
        </h3>
        {totalQuestions > 1 && (
          <div className="question-pagination">
            <button
              className="pagination-btn"
              onClick={() => onNavigate && onNavigate("prev")}
              disabled={questionNumber === 1}
            >
              <FaChevronLeft />
            </button>
            <span className="pagination-text">
              {questionNumber} / {totalQuestions}
            </span>
            <button
              className="pagination-btn"
              onClick={() => onNavigate && onNavigate("next")}
              disabled={questionNumber === totalQuestions}
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>
      {question && (
        <Button
          variant="danger"
          size="sm"
          onClick={onDelete}
          className="delete-btn"
        >
          <FaTrash /> Xóa
        </Button>
      )}
    </div>
  );
}

