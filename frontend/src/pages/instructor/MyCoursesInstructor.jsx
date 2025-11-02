// src/pages/instructor/MyCoursesInstructor.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Spinner,
  Alert,
  Button,
  Modal,
  Form,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../api"; // ✅ Import your centralized API URL

const MyCoursesInstructor = () => {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal & form state
  const [showModal, setShowModal] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState(null);
  const [selectedContentTitle, setSelectedContentTitle] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");
  const [moduleMetaDesc, setModuleMetaDesc] = useState("");
  const [moduleImageFile, setModuleImageFile] = useState(null);
  const [moduleVideoURL, setModuleVideoURL] = useState("");
  const [moduleMaterialsFile, setModuleMaterialsFile] = useState(null);
  const [moduleVRFile, setModuleVRFile] = useState(null);
  const [traineesList, setTraineesList] = useState([]);
  const [selectedTrainees, setSelectedTrainees] = useState([]);

  // Toast state
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        if (!user || user.role !== "instructor") {
          setError("Access denied. Only instructors can view this page.");
          setLoading(false);
          return;
        }

        // ✅ Use the centralized API_BASE_URL
        const res = await axios.get(`${API_BASE_URL}/users/instructor/${user.id}/contents`);
        setCourses(res.data);

        const tRes = await axios.get(`${API_BASE_URL}/users/trainees`);
        setTraineesList(tRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch your data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, [user]);

  const handleOpenModal = (contentId, contentTitle) => {
    setSelectedContentId(contentId);
    setSelectedContentTitle(contentTitle);
    // Reset form fields
    setModuleTitle("");
    setModuleDesc("");
    setModuleMetaDesc("");
    setModuleImageFile(null);
    setModuleVideoURL("");
    setModuleMaterialsFile(null);
    setModuleVRFile(null);
    setSelectedTrainees([]);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSubmitModule = async (e) => {
    e.preventDefault();

    // ✅ Validation
    if (
      !moduleTitle ||
      !moduleDesc ||
      !moduleMetaDesc ||
      !moduleImageFile ||
      !moduleVideoURL ||
      !moduleMaterialsFile ||
      !moduleVRFile ||
      selectedTrainees.length === 0
    ) {
      alert("Please fill in all fields and select at least one trainee.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("content_id", selectedContentId);
      formData.append("module_title", moduleTitle);
      formData.append("module_description", moduleDesc);
      formData.append("module_meta_description", moduleMetaDesc);
      formData.append("image", moduleImageFile);
      formData.append("video_url", moduleVideoURL);
      formData.append("materials", moduleMaterialsFile);
      formData.append("vr_content", moduleVRFile);
      formData.append("trainee_ids", JSON.stringify(selectedTrainees));

      // ✅ Use API_BASE_URL for POST
      await axios.post(`${API_BASE_URL}/users/modules/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowToast(true);
      handleCloseModal();
    } catch (err) {
      console.error("❌ Error submitting module form:", err.response?.data || err.message);
      alert("Failed to save module/enrollment. Please try again.");
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
      ) : courses.length === 0 ? (
        <Alert variant="info" className="text-center">
          You have no courses assigned yet.
        </Alert>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Course Title</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c, idx) => (
                <tr key={c.content_id}>
                  <td>{idx + 1}</td>
                  <td>{c.content_title}</td>
                  <td>
                    <Button
                      style={{ backgroundColor: "#006400", borderColor: "#006400" }}
                      onClick={() => handleOpenModal(c.content_id, c.content_title)}
                    >
                      Add Module & Enroll Trainees
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {/* ✅ Modal Form */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedContentTitle
              ? `Add Module for: ${selectedContentTitle}`
              : "Add Module"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitModule}>
            <Form.Group className="mb-3">
              <Form.Label>Module Title</Form.Label>
              <Form.Control
                type="text"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="Enter module title"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={moduleDesc}
                onChange={(e) => setModuleDesc(e.target.value)}
                placeholder="Detailed description"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Meta Description</Form.Label>
              <Form.Control
                type="text"
                value={moduleMetaDesc}
                onChange={(e) => setModuleMetaDesc(e.target.value)}
                placeholder="Short meta description"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Module Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setModuleImageFile(e.target.files[0])}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Video URL</Form.Label>
              <Form.Control
                type="url"
                value={moduleVideoURL}
                onChange={(e) => setModuleVideoURL(e.target.value)}
                placeholder="https://youtube.com/..."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Materials (PDF, PPT, etc.)</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setModuleMaterialsFile(e.target.files[0])}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>VR Content (zip, 3D, or interactive file)</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setModuleVRFile(e.target.files[0])}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Enroll Trainees</Form.Label>
              <Form.Select
                multiple
                value={selectedTrainees}
                onChange={(e) =>
                  setSelectedTrainees(
                    Array.from(e.target.selectedOptions).map((o) => o.value)
                  )
                }
                required
              >
                {traineesList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.first_name} {t.last_name} (ID: {t.trainee_id})
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Hold CTRL / CMD to select multiple.
              </Form.Text>
            </Form.Group>

            <Button
              style={{ backgroundColor: "#006400", borderColor: "#006400" }}
              type="submit"
            >
              Save Module & Enroll
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ✅ Toast Notification */}
      <ToastContainer className="p-3" position="top-end">
        <Toast
          bg="success"
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
        >
          <Toast.Body className="text-white">
            ✅ Module saved and trainees enrolled successfully!
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default MyCoursesInstructor;
