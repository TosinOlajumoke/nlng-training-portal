import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// 🔐 Auth pages
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Forgot from "./pages/Auth/Forgot";


// 🧭 Layouts
import AdminLayout from "./layouts/AdminLayout";
import InstructorLayout from "./layouts/InstructorLayout";
import TraineeLayout from "./layouts/TraineeLayout";

// 🧩 Admin pages
import AdminDashboard from "./pages/admin/DashboardHomeAdmin";
import AdminUsers from "./pages/admin/ManageUsers";
import ContentLibrary from "./pages/admin/ContentLibrary";
import AdminReports from "./pages/admin/ReportsPage";

// 🎓 Instructor pages
import InstructorDashboardHome from "./pages/instructor/DashboardHomeInstructor";
import ContentLibraryInst from "./pages/instructor/ContentLibraryInst";
import MyModulesInstructor from "./pages/instructor/MyModulesInstructor";
import InstructorTrainee from "./pages/instructor/EnrollTrainee";
import InstructorSummary from "./pages/instructor/ProgressSummaryInstructor";



// 👨‍💻 Trainee pages
import TraineeDashboardHome from "./pages/trainee/DashboardHomeTrainee";
import TraineeCourses from "./pages/trainee/MyCoursesTrainee";
import TraineeSummary from "./pages/trainee/ProgressSummaryTrainee"

// 🛡️ Auth guard
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===================================================
           🔐 AUTH ROUTES
           =================================================== */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<Forgot />} />
     
        {/* Unauthorized fallback */}
        <Route
          path="/unauthorized"
          element={
            <div className="text-center mt-5">
              <h4 className="text-danger">Unauthorized Access</h4>
              <p>You do not have permission to view this page.</p>
            </div>
          }
        />

        {/* ===================================================
           🧭 ADMIN ROUTES
           =================================================== */}
        <Route
          path="/admin" element={ <ProtectedRoute roles={["admin"]}> 
          <AdminLayout /> 
          </ProtectedRoute>
         }>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="contents" element={<ContentLibrary />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* ===================================================
           🎓 INSTRUCTOR ROUTES
           =================================================== */}
        <Route
          path="/instructor" element={<ProtectedRoute roles={["instructor"]}>
          <InstructorLayout />
          </ProtectedRoute>
          }>
          <Route index element={<InstructorDashboardHome />} />
         <Route path="dashboard" element={<InstructorDashboardHome />} />
          <Route path="content-library" element={<ContentLibraryInst />} />
         <Route path="my-modules" element={<MyModulesInstructor />} />
        <Route path="enroll-trainee" element={<InstructorTrainee />} />
        <Route path="progress-summary" element={<InstructorSummary />} />
        </Route>

        {/* ===================================================
           👨‍💻 TRAINEE ROUTES
           =================================================== */}
       <Route
          path="/trainee" element={<ProtectedRoute roles={["trainee"]}>
              <TraineeLayout />
            </ProtectedRoute>
          }>
          <Route index element={<TraineeDashboardHome />} />
         <Route path="dashboard" element={<TraineeDashboardHome />} />
        <Route path="my-courses" element={<TraineeCourses />} />
        <Route path="progress-summary" element={<TraineeSummary />} />
        </Route>

        {/* ===================================================
           ⚠️ 404 FALLBACK
           =================================================== */}
        <Route
          path="*" element={
            <div className="text-center mt-5 text-muted">
              <h2>404 - Page Not Found</h2>
              <p>The page you’re looking for doesn’t exist.</p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
