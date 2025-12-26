import React from "react";
import UserManagement from "../../components/UserManagement";

const ManageUsers = () => {
  const adminColumns = [
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "email", label: "Email" },
  ];

  const instructorColumns = [
    { key: "title", label: "Title" },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "email", label: "Email" },
  ];

  const traineeColumns = [
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "trainee_id", label: "Trainee ID" },
    { key: "email", label: "Email" },
  ];

  return (
    <div className="page-content">
      <h3 className="mb-4 fw-bold">User Management 👥</h3>
      <UserManagement
        adminColumns={adminColumns}
        instructorColumns={instructorColumns}
        traineeColumns={traineeColumns}
      />
    </div>
  );
};

export default ManageUsers;
