import React, { useState, useEffect } from "react";
import { Card, Row, Col } from "react-bootstrap";
import "./MatchingQuestion.css";

export default function MatchingQuestion({ question, answer, onChange }) {
    const options = question.options || question.Options || [];
    
    // Split options into left and right columns
    // Assuming options are ordered: left1, right1, left2, right2, etc.
    const leftOptions = [];
    const rightOptions = [];
    
    // If metadata contains pairing info, use it; otherwise split evenly
    let metadata = {};
    try {
        metadata = JSON.parse(question.metadataJson || question.MetadataJson || "{}");
    } catch (e) {
        console.error("Error parsing metadata:", e);
    }

    // Simple approach: split options in half
    const half = Math.ceil(options.length / 2);
    options.forEach((option, index) => {
        const optionId = option.optionId || option.OptionId || option.answerOptionId || option.AnswerOptionId;
        const optionText = option.optionText || option.OptionText || option.text || option.Text;
        
        if (index < half) {
            leftOptions.push({ id: optionId, text: optionText });
        } else {
            rightOptions.push({ id: optionId, text: optionText });
        }
    });

    const [matches, setMatches] = useState(() => {
        // Initialize from answer if exists
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
        if (selectedLeft === leftId) {
            setSelectedLeft(null);
        } else {
            setSelectedLeft(leftId);
            if (selectedRight !== null) {
                // Create match
                const newMatches = { ...matches, [leftId]: selectedRight };
                setMatches(newMatches);
                setSelectedLeft(null);
                setSelectedRight(null);
            }
        }
    };

    const handleRightClick = (rightId) => {
        if (selectedRight === rightId) {
            setSelectedRight(null);
        } else {
            setSelectedRight(rightId);
            if (selectedLeft !== null) {
                // Create match
                const newMatches = { ...matches, [selectedLeft]: rightId };
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
        return Object.values(matches).includes(rightId);
    };

    const removeMatch = (leftId) => {
        const newMatches = { ...matches };
        delete newMatches[leftId];
        setMatches(newMatches);
    };

    return (
        <Card className="matching-question p-3 mb-4">
            <Card.Body>
                <div className="matching-instructions mb-3">
                    <Card.Title as="h5" className="mb-2">Nối các cặp từ/cụm từ tương ứng</Card.Title>
                    <Card.Text className="text-muted" style={{ fontSize: 15 }}>
                        Kéo thả hoặc click để nối các cặp từ/cụm từ tương ứng
                    </Card.Text>
                </div>
                <Row className="matching-container">
                    <Col md={6} className="mb-3 mb-md-0">
                        <div className="matching-column">
                            <h6 className="column-title mb-3">Cột trái</h6>
                            {leftOptions.map((option, index) => {
                                const matchedRight = getMatchedRight(option.id);
                                const isSelected = selectedLeft === option.id;
                                return (
                                    <Card
                                        key={option.id}
                                        className={`matching-item left-item mb-2 ${isSelected ? "selected" : ""} ${matchedRight ? "matched" : ""}`}
                                        onClick={() => {
                                            if (matchedRight) {
                                                removeMatch(option.id);
                                            } else {
                                                handleLeftClick(option.id);
                                            }
                                        }}
                                        body
                                        style={{ cursor: "pointer" }}
                                    >
                                        <span className="item-number me-2">{index + 1}</span>
                                        <span className="item-text">{option.text}</span>
                                        {matchedRight && (
                                            <span className="match-indicator ms-2">✓</span>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="matching-column">
                            <h6 className="column-title mb-3">Cột phải</h6>
                            {rightOptions.map((option, index) => {
                                const isMatched = isRightMatched(option.id);
                                const isSelected = selectedRight === option.id;
                                return (
                                    <Card
                                        key={option.id}
                                        className={`matching-item right-item mb-2 ${isSelected ? "selected" : ""} ${isMatched ? "matched" : ""}`}
                                        onClick={() => {
                                            if (!isMatched) {
                                                handleRightClick(option.id);
                                            }
                                        }}
                                        body
                                        style={{ cursor: !isMatched ? "pointer" : "not-allowed" }}
                                    >
                                        <span className="item-number me-2">{String.fromCharCode(65 + index)}</span>
                                        <span className="item-text">{option.text}</span>
                                    </Card>
                                );
                            })}
                        </div>
                    </Col>
                </Row>
                {Object.keys(matches).length > 0 && (
                    <div className="matches-summary mt-4">
                        <p>Đã nối: {Object.keys(matches).length} cặp</p>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}

