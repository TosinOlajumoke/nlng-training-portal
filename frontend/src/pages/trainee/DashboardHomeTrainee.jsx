// pages/trainee/DashboardHomeTrainee.jsx
import React from "react";
import DashboardReusable from "../../components/DashboardReusable";
import { useAuth } from "../../context/AuthContext";

const DashboardHomeTrainee = () => {
  const { user } = useAuth();

  const traineeCardsConfig = [
    { label: "Trainee ID", key: "trainee_id" },
    { label: "Courses Enrolled", key: "total_courses_enrolled" },
    { label: "Modules Enrolled", key: "total_modules_enrolled" },
    { label: "Completed Modules", key: "total_modules_completed" },
    { label: "Completed Courses", key: "total_courses_completed" },
  ];

  return (
    <div className="page-content">
      <DashboardReusable fetchUrl="/users/dashboard" cardsConfig={traineeCardsConfig} />
    </div>
  );
};

export default DashboardHomeTrainee;
