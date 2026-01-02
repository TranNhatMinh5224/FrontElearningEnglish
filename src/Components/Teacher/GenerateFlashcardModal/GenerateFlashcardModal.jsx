import React, { useState } from "react";
import { FaTimes, FaMagic } from "react-icons/fa";
import { dictionaryService } from "../../../Services/dictionaryService";
import "./GenerateFlashcardModal.css";

export default function GenerateFlashcardModal({ show, onClose, onGenerate }) {
  const [generateWord, setGenerateWord] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const handleGenerate = async () => {
    if (!generateWord.trim()) {
      setGenerateError("Vui lòng nhập từ vựng");
      return;
    }

    setGenerating(true);
    setGenerateError("");

    try {
      const response = await dictionaryService.generateFlashcard(generateWord.trim(), true);

      if (response.data?.success && response.data?.data) {
        const generatedData = response.data.data;
        
        // Call parent callback to fill form
        if (onGenerate) {
          onGenerate(generatedData);
        }

        // Close modal and reset
        handleClose();
      } else {
        setGenerateError(response.data?.message || "Không thể tạo flashcard từ từ này");
      }
    } catch (error) {
      console.error("Error generating flashcard:", error);
      setGenerateError(error.response?.data?.message || "Có lỗi xảy ra khi tạo flashcard");
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    setGenerateWord("");
    setGenerateError("");
    setGenerating(false);
    if (onClose) {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={() => !generating && handleClose()}>
      <div className="generate-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="generate-modal-header">
          <h3>Gen Flashcard</h3>
          {!generating && (
            <button
              type="button"
              className="close-btn"
              onClick={handleClose}
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className="generate-modal-body">
          {generating ? (
            <div className="generating-content">
              <div className="loading-spinner"></div>
              <p>Đang tạo flashcard từ từ vựng...</p>
              <small className="text-muted">Vui lòng đợi trong giây lát</small>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label required">Nhập từ vựng tiếng Anh</label>
                <input
                  type="text"
                  className={`form-control ${generateError ? "is-invalid" : ""}`}
                  value={generateWord}
                  onChange={(e) => {
                    setGenerateWord(e.target.value);
                    setGenerateError("");
                  }}
                  placeholder="Ví dụ: beautiful, hello, computer..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                  autoFocus
                />
                {generateError && <div className="invalid-feedback">{generateError}</div>}
                <div className="form-hint">Nhập từ vựng tiếng Anh để hệ thống tự động tạo flashcard</div>
              </div>
            </>
          )}
        </div>

        {!generating && (
          <div className="generate-modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={!generateWord.trim()}
            >
              <FaMagic className="me-2" />
              Gen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

