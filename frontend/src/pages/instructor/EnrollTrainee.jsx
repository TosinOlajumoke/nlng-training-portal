import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Form, Button } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../api";

const EnrollTraineeInstructor = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchEnrollments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/modules/enrollments`);
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load enrollment data");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEnrollments();
    const interval = setInterval(fetchEnrollments, 10000); // Live update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Reverse modules so newest appear first
  const reversedData = [...data].reverse();

  // Pagination logic
  const totalRows = reversedData.reduce((sum, module) => sum + (module.contents.length || 1), 0);
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  let displayedRows = [];
  let rowCount = 0;

  for (let module of reversedData) {
    const contents = module.contents.length > 0 ? [...module.contents].reverse() : [{ id: `no-content-${module.id}`, title: "No content added", enrolledTrainees: [] }];
    for (let content of contents) {
      rowCount++;
      if (rowCount > (currentPage - 1) * rowsPerPage && rowCount <= currentPage * rowsPerPage) {
        displayedRows.push({ module, content, index: contents.indexOf(content), rowSpan: contents.length });
      }
    }
  }

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="container py-4 page-content">
      <ToastContainer />
      <h2 className="mb-4">Modules, Contents & Enrollments</h2>

      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <Form.Select
          style={{ width: "auto" }}
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          {[5, 10, 20, 50, 100].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </Form.Select>

        <div className="d-flex align-items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handlePrev} disabled={currentPage === 1}>
            Previous
          </Button>
          <span>
            {Math.min((currentPage - 1) * rowsPerPage + 1, totalRows)}-
            {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows}
          </span>
          <Button variant="secondary" size="sm" onClick={handleNext} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      </div>

      <div className="table-responsive" style={{ overflowX: "auto" }}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Module Title</th>
              <th>Content Title</th>
              <th>Enrolled Trainees</th>
              <th>Trainee IDs</th>
            </tr>
          </thead>
          <tbody>
            {displayedRows.length > 0 ? (
              displayedRows.map(({ module, content, index, rowSpan }) => (
                <tr key={content.id}>
                  {index === 0 && content.title !== "No content added" && <td rowSpan={rowSpan}>{module.title}</td>}
                  {content.title === "No content added" && <td>{module.title}</td>}
                  <td>{content.title}</td>
                  <td>
                    {content.enrolledTrainees && content.enrolledTrainees.length > 0 ? (
                      <ul className="mb-0 ps-3">
                        {content.enrolledTrainees.map((t) => (
                          <li key={t.trainee_id}>
                            {t.first_name} {t.last_name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "No trainees enrolled"
                    )}
                  </td>
                  <td>
                    {content.enrolledTrainees && content.enrolledTrainees.length > 0 ? (
                      <ul className="mb-0 ps-3">
                        {content.enrolledTrainees.map((t) => (
                          <li key={t.trainee_id}>{t.trainee_id}</li>
                        ))}
                      </ul>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">
                  No modules found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default EnrollTraineeInstructor;
