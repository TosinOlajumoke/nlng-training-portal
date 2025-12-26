import React, { useEffect, useState, useCallback } from "react";
import DashboardCard from "./DashboardCard";
import Charts from "./Charts";
import defaultAvatar from "../assets/default-avatar.png";
import { API_BASE_URL } from "../api";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

const DashboardReusable = ({ fetchUrl = "/users/dashboard", cardsConfig = [] }) => {
  const { user: authUser } = useAuth();
  const userId = authUser?.id;
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}${fetchUrl}/${userId}`);
      const data = await res.json();
      setUser(data.user);
      setStats(data.stats);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, fetchUrl]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const handleProfileUpload = async (e) => {
    if (!e.target.files[0]) return;
    const formData = new FormData();
    formData.append("profile_picture", e.target.files[0]);

    try {
      setUploading(true);
      const res = await fetch(`${API_BASE_URL}/users/${userId}/upload-profile`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (!user) return <p>User not found</p>;

  const displayName = user.role === "instructor"
    ? `${user.title ? user.title + " " : ""}${user.first_name} ${user.last_name}`
    : `${user.first_name} ${user.last_name}`;

  const chartType = user.role;
  
  // Handle profile image URL correctly
  const profileImg = user.profile_picture === "uploads/default/default-avatar.png"
    ? defaultAvatar // If default avatar, show the static default image
    : user.profile_picture 
      ? `${STATIC_BASE_URL}/${user.profile_picture}` // Construct the full URL for custom images
      : defaultAvatar; // Fallback to default avatar if profile_picture is undefined or empty

  return (
    <div className="container-fluid dashboard py-3">
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
        <div>
          <h2>Welcome back, {displayName} 👋</h2>
        </div>
        <div className="d-flex align-items-center gap-2">
          <img
            src={profileImg}
            alt="Profile"
            className="rounded-circle border"
            width={80}
            height={80}
          />
          <label className="btn btn-success" style={{ backgroundColor: "#006400", color: "white" }}>
            {uploading ? "Uploading..." : "Upload"}
            <input type="file" onChange={handleProfileUpload} hidden />
          </label>
        </div>
      </div>

      <h5 className="text-secondary mb-3">Here’s an overview of your platform at a glance</h5>

      <div className="row g-3 mb-4">
        {cardsConfig.map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <DashboardCard label={card.label} count={stats[card.key] ?? "N/A"} />
          </div>
        ))}
      </div>

      <Charts data={stats} chartType={chartType} />
    </div>
  );
};

export default DashboardReusable;
