import React from "react";
import NavbarCommon from "../components/NavbarCommon";
import SidebarReusable from "../components/SidebarReusable";
import { Outlet } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserPlus,
  FaBookOpen,
  FaChartLine,
  FaBook,
  FaChalkboardTeacher,
} from "react-icons/fa";



const InstructorLayout = () => {
  const menuItems = [
    {
      label: "Dashboard",
      path: "/instructor",
      icon: <FaTachometerAlt />,
    },
    {
      label: "Content Library",
      path: "/instructor/content-library",
      icon: <FaBookOpen />,
    },
     {
      label: "My Modules",
      path: "/instructor/my-modules",
      icon: <FaBook />,
    },
    {
      label: "Enrollment Tab",
      path: "/instructor/enroll-trainee",
      icon: <FaUserPlus />,
    },   
    {
      label: "Progress Summary",
      path: "/instructor/progress-summary",
      icon: <FaChartLine />,
    },
  ];

  return (
    <div className="instructor-layout">
      <NavbarCommon />
      <SidebarReusable
        title="Instructor Page"
        icon={<FaChalkboardTeacher />}
        menuItems={menuItems}
      />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default InstructorLayout;
