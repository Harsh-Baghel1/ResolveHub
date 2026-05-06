import {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

import {
  UserCog,
  Search,
  Filter,
  Loader2,
  RefreshCcw,
  Eye,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Briefcase,
  Star,
} from "lucide-react";

// ✅ FINAL STATUS STYLE
const statusStyle = {
  active: "bg-green-100 text-green-700",
  suspended: "bg-red-100 text-red-700",
};

const ManageAgents = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // =====================================
  // FETCH AGENTS
  // =====================================
  const fetchAgents = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);

      const res = await axiosInstance.get("/admin/agents");

      setAgents(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // =====================================
  // FILTER LOGIC
  // =====================================
  const filtered = useMemo(() => {
    let data = [...agents];

    if (filter !== "all") {
      data = data.filter((item) => item.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      data = data.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.email?.toLowerCase().includes(q)
      );
    }

    return data;
  }, [agents, search, filter]);

  // =====================================
  // TOGGLE STATUS (FIXED)
  // =====================================
  const toggleStatus = async (id, current) => {
    try {
      await axiosInstance.put("/admin/users/status", {
        userId: id,
        status: current === "suspended" ? "active" : "suspended",
      });

      fetchAgents(true);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-3xl p-7 mb-6 border shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500">Admin Workforce</p>
            <h1 className="text-3xl font-bold text-slate-800">
              Manage Agents
            </h1>
            <p className="text-slate-500 mt-1">
              Monitor agent workload and control access.
            </p>
          </div>

          <button
            onClick={() => fetchAgents(true)}
            className="px-5 py-3 bg-blue-600 text-white rounded-2xl flex items-center gap-2 hover:bg-blue-700"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        {/* FILTER */}
        <div className="bg-white rounded-3xl p-5 mb-6 border shadow-sm grid lg:grid-cols-3 gap-4">

          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-4 top-4 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 border rounded-2xl pl-11 pr-4"
            />
          </div>

          {/* FILTER */}
          <div className="relative">
            <Filter className="absolute left-4 top-4 text-slate-400" size={18} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full h-12 border rounded-2xl pl-11 pr-4"
            >
              <option value="all">All Agents</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="h-12 flex items-center px-5 bg-slate-50 rounded-2xl text-slate-600">
            Showing {filtered.length} records
          </div>

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">

          {loading ? (
            <div className="p-16 flex justify-center">
              <Loader2 className="animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <UserCog className="mx-auto mb-4 text-slate-400" size={40} />
              <h3 className="text-xl font-bold">No Agents Found</h3>
              <p className="text-slate-500">Try adjusting filters</p>
            </div>
          ) : (
            <table className="w-full">

              <thead className="bg-slate-50 text-left text-sm text-slate-600">
                <tr>
                  <th className="px-6 py-4">Agent</th>
                  <th className="px-6 py-4">Active Tickets</th>
                  <th className="px-6 py-4">Resolved</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id} className="border-b hover:bg-slate-50">

                    <td className="px-6 py-5">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.email}</p>
                    </td>

                    <td className="px-6 py-5">
                      <Briefcase size={14} className="inline mr-2" />
                      {item.activeTickets || 0}
                    </td>

                    <td className="px-6 py-5 text-green-700">
                      <Star size={14} className="inline mr-2" />
                      {item.resolvedTickets || 0}
                    </td>

                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs ${statusStyle[item.status || "active"]}`}>
                        {item.status || "active"}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center gap-2">

                        {/* VIEW */}
                        <button
                          onClick={() => navigate(`/admin/agent/${item._id}`)}
                          className="px-3 py-2 border rounded-xl hover:bg-slate-100 flex items-center gap-2"
                        >
                          <Eye size={14} />
                          View
                        </button>

                        {/* SUSPEND / ACTIVATE */}
                        <button
                          onClick={() => toggleStatus(item._id, item.status)}
                          className={`px-3 py-2 rounded-xl text-white flex items-center gap-2 ${
                            item.status === "suspended"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >
                          {item.status === "suspended" ? (
                            <>
                              <CheckCircle2 size={14} />
                              Activate
                            </>
                          ) : (
                            <>
                              <Ban size={14} />
                              Suspend
                            </>
                          )}
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          )}

        </div>

      </div>
    </div>
  );
};

export default ManageAgents;