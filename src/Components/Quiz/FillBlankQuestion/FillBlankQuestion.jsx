import React from "react";
import { Form } from "react-bootstrap";
import "./FillBlankQuestion.css";

export default function FillBlankQuestion({ question, answer, onChange }) {
    // For FillBlank, student is expected to type the answer.
    // We ignore any backend options provided for selection.
    
    const handleTextChange = (e) => {
        onChange(e.target.value);
    };

    return (
        <div className="fill-blank-question mt-3">
            <Form.Group>
                <Form.Label className="text-muted small mb-2">
                    Nhập câu trả lời của bạn vào ô bên dưới:
                </Form.Label>
                <Form.Control
                    type="text"
                    value={answer || ""}
                    onChange={handleTextChange}
                    placeholder="Điền từ còn thiếu..."
                    className="fill-blank-input p-3 border-2"
                    autoComplete="off"
                    autoFocus
                    style={{
                        fontSize: '1.1rem',
                        fontWeight: '500',
                        borderRadius: '10px',
                        border: '2px solid #e0e0e0'
                    }}
                />
                <Form.Text className="text-muted mt-2 d-block">
                    * Lưu ý: Hãy kiểm tra kỹ chính tả trước khi chuyển sang câu tiếp theo.
                </Form.Text>
            </Form.Group>
        </div>
    );
}

