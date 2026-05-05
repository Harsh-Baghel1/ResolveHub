// frontend/src/pages/admin/ManageComplaints.jsx

import {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

import {
  Search,
  Loader2,
  Eye,
  RefreshCcw,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";

/* =========================
   STATUS & PRIORITY COLORS
========================= */
const statusColor = {
  open: "bg-yellow-100 text-yellow-700",
  pending: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-700",
};

const priorityColor = {
  high: "bg-red-100 text-red-700",
  medium: "bg-orange-100 text-orange-700",
  low: "bg-green-100 text-green-700",
};

const ManageComplaints = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("all");

  /* =========================
     DEBOUNCE SEARCH
  ========================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  /* =========================
     FETCH DATA (FIXED)
  ========================= */
  const fetchData = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);

      const res = await axiosInstance.get("/admin/complaints");

      console.log("COMPLAINTS:", res.data);

      setComplaints(
        Array.isArray(res.data.data)
          ? res.data.data
          : []
      );

    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =========================
     FILTER + SEARCH
  ========================= */
  const filtered = useMemo(() => {
    let data = [...complaints];

    // FILTER
    if (filter !== "all") {
      data = data.filter((item) => {
        const status = item.status?.toLowerCase();
        const priority = item.priority?.toLowerCase();

        if (filter === "unassigned") return !item.assignedTo;
        if (filter === "overdue") return item.slaStatus === "overdue";
        if (["high", "medium", "low"].includes(filter)) return priority === filter;

        return status === filter;
      });
    }

    // SEARCH
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();

      data = data.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.ticketId?.toLowerCase().includes(q) ||
          item.createdBy?.name?.toLowerCase().includes(q)
      );
    }

    return data;
  }, [complaints, filter, debouncedSearch]);

  /* =========================
     LOADING SKELETON
  ========================= */
  if (loading) {
    return (
      <div className="p-10 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-gray-200 animate-pulse rounded-xl"
          />
        ))}
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              Manage Complaints
            </h1>
            <p className="text-gray-500">
              {filtered.length} total records
            </p>
          </div>

          <button
            onClick={() => fetchData(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white p-4 rounded-3xl mb-6 flex gap-4">

          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search complaints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-xl px-4"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="overdue">Overdue</option>
            <option value="unassigned">Unassigned</option>
            <option value="high">High Priority</option>
          </select>

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">

          {filtered.length === 0 ? (
            <div className="p-16 text-center text-gray-500">
              <ClipboardList className="mx-auto mb-3" />
              No complaints found
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center p-4 border-b hover:bg-gray-50 transition"
              >
                <div>
                  <h3 className="font-semibold">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {item.createdBy?.name}
                  </p>

                  {item.slaStatus === "overdue" && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertTriangle size={12} />
                      SLA Overdue
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">

                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      statusColor[item.status] || ""
                    }`}
                  >
                    {item.status}
                  </span>

                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      priorityColor[item.priority] || ""
                    }`}
                  >
                    {item.priority}
                  </span>

                  <button
                    onClick={() =>
                      navigate(`/complaint/${item._id}`)
                    }
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye size={16} />
                  </button>

                </div>
              </div>
            ))
          )}

        </div>

      </div>
    </div>
  );
};

export default ManageComplaints;