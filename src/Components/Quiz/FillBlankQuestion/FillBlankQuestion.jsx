import React, { useState, useEffect } from "react";
import { Form, Card } from "react-bootstrap";
import "./FillBlankQuestion.css";

export default function FillBlankQuestion({ question, answer, onChange }) {
    const options = question.options || question.Options || [];
    const hasOptions = options && options.length > 0;
    
    const [selectedOptionId, setSelectedOptionId] = useState(() => {
        // If answer is a number (optionId), use it
        if (typeof answer === 'number') {
            return answer;
        }
        // If answer is a string and matches an optionId, convert it
        if (typeof answer === 'string' && !isNaN(parseInt(answer))) {
            return parseInt(answer);
        }
        return answer || "";
    });
    
    const [text, setText] = useState(() => {
        // If answer is a string and not a number, use it as text
        if (typeof answer === 'string' && isNaN(parseInt(answer))) {
            return answer;
        }
        return "";
    });

    useEffect(() => {
        if (hasOptions) {
            // For dropdown: send optionId (number)
            onChange(selectedOptionId);
        } else {
            // For textarea: send text (string)
            onChange(text);
        }
    }, [selectedOptionId, text, hasOptions]);

    if (hasOptions) {
        // FillBlank with options = Multiple choice style (giống MultipleChoice)
        return (
            <div className="fill-blank-question">
                <div className="options-list">
                    {options.map((option, index) => {
                        const optionId = option.optionId || option.OptionId || option.answerOptionId || option.AnswerOptionId;
                        const optionText = option.optionText || option.OptionText || option.text || option.Text;
                        const selected = selectedOptionId === optionId;
                        return (
                            <Card
                                key={optionId || index}
                                className={`option-item${selected ? " selected" : ""}`}
                                onClick={() => setSelectedOptionId(optionId)}
                                style={{ cursor: "pointer", borderColor: selected ? "#41d6e3" : undefined }}
                            >
                                <Card.Body className="option-content">
                                    <span className="option-label">
                                        {String.fromCharCode(65 + index)}. {optionText}
                                    </span>
                                </Card.Body>
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    }

    // FillBlank without options = Textarea
    return (
        <div className="fill-blank-question">
            <Form.Group>
                <Form.Control
                    as="textarea"
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Nhập câu trả lời của bạn..."
                    className="fill-blank-input"
                />
            </Form.Group>
        </div>
    );
}

