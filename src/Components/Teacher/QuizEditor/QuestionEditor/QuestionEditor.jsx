import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import "./QuestionEditor.css";
import { QUESTION_TYPES } from "../../../../Utils/questionTypeUtils";
import MultipleChoiceEditor from "../QuestionEditors/MultipleChoiceEditor";
import MultipleAnswersEditor from "../QuestionEditors/MultipleAnswersEditor";
import TrueFalseEditor from "../QuestionEditors/TrueFalseEditor";
import FillBlankEditor from "../QuestionEditors/FillBlankEditor";
import MatchingEditor from "../QuestionEditors/MatchingEditor";
import OrderingEditor from "../QuestionEditors/OrderingEditor";
import QuestionHeader from "./QuestionHeader/QuestionHeader";
import QuestionTypeSelector from "./QuestionTypeSelector/QuestionTypeSelector";
import QuestionBasicFields from "./QuestionBasicFields/QuestionBasicFields";

export default function QuestionEditor({ question, questions, currentIndex, onSave, onDelete, onNavigate }) {
  const [questionType, setQuestionType] = useState(question?.type || question?.Type || QUESTION_TYPES.MULTIPLE_CHOICE);
  const [stemText, setStemText] = useState(question?.stemText || question?.StemText || "");
  const [points, setPoints] = useState(question?.points || question?.Points || 10);
  const [explanation, setExplanation] = useState(question?.explanation || question?.Explanation || "");
  const [options, setOptions] = useState(question?.options || question?.Options || []);
  const [correctAnswersJson, setCorrectAnswersJson] = useState(question?.correctAnswersJson || question?.CorrectAnswersJson || null);
  const [metadataJson, setMetadataJson] = useState(question?.metadataJson || question?.MetadataJson || "{}");
  const [mediaTempKey, setMediaTempKey] = useState(question?.mediaTempKey || question?.MediaTempKey || null);
  const [mediaType, setMediaType] = useState(question?.mediaType || question?.MediaType || null);
  const [existingMediaUrl, setExistingMediaUrl] = useState(question?.mediaUrl || question?.MediaUrl || null);

  useEffect(() => {
    if (question) {
      const questionId = question.questionId || question.QuestionId;
      setQuestionType(question.type || question.Type || QUESTION_TYPES.MULTIPLE_CHOICE);
      setStemText(question.stemText || question.StemText || "");
      setPoints(question.points || question.Points || 10);
      setExplanation(question.explanation || question.Explanation || "");
      setOptions(question.options || question.Options || []);
      setCorrectAnswersJson(question.correctAnswersJson || question.CorrectAnswersJson || null);
      setMetadataJson(question.metadataJson || question.MetadataJson || "{}");
      
      // Reset media first, then set from question
      setMediaTempKey(null); // Always reset temp key when loading existing question
      setMediaType(question.mediaType || question.MediaType || null);
      setExistingMediaUrl(question.mediaUrl || question.MediaUrl || null);
    } else {
      // Reset when no question selected
      setQuestionType(QUESTION_TYPES.MULTIPLE_CHOICE);
      setStemText("");
      setPoints(10);
      setExplanation("");
      setOptions([]);
      setCorrectAnswersJson(null);
      setMetadataJson("{}");
      setMediaTempKey(null);
      setMediaType(null);
      setExistingMediaUrl(null);
    }
  }, [question]);

  const handleSave = () => {
    const questionData = {
      type: questionType,
      stemText: stemText.trim(),
      points: parseFloat(points) || 10,
      explanation: explanation.trim() || null,
      options: options,
      correctAnswersJson: correctAnswersJson,
      metadataJson: metadataJson,
      mediaTempKey: mediaTempKey || null,
      mediaType: mediaType || null,
    };

    onSave(questionData);
  };

  const renderQuestionTypeEditor = () => {
    const commonProps = {
      options,
      setOptions,
      correctAnswersJson,
      setCorrectAnswersJson,
      metadataJson,
      setMetadataJson,
    };

    switch (questionType) {
      case QUESTION_TYPES.MULTIPLE_CHOICE:
        return <MultipleChoiceEditor {...commonProps} />;
      case QUESTION_TYPES.MULTIPLE_ANSWERS:
        return <MultipleAnswersEditor {...commonProps} />;
      case QUESTION_TYPES.TRUE_FALSE:
        return <TrueFalseEditor {...commonProps} />;
      case QUESTION_TYPES.FILL_BLANK:
        return <FillBlankEditor {...commonProps} />;
      case QUESTION_TYPES.MATCHING:
        return <MatchingEditor {...commonProps} />;
      case QUESTION_TYPES.ORDERING:
        return <OrderingEditor {...commonProps} />;
      default:
        return <MultipleChoiceEditor {...commonProps} />;
    }
  };

  const questionNumber = currentIndex !== undefined && currentIndex !== -1 ? currentIndex + 1 : null;
  const totalQuestions = questions ? questions.length : 0;

  return (
    <div className="question-editor">
      <QuestionHeader
        question={question}
        questionType={questionType}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        onNavigate={onNavigate}
        onDelete={onDelete}
      />

      <div className="question-editor-content">
        <Form>
          <QuestionTypeSelector
            questionType={questionType}
            onTypeChange={setQuestionType}
          />

          <QuestionBasicFields
            stemText={stemText}
            onStemTextChange={setStemText}
            points={points}
            onPointsChange={setPoints}
            explanation={explanation}
            onExplanationChange={setExplanation}
            mediaTempKey={mediaTempKey}
            onMediaTempKeyChange={setMediaTempKey}
            mediaType={mediaType}
            onMediaTypeChange={setMediaType}
            existingMediaUrl={existingMediaUrl}
          />

          {/* Question Type Specific Editor */}
          {renderQuestionTypeEditor()}

          {/* Action Buttons */}
          <div className="question-editor-actions">
            <Button variant="primary" onClick={handleSave}>
              Lưu Câu hỏi
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

