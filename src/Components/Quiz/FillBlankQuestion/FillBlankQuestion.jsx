import React, { useState, useEffect, useMemo } from "react";
import "./FillBlankQuestion.css";

/**
 * FillBlankQuestion
 * Logic: Parse text chứa các cụm [đáp án] thành câu có ô Input.
 */
export default function FillBlankQuestion({ question, answer, onChange }) {
    // Lấy nội dung câu hỏi từ nhiều nguồn có thể có của Backend
    const text = useMemo(() => {
        return (
            question?.questionText || 
            question?.QuestionText || 
            question?.stemText || 
            question?.StemText || 
            ""
        );
    }, [question]);

    // Parse nội dung để tìm các ô trống
    const parts = useMemo(() => text.split(/(\[.*?\])/g), [text]);
    
    // Đếm số lượng ô trống thực tế
    const blanksCount = useMemo(() => {
        return parts.filter(p => p.startsWith('[') && p.endsWith(']')).length;
    }, [parts]);

    // Khởi tạo state inputs
    const [inputs, setInputs] = useState(() => {
        try {
            if (typeof answer === 'string' && answer.startsWith('[')) {
                return JSON.parse(answer);
            }
            if (Array.isArray(answer)) return answer;
            if (answer && typeof answer === 'string') return [answer];
        } catch (e) {
            console.error("FillBlank Error parsing answer:", e);
        }
        return new Array(blanksCount).fill("");
    });

    // Đồng bộ inputs khi blanksCount thay đổi (tránh lỗi lệch index)
    useEffect(() => {
        if (inputs.length < blanksCount) {
            setInputs(prev => {
                const next = [...prev];
                while (next.length < blanksCount) next.push("");
                return next;
            });
        }
    }, [blanksCount]);

    const handleInputChange = (index, value) => {
        const newInputs = [...inputs];
        newInputs[index] = value;
        setInputs(newInputs);
        
        // Gửi kết quả về parent để nộp bài
        if (blanksCount === 1) {
            // Nếu chỉ có 1 ô, gửi chính xác giá trị text (đã trim) để backend so sánh chuỗi
            onChange(value.trim()); 
        } else {
            // Nếu nhiều ô, gửi chuỗi nối (logic mặc định của backend cũ)
            onChange(newInputs.map(i => i.trim()).join(", "));
        }
    };

    if (!text) return null;

    let currentBlankIdx = 0;

    return (
        <div className="fill-blank-question-container mt-3 p-4 bg-white rounded shadow-sm border">
            <div className="fill-blank-sentence" style={{ lineHeight: '3.5rem', fontSize: '1.25rem', color: '#333' }}>
                {parts.map((part, i) => {
                    // Nếu part là cụm [đáp án]
                    if (part.startsWith('[') && part.endsWith(']')) {
                        const index = currentBlankIdx++;
                        return (
                            <input
                                key={i}
                                type="text"
                                className="fill-blank-inline-input"
                                value={inputs[index] || ""}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                placeholder="........"
                                autoComplete="off"
                                style={{
                                    width: '150px',
                                    border: 'none',
                                    borderBottom: '3px solid #41d6e3',
                                    backgroundColor: '#f8f9fa',
                                    textAlign: 'center',
                                    margin: '0 8px',
                                    padding: '2px 10px',
                                    outline: 'none',
                                    fontWeight: 'bold',
                                    color: '#0d6efd',
                                    transition: 'all 0.3s'
                                }}
                            />
                        );
                    }
                    // Nếu là text bình thường
                    return <span key={i}>{part}</span>;
                })}
            </div>

            {/* Fallback: Nếu giáo viên quên dùng ngoặc vuông [] nhưng vẫn chọn loại câu hỏi điền từ */}
            {blanksCount === 0 && (
                <div className="mt-4 border-top pt-3">
                    <label className="form-label text-muted small">Câu trả lời của bạn:</label>
                    <input
                        type="text"
                        className="form-control form-control-lg"
                        value={inputs[0] || ""}
                        onChange={(e) => handleInputChange(0, e.target.value)}
                        placeholder="Nhập đáp án tại đây..."
                    />
                </div>
            )}

            <div className="mt-4 pt-3 border-top d-flex align-items-center text-muted small">
                <span className="badge bg-info me-2">Mẹo</span>
                Nhấp vào vùng màu xanh để điền từ còn thiếu vào chỗ trống.
            </div>
        </div>
    );
}
