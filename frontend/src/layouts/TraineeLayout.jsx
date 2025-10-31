import React from "react";
import NavbarCommon from "../components/NavbarCommon";
import SidebarReusable from "../components/SidebarReusable";
import { Outlet } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBookOpen,
  FaChartLine,
  FaUserGraduate,
} from "react-icons/fa";

const TraineeLayout = () => {
  const menuItems = [
    {
      label: "Dashboard", path: "/trainee", icon: <FaTachometerAlt />,
    },
    {
      label: "My Modules",
      path: "/trainee/my-courses",
      icon: <FaBookOpen />,
    },
    {
      label: "Progress Summary",
      path: "/trainee/progress-summary",
      icon: <FaChartLine />,
    },
  ];

  return (
    <div className="trainee-layout">
      <NavbarCommon />
      <SidebarReusable
        title="Trainee Page"
        icon={<FaUserGraduate />}
        menuItems={menuItems}
      />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default TraineeLayout;
