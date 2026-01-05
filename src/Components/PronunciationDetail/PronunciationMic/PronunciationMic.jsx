import React from "react";
import { Button } from "react-bootstrap";
import { FaMicrophone, FaStop } from "react-icons/fa";
import "./PronunciationMic.css";

export default function PronunciationMic({
    isRecording,
    isProcessing,
    onStartRecording,
    onStopRecording
}) {
    return (
        <div className="pronunciation-mic-container">
            <Button
                className={`mic-button ${isRecording ? "recording" : ""} ${isProcessing ? "processing" : ""}`}
                onClick={isRecording ? onStopRecording : onStartRecording}
                disabled={isProcessing}
            >
                {isProcessing ? (
                    <div className="spinner-border spinner-border-sm text-white" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                ) : isRecording ? (
                    <FaStop size={28} />
                ) : (
                    <FaMicrophone size={28} />
                )}
            </Button>
        </div>
    );
}

