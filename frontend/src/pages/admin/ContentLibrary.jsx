import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal, Form } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { MdLibraryAdd } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../api";

const SERVER_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

const ContentLibrary = ({ isAdmin = true }) => {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);

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

  const handleAddContent = async (e) => {
    e.preventDefault();
    if (!title || !description || !image) {
      toast.error("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", image);

    try {
      await axios.post(`${API_BASE_URL}/users/admin_contents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Content added successfully");
      setShowModal(false);
      setTitle("");
      setDescription("");
      setImage(null);
      fetchContents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add content");
    }
  };

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
        {isAdmin && (
          <Button
            onClick={() => setShowModal(true)}
            className="d-flex align-items-center gap-2"
            style={{ backgroundColor: "#006400", borderColor: "#006400" }}
          >
            <MdLibraryAdd size={20} /> Add New Content
          </Button>
        )}
      </div>

      {/* ✅ Content Grid */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
        {contents.length > 0 ? (
          contents.map((item) => (
            <div className="col" key={item.id}>
              <div
                className="card h-100 shadow-sm"
                onClick={() => openViewModal(item)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={getImageUrl(item.image)}
                  alt={item.title}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body position-relative">
                  <h5 className="card-title">{item.title}</h5>

                  {/* Only admins see delete button */}
                  {isAdmin && (
                    <button
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted">No content available</p>
        )}
      </div>

      {/* ✅ Add Modal (Admin only) */}
      {isAdmin && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
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

      {/* ✅ View Modal */}
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
            <>
              <h4
                className="mb-4 fw-bold"
                style={{ color: "#006400", paddingBottom: "6px" }}
              >
                Overview
              </h4>
              <div className="content-overview d-flex flex-column flex-md-row align-items-start gap-4">
                <div className="order-1 order-md-2 flex-fill text-center">
                  <img
                    src={getImageUrl(selectedContent.image)}
                    alt={selectedContent.title}
                    className="img-fluid rounded"
                    style={{
                      width: "100%",
                      maxHeight: "400px",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                  />
                </div>
                <div className="order-2 order-md-1 flex-fill">
                  <p style={{ lineHeight: "1.6" }}>
                    {selectedContent.description}
                  </p>
                </div>
              </div>
            </>
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
