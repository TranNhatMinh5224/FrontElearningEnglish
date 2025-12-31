import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { FaPlus, FaTrash } from "react-icons/fa";
import "./QuestionEditors.css";

export default function FillBlankEditor({ options, setOptions, correctAnswersJson, setCorrectAnswersJson }) {
  const [localOptions, setLocalOptions] = useState(options || []);

  useEffect(() => {
    setLocalOptions(options || []);
  }, [options]);

  const handleAddOption = () => {
    const newOption = {
      text: "",
      isCorrect: true, // All fill blank options are correct answers
      feedback: "",
    };
    const updated = [...localOptions, newOption];
    setLocalOptions(updated);
    setOptions(updated);
    updateCorrectAnswer(updated);
  };

  const handleRemoveOption = (index) => {
    const updated = localOptions.filter((_, i) => i !== index);
    setLocalOptions(updated);
    setOptions(updated);
    updateCorrectAnswer(updated);
  };

  const handleOptionChange = (index, field, value) => {
    const updated = localOptions.map((opt, i) => {
      if (i === index) {
        return { ...opt, [field]: value };
      }
      return opt;
    });
    setLocalOptions(updated);
    setOptions(updated);
    updateCorrectAnswer(updated);
  };

  const updateCorrectAnswer = (opts) => {
    const answers = opts.map((opt) => opt.text.trim()).filter((text) => text.length > 0);
    if (answers.length > 0) {
      setCorrectAnswersJson(JSON.stringify(answers));
    } else {
      setCorrectAnswersJson(null);
    }
  };

  return (
    <div className="question-type-editor">
      <div className="editor-section-header">
        <h4>Correct Answers (Fill in the Blank)</h4>
        <Button variant="outline-primary" size="sm" onClick={handleAddOption}>
          <FaPlus /> Add another answer
        </Button>
      </div>

      <div className="fill-blank-info">
        <p className="text-muted">
          Nhập các đáp án đúng có thể chấp nhận. Học viên có thể điền bất kỳ đáp án nào trong danh sách này.
        </p>
      </div>

      {localOptions.length === 0 ? (
        <div className="empty-options">
          <p>Chưa có đáp án nào. Nhấn "Add another answer" để thêm.</p>
        </div>
      ) : (
        <div className="options-list">
          {localOptions.map((option, index) => (
            <div key={index} className="option-item">
              <div className="option-header">
                <span className="option-label">Correct Answer {index + 1}</span>
                {localOptions.length > 1 && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <FaTrash />
                  </Button>
                )}
              </div>
              <Form.Control
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                placeholder="Enter correct answer"
                className="option-input"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

