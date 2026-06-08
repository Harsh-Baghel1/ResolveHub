

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

/* AUTH */
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";

/* LAYOUTS */
import AdminLayout from "../layouts/AdminLayout";
import AgentLayout from "../layouts/AgentLayout";

/* USER */
import Dashboard from "../pages/user/Dashboard";
import CreateComplaint from "../pages/user/CreateComplaint";
import MyComplaints from "../pages/user/MyComplaints";
import ComplaintDetail from "../pages/user/ComplaintDetail";
import UserChat from "../pages/user/UserChat";
import UserDetail from "../pages/admin/UserDetail";
/* ADMIN */
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageComplaints from "../pages/admin/ManageComplaints";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageAgents from "../pages/admin/ManageAgents";
import AdminChats from "../pages/admin/AdminChats";
import Reports from "../pages/admin/Reports";
import Settings from "../pages/admin/Settings";
import AdminComplaintDetail from "../pages/admin/AdminComplaintDetail";

/* AGENT */
import AgentDashboard from "../pages/agent/AgentDashboard";
import AssignedComplaints from "../pages/agent/AssignComplaints";
import ResolveComplaint from "../pages/agent/ResolveComplaint";
import AgentChat from "../pages/agent/AgentChat";
import AgentDetail from "../pages/admin/AgentDetail";
import AgentPerformance from "../pages/agent/AgentPerformance";
import AgentProfile from "../pages/agent/AgentProfile";

/* ROUTE GUARDS */
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        { /*===================================== */}
        {/* AUTH ROUTES */}
        {/* ===================================== */}

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
          element={<ForgotPassword />}
        />

        {/* ===================================== */}
        {/* USER ROUTES */}
        {/* ===================================== */}

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
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["user"]}>
                <UserChat />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ===================================== */}
        {/* ADMIN ROUTES (NESTED) */}
        {/* ===================================== */}

      <Route
  path="/admin"
  element={
    <ProtectedRoute>
      <RoleRoute allowedRoles={["admin"]}>
        <AdminLayout />
      </RoleRoute>
    </ProtectedRoute>
  }
>
  <Route index element={<AdminDashboard />} />

  <Route path="complaints" element={<ManageComplaints />} />

  <Route
    path="complaints/:id"
    element={<AdminComplaintDetail />}
  />

  <Route path="users" element={<ManageUsers />} />
  <Route path="user/:id" element={<UserDetail />} />

  <Route path="agents" element={<ManageAgents />} />
  <Route path="agent/:id" element={<AgentDetail />} />

  <Route path="chats" element={<AdminChats />} />
  <Route path="reports" element={<Reports />} />
  <Route path="settings" element={<Settings />} />
</Route>

        {/* ===================================== */}
        {/* AGENT ROUTES */}
        {/* ===================================== */}

       <Route
  path="/agent"
  element={
    <ProtectedRoute>
      <RoleRoute allowedRoles={["agent"]}>
        <AgentLayout />
      </RoleRoute>
    </ProtectedRoute>
  }
>
  <Route
    index
    element={<AgentDashboard />}
  />

  <Route
    path="complaints"
    element={<AssignedComplaints />}
  />

  <Route
    path="chat"
    element={<AgentChat />}
  />

  <Route
  path="performance"
  element={<AgentPerformance />}
/>

  <Route
  path="profile"
  element={<AgentProfile />}
/>

  <Route
    path="resolve/:id"
    element={<ResolveComplaint />}
  />
</Route>

        {/* ===================================== */}
        {/* COMMON ROUTES */}
        {/* ===================================== */}

        <Route
          path="/complaint/:id"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowedRoles={[
                  "user",
                  "admin",
                  "agent",
                ]}
              >
                <ComplaintDetail />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ===================================== */}
        {/* FALLBACK */}
        {/* ===================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;