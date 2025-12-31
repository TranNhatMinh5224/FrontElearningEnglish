import React from "react";
import { Card } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./EssayList.css";

export default function EssayList({ essays, onEdit, onDelete }) {
    if (!essays || essays.length === 0) {
        return (
            <div className="essay-list-container">
                <h3 className="section-title">Các bài Essay đã tạo</h3>
                <div className="empty-message">
                    <p>Chưa có bài Essay nào</p>
                </div>
            </div>
        );
    }

    return (
        <div className="essay-list-container">
            <h3 className="section-title">Các bài Essay đã tạo</h3>
            <div className="essay-cards">
                {essays.map((essay) => {
                    const essayId = essay.essayId || essay.EssayId;
                    const assessmentId = essay.assessmentId || essay.AssessmentId;
                    const title = essay.title || essay.Title || "Untitled Essay";
                    // Use assessmentIsPublished from assessment, not essay status
                    const isPublished = essay.assessmentIsPublished !== undefined 
                        ? essay.assessmentIsPublished 
                        : (essay.AssessmentIsPublished !== undefined ? essay.AssessmentIsPublished : false);

                    return (
                        <Card
                            key={essayId || assessmentId}
                            className="essay-card"
                            onClick={() => onEdit(essay)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Card.Body>
                                <div className="essay-card-header">
                                    <h5 className="essay-title">{title}</h5>
                                    <div className="essay-actions" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="action-btn edit-btn"
                                            onClick={() => onEdit(essay)}
                                            title="Chỉnh sửa"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() => onDelete(essay)}
                                            title="Xóa"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                                <div className="essay-card-footer">
                                    <span className={`status-badge ${isPublished ? "published" : "draft"}`}>
                                        {isPublished ? "Published" : "Draft"}
                                    </span>
                                </div>
                            </Card.Body>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

