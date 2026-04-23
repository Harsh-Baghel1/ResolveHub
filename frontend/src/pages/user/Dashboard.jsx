import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  PlusCircle,
  LayoutDashboard,
  User,
  ShieldCheck,
  Headphones,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
} from "lucide-react";

import { logout } from "../../features/auth/authSlice";
import { fetchComplaints } from "../../features/complaint/complaintSlice";
import ComplaintsList from "../../components/complaint/ComplaintsList";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const {
    complaints = [],
    loading,
  } = useSelector((state) => state.complaint);

  // ==================================
  // FETCH FROM REDUX
  // ==================================
  useEffect(() => {
    if (!user) return;

    dispatch(fetchComplaints(user.role));
  }, [dispatch, user]);

  // ==================================
  // COUNTS FROM REDUX DATA
  // ==================================
  const stats = {
    total: complaints.length,

    pending: complaints.filter(
      (item) => item.status === "open"
    ).length,

    inProgress: complaints.filter(
      (item) => item.status === "in_progress"
    ).length,

    resolved: complaints.filter(
      (item) => item.status === "resolved"
    ).length,

    closed: complaints.filter(
      (item) => item.status === "closed"
    ).length,
  };

  // ==================================
  // ACTIONS
  // ==================================
  const handleLogout = () => {
    localStorage.clear();
    dispatch(logout());
    navigate("/");
  };

  const handleNewComplaint = () => {
    navigate("/create-complaint");
  };

  const openFilteredList = (status) => {
    navigate(`/dashboard?status=${status}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  // ==================================
  // ROLE BADGE
  // ==================================
  const roleBadge = {
    user: {
      text: "Customer",
      color: "bg-blue-100 text-blue-700",
      icon: <User size={16} />,
    },
    admin: {
      text: "Admin",
      color: "bg-purple-100 text-purple-700",
      icon: <ShieldCheck size={16} />,
    },
    agent: {
      text: "Agent",
      color: "bg-green-100 text-green-700",
      icon: <Headphones size={16} />,
    },
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">

        {/* ==========================
            SIDEBAR
        ========================== */}
        <aside className="w-64 min-h-screen bg-slate-900 text-white p-5 hidden md:block">
          <h1 className="text-3xl font-bold mb-10 tracking-wide">
            ResolveHub
          </h1>

          <div className="space-y-3">

            <div className="flex gap-3 items-center bg-slate-800 px-4 py-3 rounded-xl">
              <LayoutDashboard size={18} />
              Dashboard
            </div>

            <button
              onClick={handleNewComplaint}
              className="w-full text-left flex gap-3 items-center hover:bg-slate-800 px-4 py-3 rounded-xl transition"
            >
              <PlusCircle size={18} />
              New Complaint
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-left flex gap-3 items-center hover:bg-red-600 px-4 py-3 rounded-xl transition"
            >
              <LogOut size={18} />
              Logout
            </button>

          </div>
        </aside>

        {/* ==========================
            MAIN
        ========================== */}
        <main className="flex-1 p-6">

          {/* HEADER */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                Welcome, {user.name}
              </h2>

              <p className="text-gray-500 mt-1">
                Manage complaints, chats and resolutions efficiently.
              </p>
            </div>

            <div
              className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium ${roleBadge[user.role].color}`}
            >
              {roleBadge[user.role].icon}
              {roleBadge[user.role].text}
            </div>
          </div>

          {/* ==========================
              STATS
          ========================== */}
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500 mb-5">
              <Loader2 className="animate-spin" size={18} />
              Loading Dashboard...
            </div>
          ) : (
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-5 mb-6">

              {/* TOTAL */}
              <div
                onClick={() => openFilteredList("all")}
                className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg cursor-pointer transition"
              >
                <div className="flex justify-between">
                  <p className="text-gray-500">Total Complaints</p>
                  <AlertCircle className="text-blue-500" />
                </div>

                <h3 className="text-3xl font-bold mt-3">
                  {stats.total}
                </h3>
              </div>

              {/* OPEN */}
              <div
                onClick={() => openFilteredList("open")}
                className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg cursor-pointer transition"
              >
                <div className="flex justify-between">
                  <p className="text-gray-500">Open</p>
                  <Clock3 className="text-orange-500" />
                </div>

                <h3 className="text-3xl font-bold mt-3 text-orange-500">
                  {stats.pending}
                </h3>
              </div>

              {/* IN PROGRESS */}
              <div
                onClick={() => openFilteredList("in_progress")}
                className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg cursor-pointer transition"
              >
                <div className="flex justify-between">
                  <p className="text-gray-500">In Progress</p>
                  <AlertCircle className="text-purple-500" />
                </div>

                <h3 className="text-3xl font-bold mt-3 text-purple-500">
                  {stats.inProgress}
                </h3>
              </div>

              {/* RESOLVED */}
              <div
                onClick={() => openFilteredList("resolved")}
                className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg cursor-pointer transition"
              >
                <div className="flex justify-between">
                  <p className="text-gray-500">Resolved</p>
                  <CheckCircle2 className="text-green-500" />
                </div>

                <h3 className="text-3xl font-bold mt-3 text-green-500">
                  {stats.resolved}
                </h3>
              </div>

            </div>
          )}

          {/* ==========================
              LIST
          ========================== */}
          <div className="bg-white rounded-2xl shadow-sm p-6">

            <div className="flex justify-between items-center mb-5">
              <h3 className="text-2xl font-semibold text-slate-800">
                Complaint Management
              </h3>

              {user.role === "user" && (
                <button
                  onClick={handleNewComplaint}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
                >
                  + Raise Complaint
                </button>
              )}
            </div>

            <div className="border-t pt-5">
              {user.role === "user" && (
                <ComplaintsList type="user" />
              )}

              {user.role === "admin" && (
                <ComplaintsList type="admin" />
              )}

              {user.role === "agent" && (
                <ComplaintsList type="agent" />
              )}
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default Dashboard;