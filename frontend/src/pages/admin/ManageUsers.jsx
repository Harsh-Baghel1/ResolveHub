import {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useSelector } from "react-redux";

import {
  Users,
  Search,
  Loader2,
  RefreshCcw,
} from "lucide-react";

const roleStyle = {
  user: "bg-blue-100 text-blue-700",
  agent: "bg-green-100 text-green-700",
  admin: "bg-purple-100 text-purple-700",
};

const statusStyle = {
  active: "bg-green-100 text-green-700",
  suspended: "bg-red-100 text-red-700",
};

const ManageUsers = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const [confirmData, setConfirmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState(null);
  
  // ================= FETCH USERS =================
  const fetchUsers = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);

      const res = await axiosInstance.get("/admin/users");

      // FIXED API MAPPING
      setUsers(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(false);
  }, [fetchUsers]);

  // ================= CLOSE MENU ON OUTSIDE CLICK =================
  useEffect(() => {
    const handleClick = () => setOpenMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // ================= STATS =================
  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(
        (u) => (u.status || "active") === "active"
      ).length,
      suspended: users.filter(
        (u) => u.status === "suspended"
      ).length,
      admins: users.filter(
        (u) => u.role === "admin"
      ).length,
      agents: users.filter(
        (u) => u.role === "agent"
      ).length,
    };
  }, [users]);

 // ================= FILTER =================
