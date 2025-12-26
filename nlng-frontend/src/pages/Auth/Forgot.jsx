import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavbarCommon from "../../components/NavbarCommon";
import logo from "../../assets/navbar.png";
import { Link } from "react-router-dom";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Real-time password match validation
    if (newPassword !== confirmPassword) {
      setPasswordMatchError("❌ Passwords do not match!");
      return;
    }

    setPasswordMatchError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/reset-password",
        { email, newPassword }
      );

      toast.success(response.data?.message || "✅ Password reset successful!", {
        position: "top-center",
      });

      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordUpdated(true);

    } catch (err) {
      toast.error(err.response?.data?.error || "❌ Failed to reset password", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (newPassword && e.target.value !== newPassword) {
      setPasswordMatchError("❌ Passwords do not match!");
    } else {
      setPasswordMatchError("");
    }
  };

  return (
    <>
      <NavbarCommon />
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="text-center mb-3">
            <img src={logo} alt="Logo" style={{ width: "90px", marginBottom: "10px" }} />
            <h4 className="auth-title">Reset Your Password</h4>
            <p className="text-muted small">Please enter your email and new password.</p>
          </div>

          {passwordUpdated ? (
            <div className="text-center">
              <h5>✅ Your password has been updated successfully!</h5>
             <Link to="/login" className="btn auth-btn mt-3">
                Go back to Login
              </Link> 
                </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">New Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              <div className="mb-3">
                <label className="form-label fw-semibold">Confirm Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
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
                {passwordMatchError && (
                  <div className="text-danger mt-2">{passwordMatchError}</div>
                )}
              </div>

              <button
                className="btn w-100 mt-3 auth-btn"
                type="submit"
                disabled={loading || newPassword !== confirmPassword}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>

        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </>
  );
}
