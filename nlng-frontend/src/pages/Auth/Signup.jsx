import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavbarCommon from "../../components/NavbarCommon";
import logo from "../../assets/navbar.png";
import { API_BASE_URL } from "../../api";

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("trainee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email,
        password,
        role,
        first_name: capitalize(firstName.trim()),
        last_name: capitalize(lastName.trim()),
        title: role === "instructor" ? title : null,
      };

      // Call the user creation endpoint
      const { data } = await axios.post(`${API_BASE_URL}/users`, payload);

      // Toast message based on email success
      if (data.emailSent) {
        toast.success("✅ Registration successful! Check your email for login details.");
      } else {
        toast.warning("✅ Registration successful! But failed to send email.");
      }

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || "❌ Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavbarCommon />
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="text-center mb-3">
            <img src={logo} alt="Logo" />
            <h4 className="auth-title">Create Account ✨</h4>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Role */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="trainee">Trainee</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>

            {/* Names */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">First Name</label>
                <input
                  className="form-control"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Last Name</label>
                <input
                  className="form-control"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Instructor Title */}
            {role === "instructor" && (
              <div className="mb-3">
                <label className="form-label fw-semibold">Title</label>
                <select
                  className="form-select"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                >
                  <option value="">Select Title</option>
                  <option value="Prof.">Prof.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                </select>
              </div>
            )}

            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <div className="input-group">
                <input
                  className="form-control"
                  type={show ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShow((s) => !s)}
                >
                  <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-3">
              <div className="input-group">
                <input
                  className="form-control"
                  type={show ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShow((s) => !s)}
                >
                  <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <div className="text-danger small mt-1">Passwords do not match.</div>
              )}
            </div>

            {/* Trainee ID Info */}
            {role === "trainee" && (
              <div className="alert alert-info p-2 text-center">
                Your trainee ID will be auto-generated (e.g. NLNG/T/4021)
              </div>
            )}

            {/* Button */}
            <button
              className="btn w-100 mt-3 auth-btn"
              type="submit"
              disabled={loading || password !== confirmPassword}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            {/* Back to Login */}
            <div className="text-center mt-3">
              <Link to="/login" className="auth-link">
                Back to Login
              </Link>
            </div>
          </form>
        </div>

        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </>
  );
}
