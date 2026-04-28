// frontend/src/pages/admin/AdminDashboard.jsx

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

import {
  Activity,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

/* =====================================
   STAT CARD (FIXED - OUTSIDE COMPONENT)
===================================== */
const StatCard = ({
  title,
  value,
  icon,
  color,
  keyName,
  activeFilter,
  setActiveFilter,
}) => (
  <button
    onClick={() => setActiveFilter(keyName)}
    className={`bg-white rounded-3xl border p-5 shadow-sm text-left transition hover:shadow-md ${
      activeFilter === keyName
        ? "border-blue-500"
        : "border-slate-200"
    }`}
  >
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500 font-medium">
        {title}
      </p>

      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
    </div>

    <h3 className="text-3xl font-bold text-slate-800 mt-4">
      {value}
    </h3>
  </button>
);

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("total");

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    overdue: 0,
  });

  const [complaints, setComplaints] = useState([]);

  /* =====================================
     LOAD DATA (FIXED API HANDLING)
  ===================================== */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, complaintsRes] =
          await Promise.all([
            axiosInstance.get("/admin/stats"),
            axiosInstance.get("/admin/complaints"),
          ]);

        console.log("STATS API:", statsRes.data);
        console.log("COMPLAINTS API:", complaintsRes.data);

const statsData = statsRes.data.data || {};

setStats({
  total: statsData.totalComplaints || 0,
  open: statsData.openComplaints || 0,
  inProgress:
    (statsData.totalComplaints || 0) -
    (statsData.openComplaints || 0) -
    (statsData.resolvedComplaints || 0) -
    (statsData.closedComplaints || 0),
  resolved: statsData.resolvedComplaints || 0,
  overdue: statsData.overdueComplaints || 0,
});

        setComplaints(
  Array.isArray(complaintsRes.data.data)
    ? complaintsRes.data.data
    : complaintsRes.data.data?.complaints || []
);
      } catch (error) {
        console.log("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* =====================================
     FILTER LOGIC (SAFE)
  ===================================== */
  const filtered = useMemo(() => {
    return complaints.filter((item) => {
      const status = item.status?.toLowerCase();

      switch (activeFilter) {
        case "open":
          return status === "open" || status === "pending";

        case "in_progress":
          return status === "in_progress";

        case "resolved":
          return status === "resolved" || status === "closed";

        case "overdue":
          return item.slaStatus === "overdue";

        default:
          return true;
      }
    });
  }, [activeFilter, complaints]);

  /* =====================================
     HELPERS
  ===================================== */
  const statusColor = (status) => {
    const s = status?.toLowerCase();

    switch (s) {
      case "open":
        return "bg-yellow-100 text-yellow-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      case "closed":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-purple-100 text-purple-700";
    }
  };

  const formatStatus = (value) =>
    value
      ?.replace("_", " ")
      ?.replace(/\b\w/g, (c) => c.toUpperCase());

  /* =====================================
     LOADING
  ===================================== */
  if (loading) {
    return (
      <div className="h-full min-h-[70vh] flex items-center justify-center text-slate-500">
        <Loader2 className="animate-spin mr-2" />
        Loading dashboard...
      </div>
    );
  }

  /* =====================================
     UI
  ===================================== */
  return (
    <div>

      {/* HERO */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div>
            <p className="text-blue-100 text-sm">
              Admin Workspace
            </p>
            <h1 className="text-4xl font-bold mt-2">
              Dashboard Overview
            </h1>
            <p className="text-blue-100 mt-3 max-w-2xl">
              Track complaints, SLA breaches, and support operations in real time.
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur px-5 py-4 rounded-2xl">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck size={16} />
              System Status
            </div>
            <div className="mt-2 text-2xl font-bold">
              Active
            </div>
          </div>

        </div>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-5 mb-6">

        <StatCard title="Total" value={stats.total} keyName="total"
          color="bg-slate-100 text-slate-700"
          icon={<Activity size={22} />}
          activeFilter={activeFilter} setActiveFilter={setActiveFilter}
        />

        <StatCard title="Open" value={stats.open} keyName="open"
          color="bg-yellow-100 text-yellow-700"
          icon={<Clock3 size={22} />}
          activeFilter={activeFilter} setActiveFilter={setActiveFilter}
        />

        <StatCard title="In Progress" value={stats.inProgress} keyName="in_progress"
          color="bg-blue-100 text-blue-700"
          icon={<FileText size={22} />}
          activeFilter={activeFilter} setActiveFilter={setActiveFilter}
        />

        <StatCard title="Resolved" value={stats.resolved} keyName="resolved"
          color="bg-green-100 text-green-700"
          icon={<CheckCircle2 size={22} />}
          activeFilter={activeFilter} setActiveFilter={setActiveFilter}
        />

        <StatCard title="Overdue" value={stats.overdue} keyName="overdue"
          color="bg-red-100 text-red-700"
          icon={<AlertTriangle size={22} />}
          activeFilter={activeFilter} setActiveFilter={setActiveFilter}
        />

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Recent Complaints
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Showing {filtered.length} records
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/complaints")}
            className="text-blue-600 font-medium text-sm flex items-center gap-2 hover:text-blue-700"
          >
            View All
            <ArrowRight size={16} />
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="p-14 text-center">
            <p className="text-lg font-semibold text-gray-600">
              No complaints yet 🚀
            </p>
            <p className="text-sm text-gray-400 mt-2">
              You're all caught up!
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.slice(0, 7).map((item) => (
              <button
                key={item._id}
                onClick={() =>
                  navigate(`/complaint/${item._id}`)
                }
                className="w-full text-left px-6 py-5 hover:bg-slate-50 transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                  <div>
                    <h4 className="font-semibold text-slate-800">
                      {item.title}
                    </h4>

                    <p className="text-sm text-slate-500 mt-1">
                      Ticket #{item.ticketId || "N/A"} •{" "}
                      {item.createdBy?.name || "Unknown User"}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                      item.status
                    )}`}
                  >
                    {formatStatus(item.status)}
                  </span>

                </div>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;