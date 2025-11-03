// src/pages/trainee/MyCoursesTrainee.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Spinner,
  Alert,
  Button,
  Modal,
  Row,
  Col,
  Image,
  Badge,
} from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../api";

const MyCoursesTrainee = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [currentCourseModules, setCurrentCourseModules] = useState([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  const [progressMap, setProgressMap] = useState({});

  // ✅ Build full URL for uploaded files
  const buildFileURL = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL.replace("/api", "")}${
      path.startsWith("/") ? path : `/${path}`
    }`;
  };

  useEffect(() => {
    const fetchEnrollmentsAndProgress = async () => {
      if (!user || user.role !== "trainee") {
        setError("Access denied. Only trainees can view this page.");
        setLoading(false);
        return;
      }

      try {
        const [enrollRes, progressRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/users/trainee/${user.id}/enrollments`),
          axios.get(`${API_BASE_URL}/users/progress/${user.id}`),
        ]);

        setEnrollments(enrollRes.data);
        setProgressMap(progressRes.data || {});
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch your data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollmentsAndProgress();
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

  const openModal = (module, modulesArray) => {
    setCurrentCourseModules(modulesArray);
    const index = modulesArray.findIndex((m) => m.module_id === module.module_id);
    setCurrentModuleIndex(index);
    setSelectedModule(module);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedModule(null);
    setShowModal(false);
    setCurrentCourseModules([]);
    setCurrentModuleIndex(0);
  };

  const goToModule = (direction) => {
    let newIndex = currentModuleIndex + direction;
    if (newIndex < 0 || newIndex >= currentCourseModules.length) return;
    setCurrentModuleIndex(newIndex);
    setSelectedModule(currentCourseModules[newIndex]);
  };

  const markCompleted = async () => {
    if (!selectedModule) return;
    try {
      await axios.post(`${API_BASE_URL}/users/progress`, {
        traineeId: user.id,
        moduleId: selectedModule.module_id,
        status: "completed",
      });

      setProgressMap((prev) => ({
        ...prev,
        [selectedModule.module_id]: "completed",
      }));
    } catch (err) {
      console.error("Error marking as completed:", err);
      alert("Failed to mark as completed. Try again.");
    }
  };

  return (
    <div className="page-content">
      <h2>My Courses</h2>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="success" />
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
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
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {course.modules.map((mod, idx) => {
                  const isCurrent =
                    selectedModule && mod.module_id === selectedModule.module_id;
                  return (
                    <tr
                      key={mod.module_id}
                      className={isCurrent ? "table-primary" : ""}
                    >
                      <td>{idx + 1}</td>
                      <td>{mod.module_title}</td>
                      <td>
                        {progressMap[mod.module_id] === "completed" ? (
                          <Badge bg="success">Completed</Badge>
                        ) : (
                          <Badge bg="warning">In Progress</Badge>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="success"
                          className="take-module-btn"
                          onClick={() => openModal(mod, course.modules)}
                        >
                          Take Module
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        ))
      )}

      {/* ===== Module Modal ===== */}
      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        dialogClassName="custom-modal-80"
        size="lg"
      >
        {selectedModule && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedModule.module_title}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Row>
                {/* ✅ Left: Info + materials */}
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

                  {/* ✅ Materials (download immediately) */}
                  <h5>Materials:</h5>
                  {selectedModule.materials_path ? (
                    <p>
                      <a
                        href={buildFileURL(selectedModule.materials_path)}
                        download
                        className="btn btn-outline-primary btn-sm"
                      >
                        📄 Download Material
                      </a>
                    </p>
                  ) : (
                    <p className="text-muted">No materials uploaded yet.</p>
                  )}

                  {/* ✅ VR Content (open in new tab) */}
                  <h5>VR Content:</h5>
                  {selectedModule.vr_content_path ? (
                    <p>
                      <a
                        href={buildFileURL(selectedModule.vr_content_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-info btn-sm"
                      >
                        🕶️ View VR Content
                      </a>
                    </p>
                  ) : (
                    <p className="text-muted">No VR content uploaded yet.</p>
                  )}
                </Col>

                {/* ✅ Right: Video and Image stacked */}
                <Col md={6} sm={12}>
                  {/* ✅ Video (supports YouTube + uploaded files) */}
                  <h5>Video:</h5>
                  {selectedModule.video_url ? (
                    selectedModule.video_url.includes("youtube.com") ||
                    selectedModule.video_url.includes("youtu.be") ? (
                      <iframe
                        width="100%"
                        height="250"
                        style={{
                          borderRadius: "8px",
                          marginBottom: "15px",
                          border: "none",
                        }}
                        src={
                          selectedModule.video_url.includes("watch?v=")
                            ? selectedModule.video_url.replace(
                                "watch?v=",
                                "embed/"
                              )
                            : selectedModule.video_url.replace(
                                "youtu.be/",
                                "www.youtube.com/embed/"
                              )
                        }
                        title={selectedModule.module_title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video
                        src={buildFileURL(selectedModule.video_url)}
                        controls
                        style={{
                          width: "100%",
                          height: "250px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          marginBottom: "15px",
                        }}
                      />
                    )
                  ) : (
                    <p className="text-muted">No video link available.</p>
                  )}

                  {/* Image below video */}
                  <h5>Module Image:</h5>
                  {selectedModule.image_path ? (
                    <Image
                      src={buildFileURL(selectedModule.image_path)}
                      alt={selectedModule.module_title}
                      fluid
                      rounded
                      style={{
                        width: "100%",
                        height: "250px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        window.open(
                          buildFileURL(selectedModule.image_path),
                          "_blank"
                        )
                      }
                    />
                  ) : (
                    <p className="text-muted">No image uploaded yet.</p>
                  )}
                </Col>
              </Row>
            </Modal.Body>

            <Modal.Footer className="d-flex justify-content-between">
              <div>
                <Button
                  variant="secondary"
                  onClick={() => goToModule(-1)}
                  disabled={currentModuleIndex === 0}
                  className="me-2"
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => goToModule(1)}
                  disabled={
                    currentModuleIndex === currentCourseModules.length - 1
                  }
                >
                  Next
                </Button>
              </div>
              <div>
                {progressMap[selectedModule.module_id] !== "completed" && (
                  <Button variant="success" onClick={markCompleted}>
                    Mark as Completed
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={closeModal}
                  className="ms-2"
                >
                  Close
                </Button>
              </div>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default MyCoursesTrainee;
