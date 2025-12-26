import React from "react";
import DashboardReusable from "../../components/DashboardReusable";
import { useAuth } from "../../context/AuthContext";

const DashboardHomeInstructor = () => {
     const { user } = useAuth();

  const instructorCardsConfig = [
    { label: "Total Modules", key: "total_modules" },
    { label: "Total Contents", key: "total_contents" },
    { label: "Trainees Enrolled", key: "total_trainees" },
  ];

  return (
    <div className="page-content">
      <DashboardReusable fetchUrl="/users/dashboard" cardsConfig={instructorCardsConfig} />
    </div>
  );
};

export default DashboardHomeInstructor;

