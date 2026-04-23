// src/components/complaints/ComplaintsList.jsx

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchComplaints } from "../../features/complaint/complaintSlice";
import {
  Search,
  Eye,
  CalendarDays,
  UserCircle,
  Loader2,
} from "lucide-react";

const ComplaintsList = ({ type }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { complaints, loading } = useSelector(
    (state) => state.complaint
  );

  const [search, setSearch] = useState("");

  // ===============================
  // FETCH DATA
  // ===============================
  useEffect(() => {
    dispatch(fetchComplaints(type));
  }, [dispatch, type]);

  // ===============================
  // FORMAT STATUS
  // ===============================
  const formatStatus = (status) => {
    return status
      ?.replace("_", " ")
      ?.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // ===============================
  // STATUS COLOR
  // ===============================
  const statusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-orange-100 text-orange-700";
      case "in_progress":
        return "bg-purple-100 text-purple-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      case "closed":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  // ===============================
  // PRIORITY COLOR
  // ===============================
  const priorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ===============================
  // FILTERED DATA (NO setState IN useEffect)
  // ===============================
  const filteredData = useMemo(() => {
    let data = [...complaints];

    const query = new URLSearchParams(location.search);
    const status = query.get("status");

    if (status && status !== "all") {
      data = data.filter((item) => item.status === status);
    }

    if (search.trim()) {
      data = data.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    return data;
  }, [complaints, location.search, search]);

  // ===============================
  // LOADING
  // ===============================
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" size={18} />
        Loading complaints...
      </div>
    );
  }

  // ===============================
  // EMPTY STATE
  // ===============================
  if (filteredData.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 border rounded-xl">
        No complaints found
      </div>
    );
  }

  return (
    <div>
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-5">

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search
            size={16}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search complaint..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <p className="text-sm text-gray-500">
          Total: {filteredData.length}
        </p>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {filteredData.map((c) => (
          <div
            key={c._id}
            onClick={() => navigate(`/complaint/${c._id}`)}
            className="p-5 border rounded-2xl bg-white hover:shadow-md transition cursor-pointer"
          >
            <div className="flex flex-col md:flex-row md:justify-between gap-4">

              {/* LEFT */}
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-slate-800">
                  {c.title}
                </h4>

                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {c.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">

                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs">
                    {c.category}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs ${priorityColor(
                      c.priority
                    )}`}
                  >
                    {c.priority}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs ${statusColor(
                      c.status
                    )}`}
                  >
                    {formatStatus(c.status)}
                  </span>

                </div>
              </div>

              {/* RIGHT */}
              <div className="min-w-[180px] text-sm text-gray-500 space-y-2">

                <div className="flex items-center gap-2">
                  <CalendarDays size={15} />
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-2">
                  <UserCircle size={15} />
                  {c.assignedTo?.name || "Unassigned"}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/complaint/${c._id}`);
                  }}
                  className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
                >
                  <Eye size={16} />
                  View Details
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplaintsList;