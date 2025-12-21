import React from "react";
import "./MemoryAssessment.css";

export default function MemoryAssessment({ selectedQuality, onQualitySelect }) {
    const qualityOptions = [
        { value: 1, label: "Không nhớ", color: "#ef4444" },
        { value: 2, label: "Hơi nhớ", color: "#f59e0b" },
        { value: 3, label: "Nhớ", color: "#3b82f6" },
        { value: 4, label: "Khá nhớ", color: "#10b981" },
        { value: 5, label: "Đã thuộc", color: "#8b5cf6" },
    ];

    return (
        <div className="memory-assessment-container">
            <p className="memory-assessment-question">
                Bạn nhớ từ này ở mức độ nào?
            </p>
            <div className="memory-assessment-buttons">
                {qualityOptions.map((option) => (
                    <button
                        key={option.value}
                        className={`memory-assessment-btn ${
                            selectedQuality === option.value ? "selected" : ""
                        }`}
                        style={{
                            backgroundColor:
                                selectedQuality === option.value
                                    ? option.color
                                    : "#ffffff",
                            color:
                                selectedQuality === option.value
                                    ? "#ffffff"
                                    : "#1f2937",
                            borderColor: option.color,
                        }}
                        onClick={() => onQualitySelect(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

