import React, { useState } from "react";
import { FaTimes, FaSearch, FaExternalLinkAlt } from "react-icons/fa";
import { dictionaryService } from "../../../Services/dictionaryService";
import "./LookupWordModal.css";

export default function LookupWordModal({ show, onClose }) {
  const [lookupWord, setLookupWord] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupResult, setLookupResult] = useState(null);

  const handleLookup = async () => {
    if (!lookupWord.trim()) {
      setLookupError("Vui lòng nhập từ vựng");
      return;
    }

    setLookingUp(true);
    setLookupError("");
    setLookupResult(null);

    try {
      const response = await dictionaryService.lookupWord(lookupWord.trim(), "vi");

      if (response.data?.success && response.data?.data) {
        setLookupResult(response.data.data);
      } else {
        setLookupError(response.data?.message || "Không tìm thấy từ này trong từ điển");
      }
    } catch (error) {
      console.error("Error looking up word:", error);
      setLookupError(error.response?.data?.message || "Có lỗi xảy ra khi tra từ");
    } finally {
      setLookingUp(false);
    }
  };

  const handleClose = () => {
    setLookupWord("");
    setLookupError("");
    setLookupResult(null);
    setLookingUp(false);
    if (onClose) {
      onClose();
    }
  };

  const handleLookupAnother = () => {
    setLookupResult(null);
    setLookupWord("");
    setLookupError("");
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={() => !lookingUp && handleClose()}>
      <div className="lookup-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="generate-modal-header">
          <h3>Tra từ</h3>
          {!lookingUp && (
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
          {lookingUp ? (
            <div className="generating-content">
              <div className="loading-spinner"></div>
              <p>Đang tra từ...</p>
              <small className="text-muted">Vui lòng đợi trong giây lát</small>
            </div>
          ) : lookupResult ? (
            <div className="lookup-result-content">
              {/* Word and Phonetic */}
              <div className="lookup-word-header mb-3">
                <h2 className="lookup-word-title">{lookupResult.word || lookupResult.Word}</h2>
                {lookupResult.phonetic || lookupResult.Phonetic ? (
                  <p className="lookup-phonetic text-muted mb-2">
                    {lookupResult.phonetic || lookupResult.Phonetic}
                  </p>
                ) : null}
                {lookupResult.sourceUrl || lookupResult.SourceUrl ? (
                  <a
                    href={lookupResult.sourceUrl || lookupResult.SourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lookup-source-link d-inline-flex align-items-center gap-1"
                  >
                    <FaExternalLinkAlt size={12} />
                    Xem thêm
                  </a>
                ) : null}
              </div>

              {/* Meanings */}
              {lookupResult.meanings && lookupResult.meanings.length > 0 && (
                <div className="lookup-meanings">
                  {lookupResult.meanings.map((meaning, meaningIndex) => (
                    <div key={meaningIndex} className="lookup-meaning-item mb-4">
                      <h4 className="lookup-part-of-speech">
                        {meaning.partOfSpeech || meaning.PartOfSpeech}
                      </h4>

                      {/* Definitions */}
                      {meaning.definitions && meaning.definitions.length > 0 && (
                        <div className="lookup-definitions">
                          {meaning.definitions.map((def, defIndex) => (
                            <div key={defIndex} className="lookup-definition-item mb-3">
                              <p className="lookup-definition-text">
                                {defIndex + 1}. {def.definition || def.Definition}
                              </p>
                              {def.example || def.Example ? (
                                <p className="lookup-example text-muted">
                                  <em>Ví dụ: {def.example || def.Example}</em>
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Synonyms */}
                      {meaning.synonyms && meaning.synonyms.length > 0 && (
                        <div className="lookup-synonyms mb-2">
                          <strong>Đồng nghĩa: </strong>
                          <span>{meaning.synonyms.join(", ")}</span>
                        </div>
                      )}

                      {/* Antonyms */}
                      {meaning.antonyms && meaning.antonyms.length > 0 && (
                        <div className="lookup-antonyms">
                          <strong>Trái nghĩa: </strong>
                          <span>{meaning.antonyms.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Audio URL if available */}
              {lookupResult.audioUrl || lookupResult.AudioUrl ? (
                <div className="lookup-audio mt-3">
                  <audio controls src={lookupResult.audioUrl || lookupResult.AudioUrl} className="w-100">
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label required">Nhập từ vựng tiếng Anh</label>
                <input
                  type="text"
                  className={`form-control ${lookupError ? "is-invalid" : ""}`}
                  value={lookupWord}
                  onChange={(e) => {
                    setLookupWord(e.target.value);
                    setLookupError("");
                  }}
                  placeholder="Ví dụ: apple, beautiful, computer..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleLookup();
                    }
                  }}
                  autoFocus
                />
                {lookupError && <div className="invalid-feedback">{lookupError}</div>}
                <div className="form-hint">Nhập từ vựng tiếng Anh để tra cứu thông tin chi tiết</div>
              </div>
            </>
          )}
        </div>

        {!lookingUp && (
          <div className="generate-modal-footer">
            {lookupResult ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleLookupAnother}
              >
                Tra từ khác
              </button>
            ) : (
              <>
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
                  onClick={handleLookup}
                  disabled={!lookupWord.trim()}
                >
                  <FaSearch className="me-2" />
                  Tra
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

