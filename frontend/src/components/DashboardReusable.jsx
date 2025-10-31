import React, { useEffect, useState, useCallback } from "react";
import DashboardCard from "./DashboardCard";
import Charts from "./Charts";
import defaultAvatar from "../assets/default-avatar.png";
import { API_BASE_URL } from "../api";

const DashboardReusable = ({
  userId,
  fetchUrl,
  cardsConfig,
  refreshInterval = 30000
}) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [uploading, setUploading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await fetch(`${API_BASE_URL}${fetchUrl}/${userId}`);
      const data = await res.json();

      setUser(data.user || {});
      setStats(data.stats || data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  }, [userId, fetchUrl]);

  useEffect(() => {
    fetchDashboardData();

    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
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
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploading(false);
    }
  };

  if (!user) return <p>Loading dashboard...</p>;

  const displayName =
    user.role === "instructor"
      ? `${user.title || ""} ${user.first_name} ${user.last_name}`
      : `${user.first_name} ${user.last_name}`;

  const profileImg = user.profile_picture || defaultAvatar;

  // Determine chart type automatically
  const chartType = user.role === "instructor" ? "instructor" : "admin";

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome back, {displayName} 👋</h2>
        <div className="profile-box">
          <img src={profileImg} alt="Profile" className="profile-img" />
          <label className="upload-btn">
            {uploading ? "Uploading..." : "Upload"}
            <input type="file" hidden onChange={handleUpload} />
          </label>
        </div>
      </div>

      <h6 className="overview-text">
        Here’s an overview of your platform at a glance
      </h6>

      <div className="cards-grid">
        {cardsConfig.map((card, index) => {
          const value = stats[card.key] ?? "N/A";
          return (
            <DashboardCard
              key={index}
              label={card.label}
              count={card.bold ? <strong>{value}</strong> : value}
            />
          );
        })}
      </div>

      <Charts data={stats} chartType={chartType} />
    </div>
  );
};

export default DashboardReusable;
