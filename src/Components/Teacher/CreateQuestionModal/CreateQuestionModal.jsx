import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { questionService } from "../../../Services/questionService";
import "./CreateQuestionModal.css";

// Question Types from Backend Enum
const QUESTION_TYPES = {
  MultipleChoice: 1,
  MultipleAnswers: 2,
  TrueFalse: 3,
  FillBlank: 4,
  Matching: 5,
  Ordering: 6,
};

const CreateQuestionModal = ({
  show,
  onClose,
  onSuccess,
  sectionId,
  groupId,
  questionToUpdate,
  isBulkMode = false,
  onSaveDraft
}) => {
  const [formData, setFormData] = useState({
    stemText: "",
    explanation: "",
    points: 10,
    type: QUESTION_TYPES.MultipleChoice,
    options: [],
    matchingPairs: [], // For Matching type { key: "", value: "" }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (show) {
      if (questionToUpdate) {
        // Parse options and matching pairs from existing data
        let initialOptions = questionToUpdate.options || [];
        let initialPairs = [];

        // Try to parse Matching pairs if stored in CorrectAnswersJson or Metadata
        if (questionToUpdate.type === QUESTION_TYPES.Matching && questionToUpdate.correctAnswersJson) {
           try {
             initialPairs = typeof questionToUpdate.correctAnswersJson === 'string' 
                ? JSON.parse(questionToUpdate.correctAnswersJson) 
                : questionToUpdate.correctAnswersJson; // Handle if it's already an object
           } catch (e) {
             initialPairs = [{ key: "", value: "" }];
           }
        }
        
        // Also handle matchingPairs if it was passed directly (from bulk draft)
        if (questionToUpdate.matchingPairs) {
            initialPairs = questionToUpdate.matchingPairs;
        }

        setFormData({
          stemText: questionToUpdate.stemText || "",
          explanation: questionToUpdate.explanation || "",
          points: questionToUpdate.points || 10,
          type: questionToUpdate.type || QUESTION_TYPES.MultipleChoice,
          options: initialOptions,
          matchingPairs: initialPairs.length > 0 ? initialPairs : [{ key: "", value: "" }],
        });
      } else {
        resetForm(QUESTION_TYPES.MultipleChoice);
      }
      setError("");
    }
  }, [show, questionToUpdate]);

  const resetForm = (type) => {
    let defaultOptions = [];
    let defaultPairs = [];

    if (type === QUESTION_TYPES.MultipleChoice || type === QUESTION_TYPES.MultipleAnswers) {
      defaultOptions = [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ];
    } else if (type === QUESTION_TYPES.TrueFalse) {
      defaultOptions = [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ];
    } else if (type === QUESTION_TYPES.Ordering) {
      defaultOptions = [
        { text: "", isCorrect: true }, // Order implies correctness
        { text: "", isCorrect: true },
        { text: "", isCorrect: true },
      ];
    } else if (type === QUESTION_TYPES.Matching) {
      defaultPairs = [
        { key: "", value: "" },
        { key: "", value: "" },
      ];
    }

    setFormData({
      stemText: "",
      explanation: "",
      points: 10,
      type: type,
      options: defaultOptions,
      matchingPairs: defaultPairs,
    });
  };

  const handleTypeChange = (e) => {
    const newType = parseInt(e.target.value);
    resetForm(newType);
  };

  // --- Handlers for Options (MCQ, TrueFalse, Ordering) ---
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    if (field === "isCorrect" && formData.type === QUESTION_TYPES.MultipleChoice) {
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    } else if (field === "isCorrect" && formData.type === QUESTION_TYPES.TrueFalse) {
       newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    } else {
      newOptions[index][field] = value;
    }
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: "", isCorrect: formData.type === QUESTION_TYPES.Ordering }],
    });
  };

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const moveOption = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formData.options.length - 1) return;
    
    const newOptions = [...formData.options];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]];
    setFormData({ ...formData, options: newOptions });
  };

  // --- Handlers for Matching Pairs ---
  const handlePairChange = (index, field, value) => {
    const newPairs = [...formData.matchingPairs];
    newPairs[index][field] = value;
    setFormData({ ...formData, matchingPairs: newPairs });
  };

  const addPair = () => {
    setFormData({
      ...formData,
      matchingPairs: [...formData.matchingPairs, { key: "", value: "" }],
    });
  };

  const removePair = (index) => {
    const newPairs = formData.matchingPairs.filter((_, i) => i !== index);
    setFormData({ ...formData, matchingPairs: newPairs });
  };

  // --- Validation & Submit ---
  const validateForm = () => {
    if (!formData.stemText.trim()) return "Vui lòng nhập nội dung câu hỏi";

    if (formData.type === QUESTION_TYPES.MultipleChoice || formData.type === QUESTION_TYPES.MultipleAnswers || formData.type === QUESTION_TYPES.TrueFalse) {
       const hasCorrect = formData.options.some((opt) => opt.isCorrect);
       if (!hasCorrect) return "Vui lòng chọn ít nhất một đáp án đúng";
       if (formData.options.some(opt => !opt.text.trim())) return "Nội dung đáp án không được để trống";
    }

    if (formData.type === QUESTION_TYPES.Ordering) {
        if (formData.options.length < 2) return "Cần ít nhất 2 phần tử để sắp xếp";
        if (formData.options.some(opt => !opt.text.trim())) return "Nội dung phần tử không được để trống";
    }

    if (formData.type === QUESTION_TYPES.Matching) {
        if (formData.matchingPairs.length < 2) return "Cần ít nhất 2 cặp để nối";
        if (formData.matchingPairs.some(p => !p.key.trim() || !p.value.trim())) return "Nội dung cặp nối không được để trống";
    }

    if (formData.type === QUESTION_TYPES.FillBlank) {
        // Check regex for [...]
        const regex = /\[(.*?)\]/g;
        if (!regex.test(formData.stemText)) return "Vui lòng dùng dấu ngoặc vuông [từ đúng] để đánh dấu từ cần điền.";
    }

    return null;
  };

  const handleSubmit = async () => {
    const errorMsg = validateForm();
    if (errorMsg) {
        setError(errorMsg);
        return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        questionId: questionToUpdate?.questionId, // Might be null for new
        stemText: formData.stemText,
        explanation: formData.explanation,
        points: formData.points,
        type: formData.type,
        quizSectionId: sectionId || null,
        quizGroupId: groupId || null,
        options: [],
        correctAnswersJson: null
      };

      // Prepare payload based on type
      if (formData.type === QUESTION_TYPES.Matching) {
        // Save pairs in correctAnswersJson
        payload.correctAnswersJson = JSON.stringify(formData.matchingPairs);
        // Save original pairs in payload too (for draft editing reuse)
        payload.matchingPairs = formData.matchingPairs;
        
        // Populate options for Student View (Left items + Right items)
        // MatchingQuestion.jsx expects a flat list and splits it in half (Left then Right)
        const leftOptions = formData.matchingPairs.map(p => ({ text: p.key, isCorrect: false }));
        const rightOptions = formData.matchingPairs.map(p => ({ text: p.value, isCorrect: false }));
        payload.options = [...leftOptions, ...rightOptions];

      } else if (formData.type === QUESTION_TYPES.FillBlank) {
         // StemText contains the brackets. Backend logic should handle this.
         // Just in case, we can pass correct answers in Options
         const matches = [...formData.stemText.matchAll(/\[(.*?)\]/g)];
         payload.options = matches.map(m => ({
             text: m[1],
             isCorrect: true
         }));
      } else {
        // MCQ, TrueFalse, Ordering
        payload.options = formData.options.map(opt => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
            feedback: opt.feedback || null
        }));
      }

      // --- BULK MODE HANDLING ---
      if (isBulkMode && onSaveDraft) {
        onSaveDraft(payload);
        onClose();
        return;
      }

      // --- NORMAL API MODE ---
      let response;
      if (questionToUpdate) {
        response = await questionService.updateQuestion(questionToUpdate.questionId, payload);
      } else {
        response = await questionService.createQuestion(payload);
      }

      if (response.data?.success) {
        onSuccess(response.data.data);
        onClose();
      } else {
        setError(response.data?.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  // --- Render Helpers ---
  const renderMCQOptions = () => (
    <>
      {formData.options.map((option, index) => (
        <div key={index} className="d-flex align-items-center mb-2 gap-2">
            <Form.Check
            type={formData.type === QUESTION_TYPES.MultipleAnswers ? "checkbox" : "radio"}
            name="correctAnswer"
            checked={option.isCorrect}
            onChange={(e) => handleOptionChange(index, "isCorrect", e.target.checked)}
            className="mt-1"
            />
            <Form.Control
            type="text"
            value={option.text}
            onChange={(e) => handleOptionChange(index, "text", e.target.value)}
            placeholder={`Đáp án ${index + 1}`}
            />
            {formData.type !== QUESTION_TYPES.TrueFalse && (
            <Button variant="outline-danger" size="sm" onClick={() => removeOption(index)}>
                <FaTrash />
            </Button>
            )}
        </div>
      ))}
      {formData.type !== QUESTION_TYPES.TrueFalse && (
        <Button variant="outline-primary" size="sm" onClick={addOption}>
            <FaPlus className="me-1" /> Thêm đáp án
        </Button>
      )}
    </>
  );

  const renderOrderingOptions = () => (
    <>
        <div className="alert alert-info py-2 small">
            Nhập các bước theo đúng thứ tự. Hệ thống sẽ tự động xáo trộn khi hiển thị cho học sinh.
        </div>
        {formData.options.map((option, index) => (
            <div key={index} className="d-flex align-items-center mb-2 gap-2">
                <span className="badge bg-secondary">{index + 1}</span>
                <Form.Control
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                    placeholder={`Bước ${index + 1}`}
                />
                <div className="d-flex flex-column gap-1">
                    <Button variant="light" size="sm" className="py-0 px-2" onClick={() => moveOption(index, 'up')}>
                        <FaArrowUp size={10}/>
                    </Button>
                    <Button variant="light" size="sm" className="py-0 px-2" onClick={() => moveOption(index, 'down')}>
                        <FaArrowDown size={10}/>
                    </Button>
                </div>
                <Button variant="outline-danger" size="sm" onClick={() => removeOption(index)}>
                    <FaTrash />
                </Button>
            </div>
        ))}
        <Button variant="outline-primary" size="sm" onClick={addOption}>
            <FaPlus className="me-1" /> Thêm bước
        </Button>
    </>
  );

  const renderMatchingOptions = () => (
    <>
        <div className="alert alert-info py-2 small">
            Nhập các cặp từ tương ứng (Vế Trái - Vế Phải).
        </div>
        {formData.matchingPairs.map((pair, index) => (
            <Row key={index} className="mb-2 align-items-center">
                <Col md={5}>
                    <Form.Control
                        type="text"
                        value={pair.key}
                        onChange={(e) => handlePairChange(index, "key", e.target.value)}
                        placeholder={`Vế trái ${index + 1}`}
                    />
                </Col>
                <Col md={1} className="text-center">➡</Col>
                <Col md={5}>
                    <Form.Control
                        type="text"
                        value={pair.value}
                        onChange={(e) => handlePairChange(index, "value", e.target.value)}
                        placeholder={`Vế phải ${index + 1}`}
                    />
                </Col>
                <Col md={1}>
                    <Button variant="outline-danger" size="sm" onClick={() => removePair(index)}>
                        <FaTrash />
                    </Button>
                </Col>
            </Row>
        ))}
        <Button variant="outline-primary" size="sm" onClick={addPair}>
            <FaPlus className="me-1" /> Thêm cặp
        </Button>
    </>
  );

  const renderFillBlankOptions = () => (
      <div className="alert alert-info small">
          <strong>Hướng dẫn:</strong> Nhập câu hỏi vào ô "Nội dung câu hỏi" ở trên. 
          Sử dụng dấu ngoặc vuông <code>[]</code> để bao quanh từ cần điền. <br/>
          Ví dụ: <code>Hanoi is the [capital] of Vietnam.</code>
      </div>
  );

  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>{questionToUpdate ? "Cập nhật câu hỏi" : "Tạo câu hỏi mới"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}

        <Form>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Loại câu hỏi</Form.Label>
                <Form.Select
                  value={formData.type}
                  onChange={handleTypeChange}
                  disabled={!!questionToUpdate}
                >
                  <option value={QUESTION_TYPES.MultipleChoice}>Trắc nghiệm (1 đáp án)</option>
                  <option value={QUESTION_TYPES.MultipleAnswers}>Trắc nghiệm (Nhiều đáp án)</option>
                  <option value={QUESTION_TYPES.TrueFalse}>Đúng / Sai</option>
                  <option value={QUESTION_TYPES.FillBlank}>Điền từ (Fill in blanks)</option>
                  <option value={QUESTION_TYPES.Matching}>Nối từ (Matching)</option>
                  <option value={QUESTION_TYPES.Ordering}>Sắp xếp (Ordering)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Điểm số</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Nội dung câu hỏi</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.stemText}
              onChange={(e) => setFormData({ ...formData, stemText: e.target.value })}
              placeholder={formData.type === QUESTION_TYPES.FillBlank ? "Ví dụ: Hanoi is the [capital] of Vietnam." : "Nhập câu hỏi..."}
            />
          </Form.Group>

          <div className="mb-3">
            <Form.Label>Thiết lập đáp án</Form.Label>
            <div className="options-container">
                {(formData.type === QUESTION_TYPES.MultipleChoice || 
                  formData.type === QUESTION_TYPES.MultipleAnswers || 
                  formData.type === QUESTION_TYPES.TrueFalse) && renderMCQOptions()}
                
                {formData.type === QUESTION_TYPES.Ordering && renderOrderingOptions()}
                
                {formData.type === QUESTION_TYPES.Matching && renderMatchingOptions()}
                
                {formData.type === QUESTION_TYPES.FillBlank && renderFillBlankOptions()}
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Giải thích (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Giải thích tại sao đáp án này đúng..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Đang xử lý..." : questionToUpdate ? "Cập nhật" : "Tạo câu hỏi"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateQuestionModal;
