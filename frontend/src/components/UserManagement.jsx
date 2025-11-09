// src/pages/admin/UserManagement.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Modal, Button, Dropdown } from "react-bootstrap";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../api"; // ✅ centralized import

const UserManagement = ({ adminColumns, instructorColumns, traineeColumns }) => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState({
    admin: 1,
    instructor: 1,
    trainee: 1,
  });

  const tableRefs = {
    admin: useRef(null),
    instructor: useRef(null),
    trainee: useRef(null),
  };

  // Form data
  const [form, setForm] = useState({
    role: "trainee",
    first_name: "",
    last_name: "",
    title: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [hasShownMismatchToast, setHasShownMismatchToast] = useState(false);

  const generateTraineeId = () => {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `NLNG/T/${randomNum}`;
  };

  // ✅ Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users`);
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to fetch users.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Live validation for confirm password
  useEffect(() => {
    if (form.confirmPassword.length > 0) {
      if (form.confirmPassword !== form.password) {
        if (!hasShownMismatchToast) {
          toast.warn("⚠️ Passwords do not match!", { autoClose: 2000 });
          setHasShownMismatchToast(true);
        }
      } else {
        setHasShownMismatchToast(false);
      }
    }
  }, [form.confirmPassword, form.password]);

  // ✅ Capitalize function
  const capitalizeName = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())
      .join(" ");
  };

  // ✅ Add new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("❌ Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        first_name: capitalizeName(form.first_name),
        last_name: capitalizeName(form.last_name),
        trainee_id: form.role === "trainee" ? generateTraineeId() : null,
      };
      await axios.post(`${API_BASE_URL}/users`, payload);
      toast.success("✅ User added successfully!");
      setShowModal(false);
      fetchUsers();
      setForm({
        role: "trainee",
        first_name: "",
        last_name: "",
        title: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/users/${id}`);
      toast.success("🗑️ User deleted successfully!");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete user");
    }
  };

  // ✅ CSV & PDF Export helpers
  const filterColumnsForExport = (data, role) => {
    if (!data.length) return [];

    const excludeColumns = ["created_at"];
    let columnsOrder = [];

    if (role === "admin") {
      columnsOrder = ["id", "first_name", "last_name", "email", "role"];
    } else if (role === "instructor") {
      columnsOrder = ["id", "title", "first_name", "last_name", "email", "role"];
    } else if (role === "trainee") {
      columnsOrder = ["id", "trainee_id", "first_name", "last_name", "email", "role"];
    } else {
      columnsOrder = Object.keys(data[0]).filter((c) => !excludeColumns.includes(c));
    }

    return data.map((row) => {
      const filteredRow = {};
      columnsOrder.forEach((key) => {
        if (!excludeColumns.includes(key) && row.hasOwnProperty(key))
          filteredRow[key] = row[key];
      });
      return filteredRow;
    });
  };

  const exportCSV = (data, role, filename) => {
    const filteredData = filterColumnsForExport(data, role);
    if (!filteredData.length) return;

    const csv = [
      Object.keys(filteredData[0]).join(","),
      ...filteredData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, `${filename}.csv`);
  };

  const exportPDF = (data, role, filename) => {
    const filteredData = filterColumnsForExport(data, role);
    if (!filteredData.length) return;

    const doc = new jsPDF("p", "pt");
    const tableColumns = Object.keys(filteredData[0]);
    const tableRows = filteredData.map((row) => Object.values(row));

    doc.text(filename.toUpperCase(), 14, 20);
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [52, 73, 94], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    doc.save(`${filename}.pdf`);
  };

  const admins = users.filter((u) => u.role === "admin");
  const instructors = users.filter((u) => u.role === "instructor");
  const trainees = users.filter((u) => u.role === "trainee");
  const allUsers = users;

  const paginate = (arr, page) => {
    const start = (page - 1) * rowsPerPage;
    return arr.slice(start, start + rowsPerPage);
  };

  const UserTable = ({ title, data, columns, role }) => {
    const page = currentPage[role];
    const totalRows = data.length;
    const paginatedData = paginate(data, page);
    const startRow = totalRows === 0 ? 0 : (page - 1) * rowsPerPage + 1;
    const endRow = Math.min(page * rowsPerPage, totalRows);

    const handlePrev = () => {
      setCurrentPage((prev) => ({ ...prev, [role]: Math.max(prev[role] - 1, 1) }));
      setTimeout(() => tableRefs[role].current.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const handleNext = () => {
      setCurrentPage((prev) => ({
        ...prev,
        [role]: prev[role] * rowsPerPage < totalRows ? prev[role] + 1 : prev[role],
      }));
      setTimeout(() => tableRefs[role].current.scrollIntoView({ behavior: "smooth" }), 100);
    };

    return (
      <div className="user-table-wrapper mb-5" ref={tableRefs[role]}>
        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
          <h5 className="fw-bold">{title}</h5>
        </div>

        <div className="table-responsive" style={{ overflowX: "auto" }}>
          <table className="table table-bordered table-striped">
            <thead className="table-light">
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((user) => (
                <tr key={user.id}>
                  {columns.map((col) => (
                    <td key={col.key}>{user[col.key]}</td>
                  ))}
                  <td>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      disabled={user.role === "admin" && user.id === admins[0]?.id}
                      onClick={() => handleDelete(user.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
          <div>
            {startRow}-{endRow} of {totalRows}
          </div>
          <div>
            <Button variant="outline-primary" size="sm" onClick={handlePrev}>
              Prev
            </Button>{" "}
            <Button variant="outline-primary" size="sm" onClick={handleNext}>
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const [showExportDropdown, setShowExportDropdown] = useState(false);

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div className="d-flex gap-2 flex-wrap">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <i className="bi bi-person-plus"></i> Add New User
          </Button>

          <Dropdown
            show={showExportDropdown}
            onToggle={() => setShowExportDropdown(!showExportDropdown)}
          >
            <Dropdown.Toggle variant="success">Export</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => exportCSV(admins, "admin", "Admin")}>
                CSV - Admin
              </Dropdown.Item>
              <Dropdown.Item onClick={() => exportPDF(admins, "admin", "Admin")}>
                PDF - Admin
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => exportCSV(instructors, "instructor", "Instructor")}
              >
                CSV - Instructor
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => exportPDF(instructors, "instructor", "Instructor")}
              >
                PDF - Instructor
              </Dropdown.Item>
              <Dropdown.Item onClick={() => exportCSV(trainees, "trainee", "Trainee")}>
                CSV - Trainee
              </Dropdown.Item>
              <Dropdown.Item onClick={() => exportPDF(trainees, "trainee", "Trainee")}>
                PDF - Trainee
              </Dropdown.Item>
              <Dropdown.Item onClick={() => exportCSV(allUsers, "all", "All Users")}>
                CSV - All Users
              </Dropdown.Item>
              <Dropdown.Item onClick={() => exportPDF(allUsers, "all", "All Users")}>
                PDF - All Users
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <div className="mb-3">
        <label>Rows per page: </label>{" "}
        <select
          value={rowsPerPage}
          onChange={(e) => setRowsPerPage(Number(e.target.value))}
        >
          {[5, 10, 15, 20].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Tables */}
      <UserTable title="Admin" data={admins} columns={adminColumns} role="admin" />
      <UserTable
        title="Instructor"
        data={instructors}
        columns={instructorColumns}
        role="instructor"
      />
      <UserTable title="Trainee" data={trainees} columns={traineeColumns} role="trainee" />

      {/* Add User Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleAddUser}>
            <div className="mb-3">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="admin">Admin</option>
                <option value="instructor">Instructor</option>
                <option value="trainee">Trainee</option>
              </select>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">First Name</label>
                <input
                  className="form-control"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({ ...form, first_name: capitalizeName(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Last Name</label>
                <input
                  className="form-control"
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({ ...form, last_name: capitalizeName(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            {form.role === "instructor" && (
              <div className="mb-3">
                <label className="form-label">Title</label>
                <select
                  className="form-select"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                >
                  <option value="">Select Title</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                </select>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Confirm Password</label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`form-control ${
                      form.confirmPassword && form.confirmPassword !== form.password
                        ? "is-invalid"
                        : ""
                    }`}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i
                      className={`bi ${
                        showConfirmPassword ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="text-end">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Adding..." : "Add User"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </div>
  );
};

export default UserManagement;
