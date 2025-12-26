import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal, Form } from "react-bootstrap";
import { FaTrash, FaEdit } from "react-icons/fa";
import { MdLibraryAdd } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../api";

const SERVER_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

const ContentLibrary = ({
  isAdmin = true,
  selectionMode = false,
  onSelectContent = null
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [editPreview, setEditPreview] = useState(null);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/admin_contents`);
      setContents(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load content");
    }
  };

  // ----- ADD CONTENT -----
  const handleAddContent = async (e) => {
    e.preventDefault();
    if (!title || !description || !image) {
      toast.error("Title, description, and image are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", image);
    formData.append("video_url", videoUrl);

    try {
      await axios.post(`${API_BASE_URL}/users/admin_contents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Content added successfully");
      setShowModal(false);
      setTitle("");
      setDescription("");
      setImage(null);
      setVideoUrl("");
      fetchContents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add content");
    }
  };

  // ----- DELETE CONTENT -----
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/users/admin_contents/${id}`);
      toast.success("Deleted successfully");
      fetchContents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete content");
    }
  };

  // ----- EDIT CONTENT -----
  const handleEditClick = (content) => {
    setSelectedContent(content);
    setTitle(content.title);
    setDescription(content.description);
    setEditPreview(content.image);
    setVideoUrl(content.video_url || "");
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error("Title and description are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (image) formData.append("image", image);
    formData.append("video_url", videoUrl);

    try {
      await axios.put(
        `${API_BASE_URL}/users/admin_contents/${selectedContent.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Content updated successfully");
      setShowEditModal(false);
      setTitle("");
      setDescription("");
      setImage(null);
      setVideoUrl("");
      fetchContents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update content");
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    const cleanPath = imagePath
      .replace(/^backend[\\/]/, "")
      .replace(/^\/?uploads/, "uploads");
    return `${SERVER_BASE_URL}/${cleanPath}`;
  };

  const openViewModal = (content) => {
    setSelectedContent(content);
    setShowViewModal(true);
  };

  return (
    <div className="page-content content-library container py-4">
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Content Library</h2>

        {/* Admin Add Button (hidden in selection mode) */}
        {isAdmin && !selectionMode && (
          <Button
            onClick={() => setShowModal(true)}
            className="d-flex align-items-center gap-2"
            style={{ backgroundColor: "#006400", borderColor: "#006400" }}
          >
            <MdLibraryAdd size={20} /> Add New Content
          </Button>
        )}
      </div>

      {/* Content Grid */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
        {contents.length > 0 ? (
          contents.map((item) => (
            <div className="col" key={item.id}>
              <div className="card h-100 shadow-sm" style={{ position: "relative" }}>
                <img
                  src={getImageUrl(item.image)}
                  alt={item.title}
                  className="card-img-top"
                  onClick={() => openViewModal(item)}
                  style={{ height: "200px", objectFit: "cover", cursor: "pointer" }}
                />
                <div className="card-body">
                  <h5 className="card-title">{item.title}</h5>

                  {/* Admin Buttons (Edit/Delete) */}
                  {isAdmin && !selectionMode && (
                    <div className="d-flex justify-content-end gap-2 mt-2">
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleEditClick(item)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  )}

                  {/* Selection Mode Button */}
                  {selectionMode && (
                    <div className="d-flex justify-content-end mt-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          if (onSelectContent) onSelectContent(item);
                        }}
                      >
                        Select
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted">No content available</p>
        )}
      </div>

      {/* ----- ADD MODAL ----- */}
      {isAdmin && !selectionMode && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Add New Content</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddContent}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </Form.Group>

              {image && (
                <div className="text-center mb-3">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: "200px", objectFit: "cover" }}
                  />
                </div>
              )}

              <Form.Group className="mb-3">
                <Form.Label>YouTube Video URL</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" style={{ backgroundColor: "#006400" }}>
                Save
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}

      {/* ----- EDIT MODAL ----- */}
      {isAdmin && !selectionMode && selectedContent && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Content</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleUpdate}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Update Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </Form.Group>

              {editPreview && (
                <div className="text-center mb-3">
                  <img
                    src={getImageUrl(editPreview)}
                    alt="Preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: "200px", objectFit: "cover" }}
                  />
                </div>
              )}

              <Form.Group className="mb-3">
                <Form.Label>YouTube Video URL</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" style={{ backgroundColor: "#006400" }}>
                Update
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}

      {/* ----- VIEW MODAL ----- */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedContent?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedContent && (
            <div className="row">
              <div className="col-md-6">
                <h5 className="mb-3 fw-bold" style={{ color: "#006400" }}>
                  Overview
                </h5>
                <div style={{ lineHeight: "1.6", textAlign: "justify" }}>
                  {selectedContent.description
                    ?.split(/\n+/)
                    .map((para, index) => (
                      <p key={index} style={{ marginBottom: "1em" }}>
                        {para.trim()}
                      </p>
                    ))}
                </div>
              </div>
              <div className="col-md-6">
                {selectedContent.video_url && (
                  <div className="text-center">
                    <iframe
                      width="100%"
                      height="315"
                      src={selectedContent.video_url.replace("watch?v=", "embed/")}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowViewModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ContentLibrary;
