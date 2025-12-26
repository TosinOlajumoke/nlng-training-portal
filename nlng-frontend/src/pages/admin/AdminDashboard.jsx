import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardHomeAdmin from "./DashboardHomeAdmin";
import ManageUsers from "./ManageUsers";
import ContentLibrary from "./ContentLibrary";
import ReportsPage from "./ReportsPage";
import AdminLayout from "../../layouts/AdminLayout";

const AdminDashboard = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardHomeAdmin />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="settings" element={<ContentLibrary />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
};

export default AdminDashboard;
