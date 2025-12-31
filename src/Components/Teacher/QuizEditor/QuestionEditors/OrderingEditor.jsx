import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa";
import "./QuestionEditors.css";

export default function OrderingEditor({ options, setOptions, correctAnswersJson, setCorrectAnswersJson }) {
  const [localOptions, setLocalOptions] = useState(options || []);

  useEffect(() => {
    setLocalOptions(options || []);
  }, [options]);

  const handleAddItem = () => {
    const newItem = {
      text: "",
      order: localOptions.length,
      isCorrect: true,
    };
    const updated = [...localOptions, newItem];
    setLocalOptions(updated);
    setOptions(updated);
    updateCorrectAnswer(updated);
  };

  const handleRemoveItem = (index) => {
    const updated = localOptions.filter((_, i) => i !== index);
    // Reorder
    updated.forEach((item, i) => {
      item.order = i;
    });
    setLocalOptions(updated);
    setOptions(updated);
    updateCorrectAnswer(updated);
  };

  const handleItemChange = (index, field, value) => {
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

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...localOptions];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    updated.forEach((item, i) => {
      item.order = i;
    });
    setLocalOptions(updated);
    setOptions(updated);
    updateCorrectAnswer(updated);
  };

  const handleMoveDown = (index) => {
    if (index === localOptions.length - 1) return;
    const updated = [...localOptions];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updated.forEach((item, i) => {
      item.order = i;
    });
    setLocalOptions(updated);
    setOptions(updated);
    updateCorrectAnswer(updated);
  };

  const updateCorrectAnswer = (opts) => {
    const orderedItems = opts
      .filter((opt) => opt.text.trim())
      .map((opt, index) => ({
        text: opt.text.trim(),
        order: index,
      }));
    if (orderedItems.length > 0) {
      setCorrectAnswersJson(JSON.stringify(orderedItems));
    } else {
      setCorrectAnswersJson(null);
    }
  };

  return (
    <div className="question-type-editor">
      <div className="editor-section-header">
        <h4>Ordering Items</h4>
        <Button variant="outline-primary" size="sm" onClick={handleAddItem}>
          <FaPlus /> Add another answer
        </Button>
      </div>

      <div className="ordering-info">
        <p className="text-muted">
          Sắp xếp các mục theo thứ tự đúng. Học viên sẽ cần sắp xếp lại các mục này theo đúng thứ tự.
        </p>
      </div>

      {localOptions.length === 0 ? (
        <div className="empty-options">
          <p>Chưa có mục nào. Nhấn "Add another answer" để thêm.</p>
        </div>
      ) : (
        <div className="ordering-items">
          {localOptions.map((item, index) => (
            <div key={index} className="ordering-item">
              <div className="ordering-order">
                <span className="order-number">{index + 1}</span>
              </div>
              <Form.Control
                type="text"
                value={item.text || ""}
                onChange={(e) => handleItemChange(index, "text", e.target.value)}
                placeholder="Enter item text"
                className="ordering-input"
              />
              <div className="ordering-actions">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  title="Move up"
                >
                  <FaArrowUp />
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === localOptions.length - 1}
                  title="Move down"
                >
                  <FaArrowDown />
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                >
                  <FaTrash />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

