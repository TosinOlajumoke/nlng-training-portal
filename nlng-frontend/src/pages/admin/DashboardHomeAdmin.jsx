import React from "react";
import DashboardReusable from "../../components/DashboardReusable";
import { useAuth } from "../../context/AuthContext";

const DashboardHomeAdmin = () => {
  const { user } = useAuth();

  const adminCardsConfig = [
    { label: "Total Users", key: "total_users" },
    { label: "Total Admins", key: "total_admins" },
    { label: "Total Instructors", key: "total_instructors" },
    { label: "Total Trainees", key: "total_trainees" },
  ];

  return (
    <div className="page-content">
      <DashboardReusable fetchUrl="/users/dashboard" cardsConfig={adminCardsConfig} />
    </div>
  );
};

export default DashboardHomeAdmin;

