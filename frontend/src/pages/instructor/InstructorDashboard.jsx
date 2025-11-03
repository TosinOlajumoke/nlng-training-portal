import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardHomeInstructor from "./DashboardHomeInstructor";
import MyCoursesInstructor from "./MyCoursesInstructor";
import EnrollTraineeInstructor from "./EnrollTrainee";
import ProgressSummaryInstructor from "./ProgressSummaryInstructor";
import InstructorLayout from "../../layouts/InstructorLayout";

const InstructorDashboard = () => {
  return (
    <Routes>
      <Route element={<InstructorLayout />}>
        <Route index element={<DashboardHomeInstructor />} />
        <Route path="my-courses" element={<MyCoursesInstructor />} />
        <Route path="enroll-trainee" element={<EnrollTraineeInstructor />} />
        <Route path="progress-summary" element={<ProgressSummaryInstructor />} />
      </Route>
    </Routes>
  );
};

export default InstructorDashboard;
