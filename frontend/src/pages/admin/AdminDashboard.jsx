import { useEffect, useState, useMemo  } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { logout } from "../../features/auth/authSlice";

import {
  LayoutDashboard,
  LogOut,
  Users,
  UserCog,
  FileText,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Loader2,
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    overdue: 0,
  });

  //const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // ====================================
  // FETCH ADMIN DATA
  // ====================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, complaintsRes] = await Promise.all([
          axiosInstance.get("/complaints/stats"),
          axiosInstance.get("/complaints/all"),
        ]);

        setStats(statsRes.data);
        setComplaints(complaintsRes.data.complaints || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [activeFilter, setActiveFilter] = useState("total");

  // ====================================
  // LOGOUT
  // ====================================
  const handleLogout = () => {
    localStorage.clear();
    dispatch(logout());
    navigate("/");
  };

  // ====================================
  // STATUS FORMAT
  // ====================================
  const formatStatus = (status) => {
    return status
      ?.replace("_", " ")
      ?.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const statusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-orange-100 text-orange-700";
      case "in_progress":
        return "bg-purple-100 text-purple-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      case "closed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const filteredComplaints = useMemo(() => {
  switch (activeFilter) {
    case "open":
      return complaints.filter(
        (item) => item.status === "open"
      );

    case "in_progress":
      return complaints.filter(
        (item) => item.status === "in_progress"
      );

    case "resolved":
      return complaints.filter(
        (item) => item.status === "resolved"
      );

    case "overdue":
      return complaints.filter(
        (item) =>
          item.slaStatus === "overdue"
      );

    default:
      return complaints;
  }
}, [activeFilter, complaints]);


  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        <Loader2 className="animate-spin mr-2" />
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">

        {/* ====================================
            SIDEBAR
        ==================================== */}
        <aside className="w-64 min-h-screen bg-slate-900 text-white p-5 hidden md:block">
          <h1 className="text-3xl font-bold mb-10">
            ResolveHub
          </h1>

          <div className="space-y-3">

            <div className="flex items-center gap-3 bg-slate-800 px-4 py-3 rounded-xl">
              <LayoutDashboard size={18} />
              Dashboard
            </div>

            <button
              onClick={() => navigate("/admin/users")}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 flex gap-3 items-center"
            >
              <Users size={18} />
              Users
            </button>

            <button
              onClick={() => navigate("/admin/agents")}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 flex gap-3 items-center"
            >
              <UserCog size={18} />
              Agents
            </button>

            <button
              onClick={() => navigate("/admin/complaints")}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 flex gap-3 items-center"
            >
              <FileText size={18} />
              Complaints
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-600 flex gap-3 items-center"
            >
              <LogOut size={18} />
              Logout
            </button>

          </div>
        </aside>

        {/* ====================================
            MAIN
        ==================================== */}
        <main className="flex-1 p-6">

          {/* HEADER */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex justify-between items-center">

            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                Welcome Admin, {user?.name}
              </h2>

              <p className="text-gray-500 mt-1">
                Manage complaints, assignments and users.
              </p>
            </div>

            <div className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium flex gap-2 items-center">
              <ShieldCheck size={16} />
              Administrator
            </div>
          </div>

          {/* ====================================
              STATS
          ==================================== */}
         <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-5 mb-6">

  <div
    onClick={() => setActiveFilter("total")}
    className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition"
  >
    <p className="text-gray-500">Total</p>
    <h3 className="text-3xl font-bold mt-2">
      {stats.total}
    </h3>
  </div>

  <div
    onClick={() => setActiveFilter("open")}
    className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition"
  >
    <p className="text-gray-500">Open</p>
    <h3 className="text-3xl font-bold mt-2 text-orange-500">
      {stats.open}
    </h3>
  </div>

  <div
    onClick={() => setActiveFilter("in_progress")}
    className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition"
  >
    <p className="text-gray-500">In Progress</p>
    <h3 className="text-3xl font-bold mt-2 text-purple-500">
      {stats.inProgress}
    </h3>
  </div>

  <div
    onClick={() => setActiveFilter("resolved")}
    className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition"
  >
    <p className="text-gray-500">Resolved</p>
    <h3 className="text-3xl font-bold mt-2 text-green-500">
      {stats.resolved}
    </h3>
  </div>

  <div
    onClick={() => setActiveFilter("overdue")}
    className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition"
  >
    <p className="text-gray-500">Overdue</p>
    <h3 className="text-3xl font-bold mt-2 text-red-500">
      {stats.overdue}
    </h3>
  </div>

</div>

          {/* ====================================
              RECENT COMPLAINTS
          ==================================== */}
          <div className="bg-white rounded-2xl shadow-sm p-6">

            <div className="flex justify-between items-center mb-5">
              <h3 className="text-2xl font-semibold text-slate-800">
                All Complaints
              </h3>

              <button
                onClick={() => navigate("/admin/complaints")}
                className="text-blue-600 text-sm font-medium"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">

              {filteredComplaints.slice(0, 6).map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/complaint/${item._id}`)}
                  className="border rounded-xl p-4 hover:shadow-md transition cursor-pointer"
                >

                  <div className="flex justify-between gap-4">

                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {item.title}
                      </h4>

                      <p className="text-sm text-gray-500 mt-1">
                        {item.createdBy?.name}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs h-fit ${statusColor(
                        item.status
                      )}`}
                    >
                      {formatStatus(item.status)}
                    </span>

                  </div>

                </div>
              ))}

            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;