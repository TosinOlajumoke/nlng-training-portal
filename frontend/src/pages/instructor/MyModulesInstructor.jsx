import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal, Form } from "react-bootstrap";
import { FaUserPlus, FaBookOpen, FaPlus } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../api";

const MyCoursesInstructor = () => {
  const [modules, setModules] = useState([]);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [trainees, setTrainees] = useState([]);
  const [selectedTrainees, setSelectedTrainees] = useState([]);

  const [moduleTitle, setModuleTitle] = useState("");
  const [contentTitle, setContentTitle] = useState("");
  const [contentDescription, setContentDescription] = useState("");
  const [contentImage, setContentImage] = useState(null);
  const [contentVideoUrl, setContentVideoUrl] = useState("");

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/modules`);
      const modulesWithContents = await Promise.all(
        res.data.map(async (module) => {
          const contentsRes = await axios.get(
            `${API_BASE_URL}/users/modules/${module.id}/contents`
          );
          return { ...module, contents: contentsRes.data };
        })
      );
      setModules(modulesWithContents);
    } catch (err) {
      toast.error("Failed to load modules or contents");
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return toast.error("Module title required");

    try {
      await axios.post(`${API_BASE_URL}/users/modules`, { title: moduleTitle });
      toast.success("Module added successfully");
      setShowAddModule(false);
      setModuleTitle("");
      fetchModules();
    } catch (err) {
      toast.error("Failed to add module");
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm("Are you sure you want to delete this module?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/users/modules/${moduleId}`);
      toast.success("Module deleted successfully");
      fetchModules();
    } catch (err) {
      toast.error("Failed to delete module");
    }
  };

  const handleAddContent = async (e) => {
    e.preventDefault();
    if (!selectedModule || !contentTitle || !contentDescription)
      return toast.error("All fields are required");

    const payload = {
      module_id: selectedModule.id,
      title: contentTitle,
      description: contentDescription,
      video: contentVideoUrl || null,
    };

    if (contentImage) {
      const formData = new FormData();
      formData.append("image", contentImage);
      Object.entries(payload).forEach(([key, value]) =>
        formData.append(key, value)
      );

      try {
        await axios.post(
          `${API_BASE_URL}/users/modules/${selectedModule.id}/contents`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Content added successfully");
      } catch (err) {
        toast.error("Failed to add content");
      }
    } else {
      try {
        await axios.post(
          `${API_BASE_URL}/users/modules/${selectedModule.id}/contents`,
          payload
        );
        toast.success("Content added successfully");
      } catch (err) {
        toast.error("Failed to add content");
      }
    }

    setShowAddContent(false);
    setContentTitle("");
    setContentDescription("");
    setContentImage(null);
    setContentVideoUrl("");
    fetchModules();
  };

  const handleEnrollTrainee = async (e) => {
    e.preventDefault();
    if (!selectedContent || selectedTrainees.length === 0)
      return toast.error("Select a content and at least one trainee");

    try {
      await axios.post(`${API_BASE_URL}/users/contents/enroll`, {
        content_id: selectedContent.id,
        trainee_ids: selectedTrainees,
      });
      toast.success("Trainees enrolled successfully");
      setShowEnroll(false);
      setSelectedTrainees([]);
    } catch (err) {
      toast.error("Failed to enroll trainees");
      console.error(err.response?.data || err.message);
    }
  };

  const openAddContentModal = (module) => {
    setSelectedModule(module);
    setShowAddContent(true);
  };

  const openEnrollModal = async (content) => {
    setSelectedContent(content);
    try {
      const res = await axios.get(`${API_BASE_URL}/users/trainees`);
      setTrainees(res.data);
      setShowEnroll(true);
    } catch (err) {
      toast.error("Failed to load trainees");
    }
  };

  return (
    <div className="container py-4 page-content">
      <ToastContainer />
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <h2>My Modules</h2>
        <Button
          onClick={() => setShowAddModule(true)}
          className="d-flex align-items-center gap-2 mt-2 mt-md-0"
          style={{ backgroundColor: "#006400", borderColor: "#004d00", color: "white" }}
        >
          <FaPlus /> Add New Module
        </Button>
      </div>

      <div className="d-flex flex-column gap-3">
        {modules.length > 0 ? (
          modules.map((module) => (
            <div
              key={module.id}
              className="d-flex flex-column flex-md-row justify-content-between align-items-start p-3 rounded"
              style={{
                background: "linear-gradient(135deg, rgba(0,128,128,0.2), rgba(0,255,128,0.2))",
                color: "#003300",
                gap: "10px",
              }}
            >
              <div className="fw-bold mb-2">{module.title}</div>

              <div className="d-flex flex-column gap-2 w-100">
                {module.contents && module.contents.length > 0 ? (
                  module.contents.map((content) => (
                    <div
                      key={content.id}
                      className="d-flex justify-content-between align-items-center p-2 rounded"
                      style={{
                        backgroundColor: "rgba(0,128,128,0.1)",
                      }}
                    >
                      <div>{content.title}</div>
                      <div className="d-flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openEnrollModal(content)}
                        >
                          <FaUserPlus /> Enroll Trainee
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-light">No content added yet</p>
                )}

                <div className="d-flex gap-2 mt-2 flex-wrap">
                  <Button
                    onClick={() => openAddContentModal(module)}
                    style={{
                      backgroundColor: "#006400",
                      borderColor: "#004d00",
                      color: "white",
                    }}
                  >
                    <FaBookOpen /> Add Content
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteModule(module.id)}
                  >
                    Delete Module
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted text-center">No modules available</p>
        )}
      </div>

      {/* Add Module Modal */}
      <Modal show={showAddModule} onHide={() => setShowAddModule(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Module</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddModule}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Module Title</Form.Label>
              <Form.Control
                type="text"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="Enter module name"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModule(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: "#006400", borderColor: "#004d00", color: "white" }}>
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Add Content Modal */}
      <Modal show={showAddContent} onHide={() => setShowAddContent(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Content to {selectedModule?.title}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddContent}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Content Title</Form.Label>
              <Form.Control
                type="text"
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={contentDescription}
                onChange={(e) => setContentDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setContentImage(e.target.files[0])}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Video URL</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://example.com/video.mp4"
                value={contentVideoUrl}
                onChange={(e) => setContentVideoUrl(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddContent(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: "#006400", borderColor: "#004d00", color: "white" }}>
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Enroll Trainee Modal */}
      <Modal show={showEnroll} onHide={() => setShowEnroll(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Enroll Trainees to {selectedContent?.title}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEnrollTrainee}>
          <Modal.Body>
            {trainees.length > 0 ? (
              trainees.map((t) => (
                <Form.Check
                  key={t.id}
                  type="checkbox"
                  label={`${t.first_name} ${t.last_name} (${t.email})`}
                  value={t.id}
                  checked={selectedTrainees.includes(t.id)}
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    setSelectedTrainees((prev) =>
                      prev.includes(id)
                        ? prev.filter((tid) => tid !== id)
                        : [...prev, id]
                    );
                  }}
                />
              ))
            ) : (
              <p>No trainees available</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEnroll(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: "#006400", borderColor: "#004d00", color: "white" }}>
              Enroll
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default MyCoursesInstructor;
