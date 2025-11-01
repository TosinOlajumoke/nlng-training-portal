// pages/instructor/DashboardHomeInstructor.jsx
import React from "react";
import DashboardReusable from "../../components/DashboardReusable";

const DashboardHomeInstructor = () => {
  const instructorCardsConfig = [
    { label: "Total Contents", key: "total_contents" },
    { label: "Total Modules", key: "total_modules" },
    { label: "Trainees Enrolled", key: "total_trainees" },
  ];

  return (
    <div className="page-content">
      <DashboardReusable fetchUrl="/users/dashboard" cardsConfig={instructorCardsConfig} />
    </div>
  );
};

export default DashboardHomeInstructor;
