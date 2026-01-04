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

    // Parse nội dung để tìm các ô trống (hỗ trợ cả [...] và ___)
    const parts = useMemo(() => text.split(/(_+|\[.*?\])/g), [text]);
    
    // Đếm số lượng ô trống thực tế
    const blanksCount = useMemo(() => {
        return parts.filter(p => p.startsWith('_') || (p.startsWith('[') && p.endsWith(']'))).length;
    }, [parts]);

    // Parse answer helper
    const parseAnswer = (ans) => {
        try {
            if (!ans) return new Array(blanksCount).fill("");
            if (typeof ans === 'string' && ans.startsWith('[')) {
                const parsed = JSON.parse(ans);
                return Array.isArray(parsed) ? parsed : [ans];
            }
            if (Array.isArray(ans)) return ans;
            // Handle comma separated string logic if needed, or just treat as single
            if (typeof ans === 'string') {
                 if (blanksCount > 1 && ans.includes(", ")) return ans.split(", ");
                 return [ans];
            }
        } catch (e) {
            console.error("FillBlank Error parsing answer:", e);
        }
        return new Array(blanksCount).fill("");
    };

    // Khởi tạo state inputs
    const [inputs, setInputs] = useState(() => parseAnswer(answer));

    // Đồng bộ inputs khi answer hoặc blanksCount thay đổi (Fix bug chuyển câu hỏi không reset)
    useEffect(() => {
        const newInputs = parseAnswer(answer);
        // Ensure length match
        if (newInputs.length < blanksCount) {
             while (newInputs.length < blanksCount) newInputs.push("");
        }
        setInputs(newInputs);
    }, [answer, blanksCount]);

    const handleInputChange = (index, value) => {
        const newInputs = [...inputs];
        newInputs[index] = value;
        setInputs(newInputs);
        
        // Gửi kết quả về parent để nộp bài
        if (blanksCount === 1) {
            // Nếu chỉ có 1 ô, gửi chính xác giá trị text (đã trim) để backend so sánh chuỗi
            onChange(value); 
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
                    // Nếu part là cụm [đáp án] hoặc _ (bất kỳ độ dài nào)
                    if (part.startsWith('_') || (part.startsWith('[') && part.endsWith(']'))) {
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
