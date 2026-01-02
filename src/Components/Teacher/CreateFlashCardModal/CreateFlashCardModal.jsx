import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { flashcardService } from "../../../Services/flashcardService";
import "./CreateFlashCardModal.css";

export default function CreateFlashCardModal({ 
  show, 
  onClose, 
  onSuccess, 
  moduleId 
}) {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [example, setExample] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!show) {
      setWord("");
      setMeaning("");
      setPronunciation("");
      setPartOfSpeech("");
      setExample("");
      setErrors({});
    }
  }, [show]);

  const validateForm = () => {
    const newErrors = {};
    if (!word.trim()) {
      newErrors.word = "Từ vựng là bắt buộc";
    }
    if (!meaning.trim()) {
      newErrors.meaning = "Nghĩa của từ là bắt buộc";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const flashcardData = {
        moduleId: parseInt(moduleId),
        word: word.trim(),
        meaning: meaning.trim(),
        pronunciation: pronunciation.trim() || null,
        partOfSpeech: partOfSpeech.trim() || null,
        example: example.trim() || null,
      };

      const response = await flashcardService.createFlashcard(flashcardData);
      
      if (response.data?.success) {
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.data?.message || "Tạo flashcard thất bại");
      }
    } catch (error) {
      console.error("Error creating flashcard:", error);
      setErrors({ submit: error.response?.data?.message || error.message || "Có lỗi xảy ra khi tạo flashcard" });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = word.trim() && meaning.trim();

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      className="create-flashcard-modal"
      dialogClassName="create-flashcard-modal-dialog"
    >
      <Modal.Header closeButton>
        <Modal.Title>Tạo Flashcard</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label required">Từ vựng</label>
            <input
              type="text"
              className={`form-control ${errors.word ? "is-invalid" : ""}`}
              value={word}
              onChange={(e) => {
                setWord(e.target.value);
                setErrors({ ...errors, word: null });
              }}
              placeholder="Nhập từ vựng"
            />
            {errors.word && <div className="invalid-feedback">{errors.word}</div>}
            <div className="form-hint">*Bắt buộc</div>
          </div>

          <div className="form-group">
            <label className="form-label required">Nghĩa</label>
            <textarea
              className={`form-control ${errors.meaning ? "is-invalid" : ""}`}
              value={meaning}
              onChange={(e) => {
                setMeaning(e.target.value);
                setErrors({ ...errors, meaning: null });
              }}
              placeholder="Nhập nghĩa của từ"
              rows={3}
            />
            {errors.meaning && <div className="invalid-feedback">{errors.meaning}</div>}
            <div className="form-hint">*Bắt buộc</div>
          </div>

          <div className="form-group">
            <label className="form-label">Phiên âm</label>
            <input
              type="text"
              className="form-control"
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
              placeholder="Nhập phiên âm (ví dụ: /wɜːrd/)"
            />
            <div className="form-hint">Không bắt buộc</div>
          </div>

          <div className="form-group">
            <label className="form-label">Từ loại</label>
            <input
              type="text"
              className="form-control"
              value={partOfSpeech}
              onChange={(e) => setPartOfSpeech(e.target.value)}
              placeholder="Nhập từ loại (ví dụ: noun, verb, adjective)"
            />
            <div className="form-hint">Không bắt buộc</div>
          </div>

          <div className="form-group">
            <label className="form-label">Ví dụ</label>
            <textarea
              className="form-control"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="Nhập câu ví dụ"
              rows={2}
            />
            <div className="form-hint">Không bắt buộc</div>
          </div>

          {errors.submit && (
            <div className="alert alert-danger mt-3">{errors.submit}</div>
          )}
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Huỷ
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!isFormValid || submitting}
        >
          {submitting ? "Đang tạo..." : "Tạo"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

