import React from "react";
import MultipleChoiceQuestion from "../MultipleChoiceQuestion/MultipleChoiceQuestion";
import MatchingQuestion from "../MatchingQuestion/MatchingQuestion";
import OrderingQuestion from "../OrderingQuestion/OrderingQuestion";
import FillBlankQuestion from "../FillBlankQuestion/FillBlankQuestion";
import TrueFalseQuestion from "../TrueFalseQuestion/TrueFalseQuestion";
import { Card, Row, Col, Badge } from "react-bootstrap";
import "./QuestionCard.css";

export default function QuestionCard({ question, answer, onChange, questionNumber, totalQuestions }) {
    // Handle both camelCase and PascalCase
    const questionType = question?.type !== undefined ? question.type : (question?.Type !== undefined ? question.Type : 0);

    const renderQuestion = () => {
        if (!question) return null;

        switch (questionType) {
            case 1: // MultipleChoice
                return (
                    <MultipleChoiceQuestion
                        question={question}
                        answer={answer}
                        onChange={onChange}
                    />
                );
            case 2: // MultipleAnswers
                return (
                    <MultipleChoiceQuestion
                        question={question}
                        answer={answer}
                        onChange={onChange}
                        multiple={true}
                    />
                );
            case 3: // TrueFalse
                return (
                    <TrueFalseQuestion
                        question={question}
                        answer={answer}
                        onChange={onChange}
                    />
                );
            case 4: // FillBlank
                return (
                    <FillBlankQuestion
                        question={question}
                        answer={answer}
                        onChange={onChange}
                    />
                );
            case 5: // Matching
                return (
                    <MatchingQuestion
                        question={question}
                        answer={answer}
                        onChange={onChange}
                    />
                );
            case 6: // Ordering
                return (
                    <OrderingQuestion
                        question={question}
                        answer={answer}
                        onChange={onChange}
                    />
                );
            default:
                return (
                    <MultipleChoiceQuestion
                        question={question}
                        answer={answer}
                        onChange={onChange}
                    />
                );
        }
    };

    if (!question) {
        return (
            <Card className="question-card">
                <Card.Body>
                    <div className="no-question-message">Không có câu hỏi</div>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="question-card">
            <Card.Body>
                <Row className="question-header align-items-center">
                    <Col xs="auto" className="question-number">
                        Câu {questionNumber}/{totalQuestions}
                    </Col>
                    <Col xs="auto" className="question-points">
                        <Badge bg="info" className="px-3 py-2">
                            {question.points || question.Points || 0} điểm
                        </Badge>
                    </Col>
                </Row>
                <div className="question-content">
                    {questionType !== 4 && (
                        <div className="question-text">
                            {question.questionText || question.QuestionText || question.stemText || question.StemText || "Câu hỏi"}
                        </div>
                    )}
                    {(question.mediaUrl || question.MediaUrl) && (
                        <div className="question-media">
                            {(() => {
                                const mediaUrl = question.mediaUrl || question.MediaUrl;
                                if (mediaUrl.includes('.mp4') || mediaUrl.includes('.webm')) {
                                    return <video src={mediaUrl} controls className="media-element" />;
                                } else if (mediaUrl.includes('.mp3') || mediaUrl.includes('.wav')) {
                                    return <audio src={mediaUrl} controls className="media-element" />;
                                } else {
                                    return <img src={mediaUrl} alt="Question media" className="media-element" />;
                                }
                            })()}
                        </div>
                    )}
                    <div className="question-answer-section">
                        {renderQuestion()}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}

