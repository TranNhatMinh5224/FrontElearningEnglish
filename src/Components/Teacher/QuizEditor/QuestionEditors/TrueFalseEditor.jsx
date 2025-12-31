import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import "./QuestionEditors.css";

export default function TrueFalseEditor({ options, setOptions, correctAnswersJson, setCorrectAnswersJson }) {
  const [localOptions, setLocalOptions] = useState(options || [
    { text: "True", isCorrect: false, feedback: "" },
    { text: "False", isCorrect: false, feedback: "" },
  ]);

  useEffect(() => {
    if (!options || options.length === 0) {
      const defaultOptions = [
        { text: "True", isCorrect: false, feedback: "" },
        { text: "False", isCorrect: false, feedback: "" },
      ];
      setLocalOptions(defaultOptions);
      setOptions(defaultOptions);
    } else {
      setLocalOptions(options);
    }
  }, [options, setOptions]);

  const handleOptionChange = (index, field, value) => {
    const updated = localOptions.map((opt, i) => {
      if (i === index) {
        const newOpt = { ...opt, [field]: value };
        // If setting isCorrect to true, unset others
        if (field === "isCorrect" && value === true) {
          updated.forEach((o, idx) => {
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
        <h4>True/False Options</h4>
      </div>

      <div className="options-list">
        {localOptions.map((option, index) => (
          <div key={index} className="option-item">
            <div className="option-header">
              <Form.Check
                type="radio"
                name="correctAnswer"
                checked={option.isCorrect}
                onChange={(e) => handleOptionChange(index, "isCorrect", e.target.checked)}
                label={`${option.text} is correct`}
              />
            </div>
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
    </div>
  );
}

