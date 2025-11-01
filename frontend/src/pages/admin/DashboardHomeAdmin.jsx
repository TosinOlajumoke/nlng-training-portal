// pages/admin/DashboardHomeAdmin.jsx
import React from "react";
import DashboardReusable from "../../components/DashboardReusable";
import { useAuth } from "../../context/AuthContext";

const DashboardHomeAdmin = () => {
  const { user } = useAuth();

  const adminCardsConfig = [
    { label: "Total Users", key: "total_users" },
    { label: "Admins", key: "total_admins" },
    { label: "Instructors", key: "total_instructors" },
    { label: "Trainees", key: "total_trainees" },
  ];

  return (
    <div className="page-content">
      <DashboardReusable fetchUrl="/users/dashboard" cardsConfig={adminCardsConfig} />
    </div>
  );
};

export default DashboardHomeAdmin;
