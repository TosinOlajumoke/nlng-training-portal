import React, { useState, useEffect } from "react"; 
import axios from "axios";
import { Table } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../api";

const EnrollTraineeInstructor = () => {
  const [data, setData] = useState([]);

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

  return (
    <div className="container py-4 page-content">
      <ToastContainer />
      <h2 className="mb-4">Modules, Contents & Enrollments</h2>
      
      <div className="table-responsive custom-table-wrapper">
        <Table className="custom-table" striped bordered hover>
          <thead>
            <tr>
              <th>Module Title</th>
              <th>Content Title</th>
              <th>Enrolled Trainees</th>
              <th>Trainee IDs</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((module) =>
                module.contents.length > 0 ? (
                  module.contents.map((content, index) => (
                    <tr key={content.id}>
                      {index === 0 && (
                        <td rowSpan={module.contents.length}>{module.title}</td>
                      )}
                      <td>{content.title}</td>
                      <td>
                        {content.enrolledTrainees.length > 0 ? (
                          <ul className="mb-0 ps-3">
                            {content.enrolledTrainees.map((t) => (
                              <li key={t.trainee_id}>{t.first_name} {t.last_name}</li>
                            ))}
                          </ul>
                        ) : (
                          "No trainees enrolled"
                        )}
                      </td>
                      <td>
                        {content.enrolledTrainees.length > 0 ? (
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
                  <tr key={module.id}>
                    <td>{module.title}</td>
                    <td colSpan={3}>No content added</td>
                  </tr>
                )
              )
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
