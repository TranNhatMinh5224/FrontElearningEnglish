import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { FaPlus, FaTrash, FaArrowsAltH } from "react-icons/fa";
import "./QuestionEditors.css";

export default function MatchingEditor({ options, setOptions, correctAnswersJson, setCorrectAnswersJson }) {
  const [localOptions, setLocalOptions] = useState(options || []);

  useEffect(() => {
    // Normalize options from backend - convert to matching format
    const normalizedOptions = (options || []).map((opt) => {
      // If options come from backend, they might have different structure
      // For matching, we need leftText and rightText
      if (opt.leftText !== undefined && opt.rightText !== undefined) {
        return opt;
      }
      // If it's a new option, ensure it has the right structure
      return {
        text: opt?.text || "",
        leftText: opt?.leftText || "",
        rightText: opt?.rightText || "",
        isCorrect: opt?.isCorrect !== undefined ? opt.isCorrect : true,
      };
    });
    setLocalOptions(normalizedOptions);
  }, [options]);

  const handleAddPair = () => {
    const newPair = {
      text: "", // Backend expects 'text' field for AnswerOption
      leftText: "",
      rightText: "",
      isCorrect: true,
    };
    const updated = [...localOptions, newPair];
    setLocalOptions(updated);
    setOptions(updated);
    updateCorrectAnswer(updated);
  };

  const handleRemovePair = (index) => {
    const updated = localOptions.filter((_, i) => i !== index);
    setLocalOptions(updated);
    setOptions(updated);
    updateCorrectAnswer(updated);
  };

  const handlePairChange = (index, field, value) => {
    const updated = localOptions.map((opt, i) => {
      if (i === index) {
        const updatedOpt = { ...opt, [field]: value };
        // For matching questions, we need to set 'text' field for backend compatibility
        // The text field can be a combination or just leftText for display
        if (field === "leftText" || field === "rightText") {
          updatedOpt.text = updatedOpt.leftText || "";
        }
        return updatedOpt;
      }
      return opt;
    });
    setLocalOptions(updated);
    setOptions(updated);
    updateCorrectAnswer(updated);
  };

  const updateCorrectAnswer = (opts) => {
    const pairs = opts
      .filter((opt) => {
        const left = opt?.leftText?.trim() || "";
        const right = opt?.rightText?.trim() || "";
        return left && right;
      })
      .map((opt) => ({
        left: (opt?.leftText?.trim() || ""),
        right: (opt?.rightText?.trim() || ""),
      }));
    if (pairs.length > 0) {
      setCorrectAnswersJson(JSON.stringify(pairs));
    } else {
      setCorrectAnswersJson(null);
    }
  };

  return (
    <div className="question-type-editor">
      <div className="editor-section-header">
        <h4>Matching Items</h4>
        <Button variant="outline-primary" size="sm" onClick={handleAddPair}>
          <FaPlus /> Add another answer
        </Button>
      </div>

      <div className="matching-info">
        <p className="text-muted">
          Tạo các cặp nối. Mục bên trái sẽ được hiển thị cho học viên, và họ cần nối với mục bên phải tương ứng.
        </p>
      </div>

      {localOptions.length === 0 ? (
        <div className="empty-options">
          <p>Chưa có cặp nối nào. Nhấn "Add another answer" để thêm.</p>
        </div>
      ) : (
        <div className="matching-pairs">
          <div className="matching-header">
            <div className="matching-column">Mục bên trái</div>
            <div className="matching-column">Mục bên phải</div>
            <div className="matching-actions"></div>
          </div>
          {localOptions.map((pair, index) => (
            <div key={index} className="matching-pair">
              <Form.Control
                type="text"
                value={pair?.leftText || ""}
                onChange={(e) => handlePairChange(index, "leftText", e.target.value)}
                placeholder="Banana"
                className="matching-input"
              />
              <div className="matching-arrow">
                <FaArrowsAltH />
              </div>
              <Form.Control
                type="text"
                value={pair?.rightText || ""}
                onChange={(e) => handlePairChange(index, "rightText", e.target.value)}
                placeholder="Quả chuối"
                className="matching-input"
              />
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleRemovePair(index)}
                className="matching-delete"
              >
                <FaTrash />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

