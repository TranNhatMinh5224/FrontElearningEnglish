import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { FaPlus, FaTrash } from "react-icons/fa";
import "./QuestionEditors.css";

export default function MultipleAnswersEditor({ options, setOptions, correctAnswersJson, setCorrectAnswersJson }) {
  const [localOptions, setLocalOptions] = useState(options || []);

  useEffect(() => {
    setLocalOptions(options || []);
  }, [options]);

  const handleAddOption = () => {
    const newOption = {
      text: "",
      isCorrect: false,
      feedback: "",
    };
    const updated = [...localOptions, newOption];
    setLocalOptions(updated);
    setOptions(updated);
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
    const correctIndices = opts
      .map((opt, index) => (opt.isCorrect ? index : null))
      .filter((idx) => idx !== null);
    if (correctIndices.length > 0) {
      setCorrectAnswersJson(JSON.stringify(correctIndices));
    } else {
      setCorrectAnswersJson(null);
    }
  };

  return (
    <div className="question-type-editor">
      <div className="editor-section-header">
        <h4>Answer Options (Select Multiple)</h4>
        <Button variant="outline-primary" size="sm" onClick={handleAddOption}>
          <FaPlus /> Add another answer
        </Button>
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
                <Form.Check
                  type="checkbox"
                  checked={option.isCorrect}
                  onChange={(e) => handleOptionChange(index, "isCorrect", e.target.checked)}
                  label="Correct Answer"
                />
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
                placeholder="Enter answer option"
                className="option-input"
              />
              <Form.Control
                type="text"
                value={option.feedback || ""}
                onChange={(e) => handleOptionChange(index, "feedback", e.target.value)}
                placeholder="Feedback (optional)"
                className="option-feedback"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

