import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Dashboard from "../pages/user/Dashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import CreateComplaint from "../pages/user/CreateComplaint";
import ComplaintDetail from "../pages/user/ComplaintDetail";
import ProtectedRoute from "../routes/ProtectedRoute";
import RoleRoute from "../routes/RoleRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* USER DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["user"]}>
                <Dashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ✅ FIXED: CREATE COMPLAINT ROUTE */}
        <Route
          path="/create-complaint"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["user"]}>
                <CreateComplaint />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
  path="/complaint/:id"
  element={
    <ProtectedRoute>
      <ComplaintDetail />
    </ProtectedRoute>
  }
/>

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;