import React from "react";
import DashboardReusable from "../../components/DashboardReusable";
import { useAuth } from "../../context/AuthContext";

const DashboardHomeTrainee = () => {
  const { user } = useAuth(); // ✅ Get current logged-in user

  // Config for admin dashboard cards
  const adminCardsConfig = [
     { label: "Your Trainee ID is:", key: "trainee_id", bold: true },
    { label: "Total Courses", key: "total_admins" },
    { label: "Total Courses Completed", key: "total_instructors" },
   ];

  return (
    <div className="page-content">
      <DashboardReusable
        userId={user?.id}
        fetchUrl="/users/dashboard"
        cardsConfig={adminCardsConfig}
      />
    </div>
  );
};

export default DashboardHomeTrainee;
