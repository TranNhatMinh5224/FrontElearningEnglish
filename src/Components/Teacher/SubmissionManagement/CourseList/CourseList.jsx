import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { FaBook } from "react-icons/fa";
import "./CourseList.css";

export default function CourseList({ courses, onSelect }) {
  if (!courses || courses.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        <p>Chưa có khóa học nào</p>
      </div>
    );
  }

  return (
    <Row className="g-3">
      {courses.map((course) => {
        const courseId = course.courseId || course.CourseId;
        const title = course.title || course.Title || "Untitled Course";
        const imageUrl = course.imageUrl || course.ImageUrl;

        return (
          <Col key={courseId} md={4} lg={3}>
            <Card
              className="course-card h-100"
              onClick={() => onSelect(course)}
              style={{ cursor: "pointer" }}
            >
              <div className="course-image-container">
                {imageUrl ? (
                  <img src={imageUrl} alt={title} className="course-image" />
                ) : (
                  <div className="course-image-placeholder">
                    <FaBook size={40} />
                  </div>
                )}
              </div>
              <Card.Body>
                <Card.Title className="course-title">{title}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}

