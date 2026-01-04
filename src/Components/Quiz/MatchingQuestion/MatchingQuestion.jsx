import React, { useState, useEffect } from "react";
import { Card, Row, Col, Badge } from "react-bootstrap";
import "./MatchingQuestion.css";

export default function MatchingQuestion({ question, answer, onChange }) {
    const options = question.options || question.Options || [];
    
    // Parse metadata
    let leftTexts = [];
    let rightTexts = [];
    try {
        const rawMeta = question.metadataJson || question.MetadataJson;
        console.log("📦 [MatchingQuestion] Raw Metadata:", rawMeta);
        const metadata = typeof rawMeta === 'string' ? JSON.parse(rawMeta || "{}") : (rawMeta || {});
        leftTexts = metadata.left || [];
        rightTexts = metadata.right || [];
    } catch (e) {
        console.error("Error parsing metadata for Matching:", e);
    }

    // Logic phân loại cực mạnh:
    // Thử dùng metadata trước, nếu không được thì dùng isCorrect, nếu không được thì chia đôi.
    let leftOptions = [];
    let rightOptions = [];

    if (leftTexts.length > 0) {
        // Cách 1: Dựa trên Metadata + isCorrect để đảm bảo chính xác (Fix bug trùng text)
        leftOptions = leftTexts.map(text => {
            return options.find(o => {
                const t = (o.optionText || o.text || o.Text || "").trim();
                const isTrue = o.isCorrect === true || o.IsCorrect === true;
                return t === text.trim() && isTrue;
            });
        }).filter(Boolean);

        rightOptions = rightTexts.map(text => {
            return options.find(o => {
                const t = (o.optionText || o.text || o.Text || "").trim();
                const isFalse = o.isCorrect === false || o.IsCorrect === false;
                return t === text.trim() && isFalse;
            });
        }).filter(Boolean);
    }

    // Nếu vẫn rỗng (do text không khớp hoặc metadata lỗi) -> Dùng logic isCorrect
    if (leftOptions.length === 0) {
        leftOptions = options.filter(o => o.isCorrect === true || o.IsCorrect === true);
        rightOptions = options.filter(o => o.isCorrect === false || o.IsCorrect === false);
    }

    // Nếu vẫn rỗng -> Chia đôi mảng (Fallback cuối cùng)
    if (leftOptions.length === 0) {
        const half = Math.ceil(options.length / 2);
        leftOptions = options.slice(0, half);
        rightOptions = options.slice(half);
    }

    // Map sang định dạng UI đồng nhất
    const finalLeft = leftOptions.map(opt => ({
        id: opt.optionId || opt.OptionId || opt.answerOptionId || opt.AnswerOptionId,
        text: opt.optionText || opt.OptionText || opt.text || opt.Text
    }));

    const finalRight = rightOptions.map(opt => ({
        id: opt.optionId || opt.OptionId || opt.answerOptionId || opt.AnswerOptionId,
        text: opt.optionText || opt.OptionText || opt.text || opt.Text
    }));

    const [matches, setMatches] = useState(() => {
        if (answer && typeof answer === 'object') {
            return answer;
        }
        return {};
    });

    const [selectedLeft, setSelectedLeft] = useState(null);
    const [selectedRight, setSelectedRight] = useState(null);

    useEffect(() => {
        onChange(matches);
    }, [matches]);

    const handleLeftClick = (leftId) => {
        const lid = Number(leftId);
        if (selectedLeft === lid) {
            setSelectedLeft(null);
        } else {
            setSelectedLeft(lid);
            if (selectedRight !== null) {
                const newMatches = { ...matches, [lid]: Number(selectedRight) };
                setMatches(newMatches);
                setSelectedLeft(null);
                setSelectedRight(null);
            }
        }
    };

    const handleRightClick = (rightId) => {
        const rid = Number(rightId);
        if (selectedRight === rid) {
            setSelectedRight(null);
        } else {
            setSelectedRight(rid);
            if (selectedLeft !== null) {
                const newMatches = { ...matches, [selectedLeft]: rid };
                setMatches(newMatches);
                setSelectedLeft(null);
                setSelectedRight(null);
            }
        }
    };

    const getMatchedRight = (leftId) => {
        return matches[leftId] || null;
    };

    const isRightMatched = (rightId) => {
        return Object.values(matches).map(Number).includes(Number(rightId));
    };

    const removeMatch = (leftId) => {
        const newMatches = { ...matches };
        delete newMatches[leftId];
        setMatches(newMatches);
    };

    return (
        <Card className="matching-question p-3 mb-4 border-0 shadow-sm">
            <Card.Body>
                <div className="matching-instructions mb-4">
                    <Card.Title as="h5" className="fw-bold text-primary mb-2">
                        <i className="fa fa-link me-2"></i>Nối các cặp từ tương ứng
                    </Card.Title>
                    <Card.Text className="text-muted small">
                        Nhấp vào một mục ở cột trái, sau đó nhấp vào mục tương ứng ở cột phải để nối chúng lại với nhau.
                    </Card.Text>
                </div>
                <Row className="matching-container g-4">
                    <Col md={6}>
                        <div className="matching-column p-2 bg-light rounded">
                            <h6 className="column-title text-center mb-3 fw-bold text-secondary">Cột trái</h6>
                            {finalLeft.map((option, index) => {
                                const matchedRightId = getMatchedRight(option.id);
                                const isSelected = selectedLeft === option.id;
                                
                                // Tìm text của vế phải đã nối để hiển thị preview
                                const matchedOption = finalRight.find(r => r.id === matchedRightId);

                                return (
                                    <div key={option.id} className="position-relative mb-3">
                                        <Card
                                            className={`matching-item left-item border-2 transition-all ${isSelected ? "border-primary bg-primary text-white" : ""} ${matchedRightId ? "border-success bg-success-light" : ""}`}
                                            onClick={() => {
                                                if (matchedRightId) removeMatch(option.id);
                                                else handleLeftClick(option.id);
                                            }}
                                            style={{ cursor: "pointer", minHeight: '50px' }}
                                        >
                                            <Card.Body className="p-2 d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center">
                                                    <Badge bg={isSelected ? "light" : "primary"} text={isSelected ? "dark" : "white"} className="me-2">{index + 1}</Badge>
                                                    <span className="fw-medium">{option.text}</span>
                                                </div>
                                                {matchedRightId && <i className="fa fa-check-circle text-success"></i>}
                                            </Card.Body>
                                        </Card>
                                        {matchedRightId && matchedOption && (
                                            <div className="matched-preview small text-success fw-bold mt-1 ms-2">
                                                ➜ {matchedOption.text}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="matching-column">
                            <h6 className="column-title text-center mb-3 fw-bold text-secondary">Cột phải</h6>
                            {finalRight.map((option, index) => {
                                const isMatched = isRightMatched(option.id);
                                const isSelected = selectedRight === option.id;
                                return (
                                    <Card
                                        key={option.id}
                                        className={`matching-item right-item mb-3 border-2 transition-all ${isSelected ? "border-primary bg-primary text-white" : ""} ${isMatched ? "opacity-50 grayscale border-dashed" : "border-white shadow-sm"}`}
                                        onClick={() => {
                                            if (!isMatched) handleRightClick(option.id);
                                        }}
                                        style={{ cursor: isMatched ? "default" : "pointer", minHeight: '50px' }}
                                    >
                                        <Card.Body className="p-2 d-flex align-items-center">
                                            <Badge bg="secondary" className="me-2">{String.fromCharCode(65 + index)}</Badge>
                                            <span className="fw-medium">{option.text}</span>
                                        </Card.Body>
                                    </Card>
                                );
                            })}
                        </div>
                    </Col>
                </Row>
                <div className="matches-summary mt-4 d-flex justify-content-center">
                    <Badge bg="info" className="p-2 px-3">
                        Đã nối: {Object.keys(matches).length} / {finalLeft.length} cặp
                    </Badge>
                </div>
            </Card.Body>
        </Card>
    );
}

