import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import AdminDashboard from "../pages/AdminDashboard";
import CreateComplaint from "../pages/CreateComplaint";
import ComplaintDetail from "../pages/ComplaintDetail";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleRoute from "../components/RoleRoute";

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