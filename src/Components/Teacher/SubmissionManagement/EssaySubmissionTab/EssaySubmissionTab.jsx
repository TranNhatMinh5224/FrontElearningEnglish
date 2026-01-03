import React, { useState } from "react";
import { Breadcrumb } from "react-bootstrap";
import { FaChevronRight } from "react-icons/fa";
import CourseList from "../CourseList/CourseList";
import LessonList from "../LessonList/LessonList";
import ModuleList from "../ModuleList/ModuleList";
import AssessmentList from "../AssessmentList/AssessmentList";
import EssayList from "../EssayList/EssayList";
import EssaySubmissionList from "../EssaySubmissionList/EssaySubmissionList";
import "./EssaySubmissionTab.css";

export default function EssaySubmissionTab({ courses, isAdmin = false }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedEssay, setSelectedEssay] = useState(null);

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedLesson(null);
    setSelectedModule(null);
    setSelectedAssessment(null);
    setSelectedEssay(null);
  };

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
    setSelectedModule(null);
    setSelectedAssessment(null);
    setSelectedEssay(null);
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setSelectedAssessment(null);
    setSelectedEssay(null);
  };

  const handleAssessmentSelect = (assessment) => {
    setSelectedAssessment(assessment);
    setSelectedEssay(null);
  };

  const handleEssaySelect = (essay) => {
    setSelectedEssay(essay);
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
          setSelectedEssay(null);
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
          setSelectedEssay(null);
        },
      });
    }
    if (selectedModule) {
      items.push({
        label: selectedModule.name || selectedModule.Name || "Module",
        onClick: () => {
          setSelectedModule(null);
          setSelectedAssessment(null);
          setSelectedEssay(null);
        },
      });
    }
    if (selectedAssessment) {
      items.push({
        label: selectedAssessment.title || selectedAssessment.Title || "Assessment",
        onClick: () => {
          setSelectedAssessment(null);
          setSelectedEssay(null);
        },
      });
    }
    if (selectedEssay) {
      items.push({
        label: selectedEssay.title || selectedEssay.Title || "Essay",
        onClick: () => setSelectedEssay(null),
      });
    }
    return items;
  };

  return (
    <div className="essay-submission-tab">
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

      {!selectedEssay && !selectedCourse && (
        <CourseList courses={courses} onSelect={handleCourseSelect} />
      )}

      {!selectedEssay && selectedCourse && !selectedLesson && (
        <LessonList
          courseId={selectedCourse.courseId || selectedCourse.CourseId}
          onSelect={handleLessonSelect}
          isAdmin={isAdmin}
        />
      )}

      {!selectedEssay && selectedLesson && !selectedModule && (
        <ModuleList
          lessonId={selectedLesson.lessonId || selectedLesson.LessonId}
          onSelect={handleModuleSelect}
          isAdmin={isAdmin}
        />
      )}

      {!selectedEssay && selectedModule && !selectedAssessment && (
        <AssessmentList
          moduleId={selectedModule.moduleId || selectedModule.ModuleId}
          onSelect={handleAssessmentSelect}
          isAdmin={isAdmin}
        />
      )}

      {!selectedEssay && selectedAssessment && (
        <EssayList
          assessmentId={selectedAssessment.assessmentId || selectedAssessment.AssessmentId}
          onSelect={handleEssaySelect}
          isAdmin={isAdmin}
        />
      )}

      {selectedEssay && (
        <EssaySubmissionList
          essayId={selectedEssay.essayId || selectedEssay.EssayId}
          essayTitle={selectedEssay.title || selectedEssay.Title}
          onBack={() => setSelectedEssay(null)}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
