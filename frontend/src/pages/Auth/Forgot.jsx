import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavbarCommon from "../../components/NavbarCommon";
import "../../index.css";
import logo from "../../assets/navbar.png";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot", {
        email,
      });

      toast.success(res.data?.message || "✅ Password reset link sent!", {
        position: "top-center",
      });
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.error || "❌ Failed to send reset link", {
        position: "top-center",
      });
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
            <img
              src={logo}
              alt="NLNG Logo"
              style={{ width: "90px", marginBottom: "10px" }}
            />
            <h4 className="auth-title">Forgot Password?</h4>
            <p className="text-muted small">
              Enter your registered email address, and we’ll send you a reset
              link.
            </p>
          </div>

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

            <button
              className="btn w-100 mt-3 auth-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="text-center mt-3">
              <Link to="/login" className="auth-link">
                ← Back to Login
              </Link>
            </div>
          </form>
        </div>

        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </>
  );
}
