// ContentLibrary.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Modal,
  Form,
  Table,
  Pagination,
  Spinner,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { FaTrash } from "react-icons/fa";
import { MdLibraryAdd } from "react-icons/md";

const ContentLibrary = () => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [instructors, setInstructors] = useState([]);
  const [instructorEmail, setInstructorEmail] = useState("");
  const [contentList, setContentList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch instructors
  const fetchInstructors = async () => {
    try {
      const res = await axios.get("/api/users/instructors");
      setInstructors(res.data);
    } catch (err) {
      console.error("Error fetching instructors:", err);
      toast.error("Failed to load instructors");
    }
  };

  // Fetch content
  const fetchContent = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/users/contents");
      const contents = Array.isArray(res.data) ? res.data : res.data.content || [];
      setContentList(contents);
    } catch (err) {
      console.error("Error fetching content:", err);
      setError("Failed to fetch content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
    fetchContent();
  }, []);

  // Add content
  const handleAddContent = async (e) => {
    e.preventDefault();
    if (!title || !instructorId) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await axios.post("/api/users/contents", { title, instructor_id: instructorId });
      toast.success("Content added successfully");
      setShowModal(false);
      setTitle("");
      setInstructorId("");
      setInstructorEmail("");
      fetchContent();
    } catch (err) {
      console.error("Error adding content:", err);
      toast.error("Failed to add content");
    }
  };

  // Delete content
  const handleDeleteContent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;
    try {
      await axios.delete(`/api/users/contents/${id}`);
      toast.success("Content deleted successfully");
      fetchContent();
    } catch (err) {
      console.error("Error deleting content:", err);
      toast.error("Failed to delete content");
    }
  };

  // Handle instructor change
  const handleInstructorChange = (e) => {
    const selectedId = e.target.value;
    setInstructorId(selectedId);
    const selectedInstructor = instructors.find((i) => i.id.toString() === selectedId);
    setInstructorEmail(selectedInstructor ? selectedInstructor.email : "");
  };

  // Pagination
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentContents = Array.isArray(contentList)
    ? contentList.slice(indexOfFirst, indexOfLast)
    : [];
  const totalPages = Math.ceil(contentList.length / rowsPerPage);

  const handleNext = () => currentPage < totalPages && setCurrentPage((prev) => prev + 1);
  const handlePrev = () => currentPage > 1 && setCurrentPage((prev) => prev - 1);

  // Export CSV
  const exportCSV = () => {
    if (!Array.isArray(contentList) || contentList.length === 0) return;
    const header = ["Title", "Instructor Name", "Instructor Email"];
    const rows = contentList.map((c) => [
      c.title,
      `${c.first_name || ""} ${c.last_name || ""}`,
      c.instructor_email || "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    saveAs(encodedUri, "content_library.csv");
  };

  // Export PDF
  const exportPDF = () => {
    if (!Array.isArray(contentList) || contentList.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Content Library", 14, 15);

    const tableColumn = ["#", "Title", "Instructor Name", "Instructor Email"];
    const tableRows = contentList.map((c, idx) => [
      idx + 1,
      c.title,
      `${c.first_name || ""} ${c.last_name || ""}`,
      c.instructor_email || "",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 10, cellPadding: 4, lineColor: [0, 0, 0], lineWidth: 0.2, halign: "left" },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.3, lineColor: [0, 0, 0], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save("content_library.pdf");
  };

  return (
    <div className="page-content">
      <ToastContainer />
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
        <h2>Content Library</h2>
        <Button
          className="mt-2 mt-md-0 d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: "#006400", borderColor: "#006400", color: "#fff", fontWeight: "500" }}
        >
          <MdLibraryAdd size={20} color="#fff" />
          Add New Content
        </Button>
      </div>

      {/* Modal Form */}
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
                placeholder="Enter content title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Instructor</Form.Label>
              <Form.Select value={instructorId} onChange={handleInstructorChange}>
                <option value="">Select Instructor</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.first_name} {i.last_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Instructor Email</Form.Label>
              <Form.Control type="email" value={instructorEmail} readOnly />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Content</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Export Buttons */}
      <div className="mb-3">
        <Button className="me-2" onClick={exportCSV} disabled={loading || !contentList.length}>
          Export CSV
        </Button>
        <Button
          onClick={exportPDF}
          disabled={loading || !contentList.length}
          style={{ backgroundColor: "#006400", borderColor: "#006400", color: "#fff" }}
        >
          Export PDF
        </Button>
      </div>

      {/* Loading / Error */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <div className="text-center text-danger my-3">{error}</div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Course Title</th>
                  <th>Instructor Name</th>
                  <th>Instructor Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentContents.length > 0 ? (
                  currentContents.map((c, idx) => (
                    <tr key={c.id}>
                      <td>{indexOfFirst + idx + 1}</td>
                      <td>{c.title}</td>
                      <td>{`${c.first_name || ""} ${c.last_name || ""}`}</td>
                      <td>{c.instructor_email || ""}</td>
                      <td>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteContent(c.id)}>
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No content available
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Row info */}
          <div className="mb-2">
            {contentList.length > 0 && (
              <small>
                {indexOfFirst + 1}-{Math.min(indexOfLast, contentList.length)} of {contentList.length}
              </small>
            )}
          </div>
        </>
      )}

      {/* Pagination */}
      {!loading && !error && (
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div>
            <span>Rows per page: </span>
            <Form.Select
              style={{ width: "auto", display: "inline-block" }}
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[5, 10, 15].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Form.Select>
          </div>
          <Pagination className="mb-0">
            <Pagination.Prev onClick={handlePrev} disabled={currentPage === 1} />
            <Pagination.Item active>{currentPage}</Pagination.Item>
            <Pagination.Next onClick={handleNext} disabled={currentPage === totalPages || totalPages === 0} />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ContentLibrary;
