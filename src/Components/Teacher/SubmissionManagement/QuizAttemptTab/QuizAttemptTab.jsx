import React, { useState } from "react";
import { Breadcrumb } from "react-bootstrap";
import { FaChevronRight } from "react-icons/fa";
import CourseList from "../CourseList/CourseList";
import LessonList from "../LessonList/LessonList";
import ModuleList from "../ModuleList/ModuleList";
import AssessmentList from "../AssessmentList/AssessmentList";
import QuizList from "../QuizList/QuizList";
import QuizAttemptList from "../QuizAttemptList/QuizAttemptList";
import "./QuizAttemptTab.css";

export default function QuizAttemptTab({ courses, isAdmin = false }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedLesson(null);
    setSelectedModule(null);
    setSelectedAssessment(null);
    setSelectedQuiz(null);
  };

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
    setSelectedModule(null);
    setSelectedAssessment(null);
    setSelectedQuiz(null);
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setSelectedAssessment(null);
    setSelectedQuiz(null);
  };

  const handleAssessmentSelect = (assessment) => {
    setSelectedAssessment(assessment);
    setSelectedQuiz(null);
  };

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
  };

  const getBreadcrumb = () => {
    const items = [];
    if (selectedCourse) {
      items.push({
        label: selectedCourse.title || selectedCourse.Title || "Khóa học",
        onClick: () => {
          setSelectedCourse(null);
          setSelectedLesson(null);
          setSelectedModule(null);
          setSelectedAssessment(null);
          setSelectedQuiz(null);
        },
      });
    }
    if (selectedLesson) {
      items.push({
        label: selectedLesson.title || selectedLesson.Title || "Bài học",
        onClick: () => {
          setSelectedLesson(null);
          setSelectedModule(null);
          setSelectedAssessment(null);
          setSelectedQuiz(null);
        },
      });
    }
    if (selectedModule) {
      items.push({
        label: selectedModule.name || selectedModule.Name || "Module",
        onClick: () => {
          setSelectedModule(null);
          setSelectedAssessment(null);
          setSelectedQuiz(null);
        },
      });
    }
    if (selectedAssessment) {
      items.push({
        label: selectedAssessment.title || selectedAssessment.Title || "Assessment",
        onClick: () => {
          setSelectedAssessment(null);
          setSelectedQuiz(null);
        },
      });
    }
    if (selectedQuiz) {
      items.push({
        label: selectedQuiz.title || selectedQuiz.Title || "Quiz",
        onClick: () => setSelectedQuiz(null),
      });
    }
    return items;
  };

  return (
    <div className="quiz-attempt-tab">
      {getBreadcrumb().length > 0 && (
        <Breadcrumb className="mb-3">
          <Breadcrumb.Item onClick={() => setSelectedCourse(null)} style={{ cursor: "pointer" }}>
            Tất cả khóa học
          </Breadcrumb.Item>
          {getBreadcrumb().map((item, index) => {
            const isLast = index === getBreadcrumb().length - 1;
            return (
              <React.Fragment key={index}>
                <FaChevronRight className="mx-2" style={{ fontSize: "12px", marginTop: "6px" }} />
                <Breadcrumb.Item 
                  onClick={isLast ? undefined : item.onClick} 
                  style={isLast ? { cursor: "default", color: "#6c757d" } : { cursor: "pointer" }}
                  active={isLast}
                >
                  {item.label}
                </Breadcrumb.Item>
              </React.Fragment>
            );
          })}
        </Breadcrumb>
      )}

      {!selectedQuiz && !selectedCourse && (
        <CourseList courses={courses} onSelect={handleCourseSelect} />
      )}

      {!selectedQuiz && selectedCourse && !selectedLesson && (
        <LessonList
          courseId={selectedCourse.courseId || selectedCourse.CourseId}
          onSelect={handleLessonSelect}
          isAdmin={isAdmin}
        />
      )}

      {!selectedQuiz && selectedLesson && !selectedModule && (
        <ModuleList
          lessonId={selectedLesson.lessonId || selectedLesson.LessonId}
          onSelect={handleModuleSelect}
          isAdmin={isAdmin}
        />
      )}

      {!selectedQuiz && selectedModule && !selectedAssessment && (
        <AssessmentList
          moduleId={selectedModule.moduleId || selectedModule.ModuleId}
          onSelect={handleAssessmentSelect}
          isAdmin={isAdmin}
        />
      )}

      {!selectedQuiz && selectedAssessment && (
        <QuizList
          assessmentId={selectedAssessment.assessmentId || selectedAssessment.AssessmentId}
          onSelect={handleQuizSelect}
          isAdmin={isAdmin}
        />
      )}

      {selectedQuiz && (
        <QuizAttemptList
          quizId={selectedQuiz.quizId || selectedQuiz.QuizId}
          quizTitle={selectedQuiz.title || selectedQuiz.Title}
          onBack={() => setSelectedQuiz(null)}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

