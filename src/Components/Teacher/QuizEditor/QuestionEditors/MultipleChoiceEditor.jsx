import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { FaPlus, FaTrash } from "react-icons/fa";
import "./QuestionEditors.css";

export default function MultipleChoiceEditor({ options, setOptions, correctAnswersJson, setCorrectAnswersJson }) {
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
    // Update correct answer if removed option was correct
    updateCorrectAnswer(updated);
  };

  const handleOptionChange = (index, field, value) => {
    const updated = localOptions.map((opt, i) => {
      if (i === index) {
        const newOpt = { ...opt, [field]: value };
        // If setting isCorrect to true, unset others
        if (field === "isCorrect" && value === true) {
          // Unset all other options
          localOptions.forEach((o, idx) => {
            if (idx !== index) {
              updated[idx] = { ...updated[idx] || o, isCorrect: false };
            }
          });
        }
        return newOpt;
      }
      return opt;
    });

    // Ensure only one correct answer
    if (field === "isCorrect" && value === true) {
      updated.forEach((opt, i) => {
        if (i !== index) {
          opt.isCorrect = false;
        }
      });
    }

    setLocalOptions(updated);
    setOptions(updated);
    updateCorrectAnswer(updated);
  };

  const updateCorrectAnswer = (opts) => {
    const correctIndex = opts.findIndex((opt) => opt.isCorrect);
    if (correctIndex !== -1) {
      setCorrectAnswersJson(JSON.stringify([correctIndex]));
    } else {
      setCorrectAnswersJson(null);
    }
  };

  return (
    <div className="question-type-editor">
      <div className="editor-section-header">
        <h4>Answer Options</h4>
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
                  type="radio"
                  name="correctAnswer"
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

