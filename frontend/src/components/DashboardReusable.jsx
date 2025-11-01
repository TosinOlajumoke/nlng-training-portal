// components/DashboardReusable.jsx
import React, { useEffect, useState, useCallback } from "react";
import DashboardCard from "./DashboardCard";
import Charts from "./Charts";
import defaultAvatar from "../assets/default-avatar.png";
import { API_BASE_URL } from "../api";
import { useAuth } from "../context/AuthContext";

const DashboardReusable = ({ fetchUrl = "/users/dashboard", cardsConfig = [], refreshInterval = 30000 }) => {
  const { user: authUser } = useAuth(); // expects context providing logged-in user
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
      const payload = await res.json();
      // payload shape { user, stats }
      setUser(payload.user || {});
      setStats(payload.stats || {});
      setLoading(false);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setLoading(false);
    }
  }, [userId, fetchUrl]);

  useEffect(() => {
    fetchDashboardData();
    const id = setInterval(fetchDashboardData, refreshInterval);
    return () => clearInterval(id);
  }, [fetchDashboardData, refreshInterval]);

 const handleUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setUploading(true);

  const formData = new FormData();
  formData.append("profile", file);

  try {
    const res = await fetch(`${API_BASE_URL}/users/upload-profile/${userId}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setUploading(false);

    if (data.imageUrl) {
      setUser((prev) => ({ ...prev, profile_picture: data.imageUrl }));

      // ✅ Update auth context if available
      if (typeof updateUser === "function") {
        updateUser((prev) => ({
          ...prev,
          profile_picture: data.imageUrl,
        }));
      }
    }
  } catch (err) {
    console.error("Upload error:", err);
    setUploading(false);
  }
};


  if (!user && loading) return <p>Loading dashboard...</p>;
  if (!user) return <p>User not found</p>;

  const displayName = user.role === "instructor"
    ? `${user.title ? user.title + " " : ""}${user.first_name} ${user.last_name || ""}`
    : `${user.first_name} ${user.last_name || ""}`;

  const profileImg = user.profile_picture || defaultAvatar;

  // Determine chartType from user role
  const chartType = user.role === "instructor" ? "instructor" : user.role === "trainee" ? "trainee" : "admin";

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Welcome back, {displayName} 👋</h2>
          {/* Only show instrucor-specific title above charts */}
          {user.role === "instructor"}
        </div>

        <div className="profile-box">
      <img src={user?.profile_picture?.startsWith("http") ? user.profile_picture
      : `${API_BASE_URL.replace("/api", "")}${user.profile_picture}`} alt="Profile"
  className="profile-img"/>

          <label className="upload-btn">
            {uploading ? "Uploading..." : "Upload"}
            <input type="file" hidden onChange={handleUpload} />
          </label>
        </div>
      </div>

      <h5 className="overview-text">Here’s an overview of your platform at a glance</h5>

      <div className="cards-grid">
        {cardsConfig.map((card, idx) => {
          const rawVal = stats[card.key];
          const displayValue = rawVal === undefined || rawVal === null ? "N/A" : rawVal;
          return <DashboardCard key={idx} label={card.label} count={card.bold ? <strong>{displayValue}</strong> : displayValue} />;
        })}
      </div>

      <Charts data={stats} chartType={chartType} />
    </div>
  );
};

export default DashboardReusable;
