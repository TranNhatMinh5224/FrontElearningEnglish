import React, { useState, useEffect } from "react";
import { FaClock } from "react-icons/fa";
import { Card, ProgressBar } from "react-bootstrap";
import "./QuizTimer.css";

export default function QuizTimer({ timeLimit, remainingTime, onTimeUp }) {
    const hasCalledTimeUp = React.useRef(false);
    
    // remainingTime được tính real-time từ parent (QuizDetail)
    // Chỉ cần hiển thị và gọi onTimeUp khi hết thời gian (chỉ một lần)
    useEffect(() => {
        if (remainingTime !== null && remainingTime !== undefined && remainingTime <= 0 && !hasCalledTimeUp.current) {
            hasCalledTimeUp.current = true;
            console.log("⏰ QuizTimer: Time is up, calling onTimeUp");
            onTimeUp?.();
        }
    }, [remainingTime, onTimeUp]);

    const formatTime = (seconds) => {
        if (seconds === null || seconds === undefined || isNaN(seconds)) return "00:00";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const isWarning = remainingTime !== null && remainingTime !== undefined && remainingTime < 300; // Less than 5 minutes
    const isDanger = remainingTime !== null && remainingTime !== undefined && remainingTime < 60; // Less than 1 minute

    // Debug logs
    console.log("QuizTimer render - timeLimit:", timeLimit, "remainingTime:", remainingTime);

    // Nếu không có timeLimit, hiển thị "Không giới hạn"
    if (!timeLimit || timeLimit === null) {
        return (
            <Card className="quiz-timer">
                <Card.Body>
                    <div className="timer-header">
                        <FaClock className="timer-icon" />
                        <span className="timer-label">Thời gian còn lại</span>
                    </div>
                    <div className="timer-display">Không giới hạn</div>
                </Card.Body>
            </Card>
        );
    }

    // Nếu có timeLimit nhưng remainingTime chưa được tính, hiển thị loading
    if (remainingTime === null || remainingTime === undefined) {
        return (
            <Card className="quiz-timer">
                <Card.Body>
                    <div className="timer-header">
                        <FaClock className="timer-icon" />
                        <span className="timer-label">Thời gian còn lại</span>
                    </div>
                    <div className="timer-display">Đang tính...</div>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className={`quiz-timer${isDanger ? " danger" : isWarning ? " warning" : ""}`}>
            <Card.Body>
                <div className="timer-header">
                    <FaClock className="timer-icon" />
                    <span className="timer-label">Thời gian còn lại</span>
                </div>
                <div className="timer-display">
                    {formatTime(remainingTime)}
                </div>
                {timeLimit > 0 && (
                    <div className="timer-progress">
                        <div
                            className="timer-progress-bar"
                            style={{
                                width: `${Math.max(0, Math.min(100, (remainingTime / timeLimit) * 100))}%`
                            }}
                        />
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}

