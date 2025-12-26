import React from "react";
import DashboardReusable from "../../components/DashboardReusable";
import { useAuth } from "../../context/AuthContext";

const DashboardHomeTrainee = () => {
   const { user } = useAuth();

  const traineeCardsConfig = [
    { label: "Trainee ID :", key: "trainee_id" },
    { label: "Modules Enrolled", key: "total_modules_enrolled" },
    { label: "Contents Enrolled", key: "total_contents_enrolled" },
  ];

  return (
    <div className="page-content">
      <DashboardReusable fetchUrl="/users/dashboard" cardsConfig={traineeCardsConfig} />
    </div>
  );
};

export default DashboardHomeTrainee;

