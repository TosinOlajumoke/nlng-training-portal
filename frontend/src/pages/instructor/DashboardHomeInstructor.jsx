import React from "react";
import DashboardReusable from "../../components/DashboardReusable";
import { useAuth } from "../../context/AuthContext";

const DashboardHomeInstructor = () => {
  const { user } = useAuth(); // ✅ Get current logged-in user

  // Config for admin dashboard cards
  const adminCardsConfig = [
    { label: "Total Courses", key: "total_users" },
    { label: "Total Trainee Enrolled", key: "total_admins" },
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

export default DashboardHomeInstructor;
