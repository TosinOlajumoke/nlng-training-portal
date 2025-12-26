import React from "react";
import NavbarCommon from "../components/NavbarCommon";
import SidebarReusable from "../components/SidebarReusable";
import { Outlet } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaBookOpen, FaChartBar } from "react-icons/fa";

const AdminLayout = () => {
  const menuItems = [
    { label: "Dashboard", path: "/admin", icon: <FaTachometerAlt /> },
    { label: "User Management", path: "/admin/users", icon: <FaUsers /> },
    { label: "Content Library", path: "/admin/contents", icon: <FaBookOpen /> },
    { label: "Reports", path: "/admin/reports", icon: <FaChartBar /> },
  ];

  return (
    <div className="admin-layout">
      <NavbarCommon />
      <SidebarReusable
        title="Admin Panel"
        icon={<FaTachometerAlt />}
        menuItems={menuItems}
      />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
