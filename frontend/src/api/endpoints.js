// frontend/src/api/endpoints.js

const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
  },

  USER: {
    PROFILE: "/user/profile",
    DASHBOARD: "/user/dashboard",
    COMPLAINTS: "/user/complaints",
    NOTIFICATIONS: "/user/notifications",
  },

  AGENT: {
    PROFILE: "/agent/profile",
    COMPLAINTS: "/agent/complaints",
    PERFORMANCE: "/agent/performance",
    NOTIFICATIONS: "/agent/notifications",
  },

  ADMIN: {
    STATS: "/admin/stats",
    USERS: "/admin/users",
    AGENTS: "/admin/agents",
    COMPLAINTS: "/admin/complaints",
    OVERDUE: "/admin/complaints/overdue",
    ASSIGN: "/admin/complaints/assign",
    CHANGE_ROLE: "/admin/users/role",
  },

  COMPLAINT: {
    CREATE: "/complaints",
    MY: "/complaints/my",
    ASSIGNED: "/complaints/assigned",
    STATUS: "/complaints/status",
  },

  MESSAGE: {
    LIST: "/messages",
    SEEN: "/messages/seen",
  },
};

export default ENDPOINTS;