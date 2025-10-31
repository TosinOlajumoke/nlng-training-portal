// src/pages/trainee/MyCoursesTrainee.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Button, Modal, Row, Col, Image } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";

const MyCoursesTrainee = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user || user.role !== "trainee") {
        setError("Access denied. Only trainees can view this page.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`/api/users/trainee/${user.id}/enrollments`);
        setEnrollments(res.data);
      } catch (err) {
        console.error("Error fetching enrollments:", err);
        setError("Failed to fetch your enrollments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user]);

  // Group enrollments by course
  const coursesMap = {};
  enrollments.forEach((enroll) => {
    if (!coursesMap[enroll.course_id]) {
      coursesMap[enroll.course_id] = {
        course_title: enroll.course_title,
        modules: [],
      };
    }
    coursesMap[enroll.course_id].modules.push(enroll);
  });

  const openModal = (module) => {
    setSelectedModule(module);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedModule(null);
    setShowModal(false);
  };

  return (
    <div className="page-content">
      <h2>My Courses</h2>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="success" />
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center">{error}</Alert>
      ) : enrollments.length === 0 ? (
        <Alert variant="info" className="text-center">
          You are not enrolled in any courses yet.
        </Alert>
      ) : (
        Object.entries(coursesMap).map(([courseId, course]) => (
          <div key={courseId} className="mb-5">
            <h4 className="mb-3">{course.course_title}</h4>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Module Title</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {course.modules.map((mod, idx) => (
                  <tr key={mod.module_id}>
                    <td>{idx + 1}</td>
                    <td>{mod.module_title}</td>
                    <td>
                      <Button
                        variant="success"
                        className="take-module-btn"
                        onClick={() => openModal(mod)}
                      >
                        Take Module
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ))
      )}

      {/* Module Detail Modal */}
      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        dialogClassName="custom-modal-80"
      >
        {selectedModule && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedModule.module_title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6} sm={12}>
                  <h5>Course:</h5>
                  <p>{selectedModule.course_title}</p>

                  <h5>Module Description:</h5>
                  <p>{selectedModule.module_description}</p>

                  {selectedModule.meta_description && (
                    <>
                      <h5>Meta Description:</h5>
                      <p>{selectedModule.meta_description}</p>
                    </>
                  )}

                  {selectedModule.materials_path && (
                    <p>
                      <a
                        href={selectedModule.materials_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-secondary btn-sm"
                      >
                        Download Materials
                      </a>
                    </p>
                  )}

                  {selectedModule.vr_content_path && (
                    <p>
                      <a
                        href={selectedModule.vr_content_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-secondary btn-sm"
                      >
                        VR Content
                      </a>
                    </p>
                  )}

                  {selectedModule.image_path && (
                    <>
                      <h5>Image:</h5>
                      <Image
                        src={selectedModule.image_path}
                        alt={selectedModule.module_title}
                        fluid
                        rounded
                        style={{ cursor: "pointer" }}
                        onClick={() => window.open(selectedModule.image_path, "_blank")}
                      />
                    </>
                  )}
                </Col>

                <Col md={6} sm={12}>
                  {selectedModule.video_url && (
                    <>
                      <h5>Video:</h5>
                      <video
                        src={selectedModule.video_url}
                        controls
                        style={{ width: "100%", borderRadius: "8px" }}
                      />
                    </>
                  )}
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeModal}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default MyCoursesTrainee;