const filtered = useMemo(() => {
  let data = [...users];

  if (filter !== "all") {
    data = data.filter((item) => {
      const status = item.status || "active"; // 🔥 FIX

      return (
        item.role === filter ||
        status === filter
      );
    });
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
}, [users, search, filter]);

  // ================= ACTIONS =================
 const changeRole = async (userId, role) => {
  try {
    // 🔥 PROTECTION: prevent self role downgrade
    if (userId === currentUser?._id && role !== "admin") {
      alert("You cannot remove your own admin access");
      return;
    }

    await axiosInstance.patch("/admin/users/role", {
      userId,
      role,
    });

    fetchUsers(true);

  } catch (err) {
    console.log(err);
  }
};

  const toggleStatus = async (userId, current) => {
    await axiosInstance.put("/admin/users/status", {
      userId,
      status:
        current === "active"
          ? "suspended"
          : "active",
    });
    fetchUsers(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-3xl border p-7 mb-6 flex justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Admin Control
            </p>
            <h1 className="text-3xl font-bold">
              Manage Users
            </h1>
          </div>

          <button
            onClick={() => fetchUsers(true)}
            className="px-5 py-3 bg-blue-600 text-white rounded-2xl flex gap-2"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <StatCard title="Total" value={stats.total} />
          <StatCard title="Active" value={stats.active} color="green" />
          <StatCard title="Suspended" value={stats.suspended} color="red" />
          <StatCard title="Admins" value={stats.admins} color="purple" />
          <StatCard title="Agents" value={stats.agents} color="blue" />
        </div>

        {/* FILTER */}
        <div className="bg-white rounded-3xl border p-5 mb-6 grid grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 border rounded-2xl pl-11"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-12 border rounded-2xl px-4"
          >
            <option value="all">All</option>
            <option value="user">Users</option>
            <option value="agent">Agents</option>
            <option value="admin">Admins</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <div className="flex items-center">
            Showing {filtered.length} users
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl border shadow-sm relative">

          {loading ? (
            <div className="p-16 flex justify-center">
              <Loader2 className="animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id} className="border-b hover:bg-slate-50">

                    <td className="px-6 py-4 font-medium">
                      {item.name}
                    </td>

                    <td>{item.email}</td>

                    <td className="text-center">
                      <span className={`px-2 py-1 rounded ${roleStyle[item.role]}`}>
                        {item.role}
                      </span>
                    </td>

                    <td className="text-center">
                      <span className={`px-2 py-1 rounded ${statusStyle[item.status || "active"]}`}>
                        {item.status || "active"}
                      </span>
                    </td>

                    <td className="text-center">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    {/* ACTION MENU */}
                    <td className="px-6 py-4 text-center relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(openMenu === item._id ? null : item._id);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-100 text-lg"
                      >
                        ⋮
                      </button>

                     {openMenu === item._id && (
  <div
    onClick={(e) => e.stopPropagation()}
    className="absolute right-6 top-12 w-52 bg-white border rounded-xl shadow-xl z-50"
  >

    {/* VIEW PROFILE */}
    <MenuItem
      label="View Profile"
      onClick={() => {
        navigate(`/admin/user/${item._id}`);
        setOpenMenu(null);
      }}
    />

    {/* ROLE */}
    <div className="px-3 py-2 border-t">
      <p className="text-xs text-slate-500 mb-1">Change Role</p>

      <select
        value={item.role}
        disabled={item._id === currentUser?._id}
        onChange={(e) => {
          if (item._id === currentUser?._id) return;

          setConfirmData({
            userId: item._id,
            currentRole: item.role,
            newRole: e.target.value,
          });
          setOpenMenu(null);
        }}
        className={`w-full px-2 py-1 text-sm border rounded ${
          item._id === currentUser?._id
            ? "bg-gray-100 cursor-not-allowed"
            : ""
        }`}
      >
        <option value="user">User</option>
        <option value="agent">Agent</option>
        <option value="admin">Admin</option>
      </select>
    </div>

    {/* 🔥 AGENT SETTINGS */}
    {item.role === "agent" && (
      <div className="px-3 py-2 border-t">

        <p className="text-xs text-slate-500 mb-1">Skills</p>

        <input
          type="text"
          placeholder="e.g. network, hardware"
          defaultValue={item.skills?.join(", ")}
         onBlur={async (e) => {
  try {
    const newSkills = e.target.value
      .split(",")
      .map((s) => s.trim());

    const oldSkills = item.skills || [];

    // prevent unnecessary API call
    if (JSON.stringify(newSkills) === JSON.stringify(oldSkills)) return;

    await axiosInstance.patch(`/admin/agents/${item._id}`, {
      skills: newSkills,
    });

    fetchUsers(true);

  } catch (err) {
    console.log("Skill update failed:", err);
  }
}}
          className="w-full px-2 py-1 text-sm border rounded"
        />

        <label className="flex items-center mt-2 gap-2 text-sm">
          <input
            type="checkbox"
            checked={item.isAvailable ?? true}
           onChange={async (e) => {
  try {
    await axiosInstance.patch(`/admin/agents/${item._id}`, {
      isAvailable: e.target.checked,
    });

    fetchUsers(true);

  } catch (err) {
    console.log("Availability update failed:", err);
  }
}}
          />
          Available
        </label>

      </div>
    )}

    {/* STATUS */}
    <MenuItem
      label={item.status === "suspended" ? "Activate" : "Suspend"}
      onClick={() => {
        toggleStatus(item._id, item.status || "active");
        setOpenMenu(null);
      }}
    />

  </div>
)}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
{/* 🔥 ADD MODAL HERE (NOT INSIDE STATCARD) */}
{confirmData && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">

      <h2 className="text-lg font-semibold mb-3">
        Confirm Role Change
      </h2>

      <p className="text-sm text-slate-600 mb-6">
        Change role from{" "}
        <span className="font-medium capitalize">
          {confirmData.currentRole}
        </span>{" "}
        →{" "}
        <span className="font-medium capitalize">
          {confirmData.newRole}
        </span>
        ?
      </p>

      <div className="flex justify-end gap-3">

        <button
          onClick={() => setConfirmData(null)}
          className="px-4 py-2 rounded-lg border"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            changeRole(confirmData.userId, confirmData.newRole);
            setConfirmData(null);
          }}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white"
        >
          Confirm
        </button>

      </div>

    </div>
  </div>
)}
        
      </div>
    </div>
  );
};

// COMPONENTS
const StatCard = ({ title, value, color = "slate" }) => {
  const colors = {
    slate: "bg-white",
    green: "bg-green-50",
    red: "bg-red-50",
    purple: "bg-purple-50",
    blue: "bg-blue-50",
  };

  return (
    <div className={`${colors[color]} p-5 rounded-2xl border shadow-sm`}>
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>

    </div>
  );
};



const MenuItem = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100"
  >
    {label}
  </button>
);

const EmptyState = () => (
  <div className="p-16 text-center">
    <Users className="mx-auto mb-4" />
    <p>No Users Found</p>
  </div>
);



export default ManageUsers;