import {BrowserRouter,Routes,Route,} from "react-router-dom";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";

import Dashboard from "../pages/user/Dashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

import CreateComplaint from "../pages/user/CreateComplaint";
import MyComplaints from "../pages/user/MyComplaints";
import ComplaintDetail from "../pages/user/ComplaintDetail";

import ProtectedRoute from "../routes/ProtectedRoute";
import RoleRoute from "../routes/RoleRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/forgot-password"
          element={
            <ForgotPassword />
          }
        />

        {/* USER */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowedRoles={[
                  "user",
                ]}
              >
                <Dashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
  path="/my-complaints"
  element={
    <ProtectedRoute>
      <RoleRoute allowedRoles={["user"]}>
        <MyComplaints />
      </RoleRoute>
    </ProtectedRoute>
  }
/>

        <Route
          path="/create-complaint"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowedRoles={[
                  "user",
                ]}
              >
                <CreateComplaint />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowedRoles={[
                  "admin",
                ]}
              >
                <AdminDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* COMMON */}
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