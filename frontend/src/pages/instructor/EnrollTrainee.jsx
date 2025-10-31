// src/pages/instructor/EnrollTraineeInstructor.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Button, Dropdown } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const EnrollTraineeInstructor = () => {
  const { user } = useAuth();
  const [modulesByContent, setModulesByContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState({});
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const tableRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || user.role !== "instructor") {
          setError("Access denied. Only instructors can view this page.");
          setLoading(false);
          return;
        }

        const resCourses = await axios.get(`/api/users/instructor/${user.id}/contents`);
        setCourses(resCourses.data);

        const pageData = {};
        resCourses.data.forEach((c) => (pageData[c.content_id] = 1));
        setCurrentPage(pageData);

        const modulesData = {};
        await Promise.all(
          resCourses.data.map(async (c) => {
            const resModules = await axios.get(`/api/users/modules/content/${c.content_id}`);
            modulesData[c.content_id] = resModules.data.modules || [];
          })
        );
        setModulesByContent(modulesData);
      } catch (err) {
        console.error("Error fetching modules:", err);
        setError("Failed to load modules. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleNext = (content_id) => {
    const totalPages = Math.ceil((modulesByContent[content_id] || []).length / rowsPerPage);
    if ((currentPage[content_id] || 1) < totalPages) {
      setCurrentPage((prev) => ({ ...prev, [content_id]: (prev[content_id] || 1) + 1 }));
      tableRefs.current[content_id]?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePrev = (content_id) => {
    if ((currentPage[content_id] || 1) > 1) {
      setCurrentPage((prev) => ({ ...prev, [content_id]: prev[content_id] - 1 }));
      tableRefs.current[content_id]?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRowsPerPage = (e) => {
    setRowsPerPage(Number(e.target.value));
    const resetPage = {};
    courses.forEach((c) => (resetPage[c.content_id] = 1));
    setCurrentPage(resetPage);
  };

  // ===== EXPORT HELPERS =====
  const exportTablePDF = (tableTitle, rows, fileName) => {
    const doc = new jsPDF();
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(tableTitle, 14, 15);

    const headers = ["#", "Module", "Description", "Meta", "Video", "Trainee Name", "Trainee ID"];

    autoTable(doc, {
      startY: 20,
      head: [headers],
      body: rows,
    });

    doc.save(`${fileName}.pdf`);
  };

  const exportTableCSV = (headers, rows, fileName) => {
    const csvRows = [headers, ...rows];
    const csvString = csvRows
      .map((row) =>
        row
          .map((v) => `"${v === null || v === undefined ? "-" : String(v).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvString], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const prepareExportRows = (modules) => {
    const rows = [];
    if (modules.length === 0) {
      rows.push(["-", "-", "-", "-", "-", "-", "-"]);
    } else {
      modules.forEach((module, idx) => {
        const trainees = module.enrolled_trainees || [];
        if (trainees.length > 0) {
          trainees.forEach((t, tIdx) => {
            rows.push([
              tIdx === 0 ? idx + 1 : "",
              tIdx === 0 ? module.module_title : "",
              tIdx === 0 ? module.description : "",
              tIdx === 0 ? module.meta_description : "",
              tIdx === 0 ? module.video_url : "",
              `${t.first_name} ${t.last_name}`,
              t.trainee_id,
            ]);
          });
        } else {
          rows.push([idx + 1, module.module_title, module.description, module.meta_description, module.video_url, "-", "-"]);
        }
      });
    }
    return rows;
  };

  const handleExport = (content_id, type) => {
    const course = courses.find((c) => c.content_id === content_id);
    const modules = modulesByContent[content_id] || [];
    const rows = prepareExportRows(modules);

    if (type === "pdf") {
      exportTablePDF(`${course.content_title} - All Modules`, rows, `${course.content_title}-AllModules`);
    } else {
      const headers = ["#", "Module", "Description", "Meta", "Video", "Trainee Name", "Trainee ID"];
      exportTableCSV(headers, rows, `${course.content_title}-AllModules`);
    }
  };

  return (
    <div className="page-content">
      <h1>Enrolled Trainee</h1>
      <p>View modules and enrolled trainees for your courses below.</p>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="success" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : courses.length === 0 ? (
        <Alert variant="info">You have no courses assigned yet.</Alert>
      ) : (
        <>
          {/* SINGLE EXPORT BUTTON WITH DROPDOWN */}
          <Dropdown className="mb-3">
            <Dropdown.Toggle style={{ backgroundColor: "darkgreen", border: "none" }}>
              Export
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {courses.map((course) => (
                <React.Fragment key={course.content_id}>
                  <Dropdown.Item onClick={() => handleExport(course.content_id, "pdf")}>
                    {course.content_title} - PDF
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleExport(course.content_id, "csv")}>
                    {course.content_title} - CSV
                  </Dropdown.Item>
                </React.Fragment>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          {/* TABLES */}
          {courses.map((course) => {
            const modules = modulesByContent[course.content_id] || [];
            const pageNum = currentPage[course.content_id] || 1;
            const totalPages = Math.ceil(modules.length / rowsPerPage);
            const startIndex = (pageNum - 1) * rowsPerPage;
            const currentRows = modules.slice(startIndex, startIndex + rowsPerPage);

            return (
              <div key={course.content_id} className="mb-4" ref={(el) => (tableRefs.current[course.content_id] = el)}>
                <h4>{course.content_title}</h4>
                <div style={{ overflowX: "auto" }}>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Module Title</th>
                        <th>Description</th>
                        <th>Meta Description</th>
                        <th>Video URL</th>
                        <th>Trainee Name</th>
                        <th>Trainee ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRows.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center">
                            No modules found.
                          </td>
                        </tr>
                      ) : (
                        currentRows.map((m, idx) =>
                          m.enrolled_trainees && m.enrolled_trainees.length > 0
                            ? m.enrolled_trainees.map((t, tIdx) => (
                                <tr key={`${m.module_id}-${t.trainee_id}`}>
                                  {tIdx === 0 && (
                                    <>
                                      <td rowSpan={m.enrolled_trainees.length}>{startIndex + idx + 1}</td>
                                      <td rowSpan={m.enrolled_trainees.length}>{m.module_title}</td>
                                      <td rowSpan={m.enrolled_trainees.length}>{m.description}</td>
                                      <td rowSpan={m.enrolled_trainees.length}>{m.meta_description}</td>
                                      <td rowSpan={m.enrolled_trainees.length}>{m.video_url}</td>
                                    </>
                                  )}
                                  <td>
                                    {t.first_name} {t.last_name}
                                  </td>
                                  <td>{t.trainee_id}</td>
                                </tr>
                              ))
                            : (
                                <tr key={m.module_id}>
                                  <td>{startIndex + idx + 1}</td>
                                  <td>{m.module_title}</td>
                                  <td>{m.description}</td>
                                  <td>{m.meta_description}</td>
                                  <td>{m.video_url}</td>
                                  <td>-</td>
                                  <td>-</td>
                                </tr>
                              )
                        )
                      )}
                    </tbody>
                  </Table>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div>
                    Page {pageNum} of {totalPages} | Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, modules.length)} of {modules.length}
                  </div>
                  <div>
                    <Button
                      style={{ backgroundColor: "blue", border: "none" }}
                      size="sm"
                      onClick={() => handlePrev(course.content_id)}
                      disabled={pageNum === 1}
                      className="me-2"
                    >
                      Previous
                    </Button>
                    <Button
                      style={{ backgroundColor: "blue", border: "none" }}
                      size="sm"
                      onClick={() => handleNext(course.content_id)}
                      disabled={pageNum === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default EnrollTraineeInstructor;
