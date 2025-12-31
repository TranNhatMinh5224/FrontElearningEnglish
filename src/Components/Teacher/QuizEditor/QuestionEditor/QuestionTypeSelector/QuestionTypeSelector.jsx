import React from "react";
import { Form, Button, ButtonGroup } from "react-bootstrap";
import { QUESTION_TYPES } from "../../../../../Utils/questionTypeUtils";
import "./QuestionTypeSelector.css";

export default function QuestionTypeSelector({ questionType, onTypeChange }) {
  return (
    <Form.Group className="mb-4">
      <Form.Label>Loại câu hỏi</Form.Label>
      <ButtonGroup className="question-type-buttons">
        <Button
          variant={questionType === QUESTION_TYPES.MULTIPLE_CHOICE ? "primary" : "outline-primary"}
          onClick={() => onTypeChange(QUESTION_TYPES.MULTIPLE_CHOICE)}
        >
          Chọn một đáp án
        </Button>
        <Button
          variant={questionType === QUESTION_TYPES.MULTIPLE_ANSWERS ? "primary" : "outline-primary"}
          onClick={() => onTypeChange(QUESTION_TYPES.MULTIPLE_ANSWERS)}
        >
          Chọn nhiều đáp án
        </Button>
        <Button
          variant={questionType === QUESTION_TYPES.FILL_BLANK ? "primary" : "outline-primary"}
          onClick={() => onTypeChange(QUESTION_TYPES.FILL_BLANK)}
        >
          Điền từ
        </Button>
        <Button
          variant={questionType === QUESTION_TYPES.MATCHING ? "primary" : "outline-primary"}
          onClick={() => onTypeChange(QUESTION_TYPES.MATCHING)}
        >
          Nối các đáp án
        </Button>
        <Button
          variant={questionType === QUESTION_TYPES.ORDERING ? "primary" : "outline-primary"}
          onClick={() => onTypeChange(QUESTION_TYPES.ORDERING)}
        >
          Sắp xếp
        </Button>
      </ButtonGroup>
    </Form.Group>
  );
}

