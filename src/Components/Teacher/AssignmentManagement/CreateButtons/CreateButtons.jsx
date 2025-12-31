import React from "react";
import { Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import "./CreateButtons.css";

export default function CreateButtons({ onCreateQuiz, onCreateEssay }) {
    return (
        <div className="create-buttons-container">
            <Button
                variant="primary"
                className="create-quiz-btn"
                onClick={onCreateQuiz}
                size="lg"
            >
                <FaPlus className="me-2" />
                Tạo Quiz mới
            </Button>
            <Button
                variant="info"
                className="create-essay-btn"
                onClick={onCreateEssay}
                size="lg"
            >
                <FaPlus className="me-2" />
                Tạo Essay mới
            </Button>
        </div>
    );
}

