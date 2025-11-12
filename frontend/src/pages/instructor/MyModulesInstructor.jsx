import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal, Form } from "react-bootstrap";
import {
  FaUserPlus,
  FaBookOpen,
  FaPlus,
  FaEye,
  FaTrash,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../api";
import ContentLibrary from "../admin/ContentLibrary"; // existing library

const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");

const MyCoursesInstructor = () => {
  const [modules, setModules] = useState([]);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);
  const [showViewContent, setShowViewContent] = useState(false);

  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [trainees, setTrainees] = useState([]);
  const [selectedTrainees, setSelectedTrainees] = useState([]);

  const [moduleTitle, setModuleTitle] = useState("");

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

  // ==================== MODULE HANDLERS ====================
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

  // ==================== CONTENT HANDLERS ====================
  const handleAddExistingContentToModule = async (contentId) => {
    if (!selectedModule) return toast.error("No module selected");

    try {
      await axios.post(
        `${API_BASE_URL}/users/modules/${selectedModule.id}/attach_content/${contentId}`
      );
      toast.success("Content attached to module successfully");
      setShowAddContent(false);
      fetchModules();
    } catch (err) {
      toast.error("Failed to attach content to module");
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/users/contents/${contentId}`);
      toast.success("Content deleted successfully");
      fetchModules();
    } catch (err) {
      toast.error("Failed to delete content");
    }
  };

  // ==================== MODAL OPENERS ====================
  const openAddContentModal = (module) => {
    setSelectedModule(module);
    setShowAddContent(true);
  };

  const openViewContentModal = (content) => {
    setSelectedContent(content);
    setShowViewContent(true);
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
    }
  };

  const reversedModules = [...modules].reverse();

  const getYouTubeId = (url) => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return match ? match[1] : null;
  };

  return (
    <div className="container py-4 page-content">
      <ToastContainer />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <h2>My Modules</h2>
        <Button
          onClick={() => setShowAddModule(true)}
          className="d-flex align-items-center gap-2 mt-2 mt-md-0"
          style={{
            backgroundColor: "#006400",
            borderColor: "#004d00",
            color: "white",
          }}
        >
          <FaPlus /> Add New Module
        </Button>
      </div>

      {/* Modules List */}
      <div className="d-flex flex-column gap-3">
        {reversedModules.length > 0 ? (
          reversedModules.map((module) => (
            <div
              key={module.id}
              className="p-3 rounded"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,128,128,0.2), rgba(0,255,128,0.2))",
                color: "#003300",
              }}
            >
              <div className="fw-bold mb-3">{module.title}</div>
              <div className="d-flex flex-column gap-2">
                {module.contents && module.contents.length > 0 ? (
                  [...module.contents].reverse().map((content) => (
                    <div
                      key={content.id}
                      className="d-flex flex-column flex-md-row justify-content-between align-items-start p-2 rounded"
                      style={{ backgroundColor: "rgba(0,128,128,0.1)" }}
                    >
                      <div className="mb-2 mb-md-0">{content.title}</div>
                      <div className="d-flex gap-2 flex-wrap">
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => openViewContentModal(content)}
                        >
                          <FaEye /> View
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openEnrollModal(content)}
                        >
                          <FaUserPlus /> Enroll
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteContent(content.id)}
                        >
                          <FaTrash /> Delete
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-dark">No content added yet</p>
                )}

                {/* Add Content & Delete Module */}
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
            <Button
              type="submit"
              style={{
                backgroundColor: "#006400",
                borderColor: "#004d00",
                color: "white",
              }}
            >
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Add Content Modal */}
      <Modal
        show={showAddContent}
        onHide={() => setShowAddContent(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Select Content from Library for "{selectedModule?.title}"
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <ContentLibrary
            isAdmin={false}           // disable admin editing
            selectionMode={true}      // enable selection mode
            onSelectContent={(content) =>
              handleAddExistingContentToModule(content.id)
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddContent(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Content Modal */}
      <Modal
        show={showViewContent}
        onHide={() => setShowViewContent(false)}
        centered
        dialogClassName="custom-view-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedContent?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedContent && (
            <div className="d-flex flex-column flex-lg-row gap-4">
              <div className="col-lg-6" style={{ textAlign: "justify" }}>
                {selectedContent.description?.split(/\n+/).map((para, i) => (
                  <p key={i}>{para.trim()}</p>
                ))}
              </div>
              <div className="col-lg-6 d-flex flex-column gap-3">
                {selectedContent.image && (
                  <img
                    src={STATIC_BASE_URL + selectedContent.image}
                    alt="Content"
                    className="img-fluid rounded"
                  />
                )}
                {selectedContent.video && getYouTubeId(selectedContent.video) && (
                  <iframe
                    width="100%"
                    height="300"
                    src={`https://www.youtube.com/embed/${getYouTubeId(
                      selectedContent.video
                    )}`}
                    title="YouTube video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowViewContent(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Enroll Modal */}
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
            <Button
              type="submit"
              style={{
                backgroundColor: "#006400",
                borderColor: "#004d00",
                color: "white",
              }}
            >
              Enroll
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default MyCoursesInstructor;
