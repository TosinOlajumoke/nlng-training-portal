import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardHomeTrainee from "./DashboardHomeTrainee";
import MyCoursesTrainee from "./MyCoursesTrainee";
import ProgressSummaryTrainee from "./ProgressSummaryTrainee";
import TraineeLayout from "../../layouts/TraineeLayout";

const TraineeDashboard = () => {
  return (
    <Routes>
      <Route element={<TraineeLayout />}>
        <Route index element={<DashboardHomeTrainee />} />
        <Route path="my-courses" element={<MyCoursesTrainee />} />
        <Route path="progress-summary" element={<ProgressSummaryTrainee />} />
      </Route>
    </Routes>
  );
};

export default TraineeDashboard;
