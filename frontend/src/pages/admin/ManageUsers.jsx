// frontend/src/pages/admin/ManageUsers.jsx

import {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axiosInstance from "../../api/axiosInstance";

import {
  Users,
  Search,
  Filter,
  Loader2,
  ShieldCheck,
  UserCog,
  Crown,
  RefreshCcw,
  Eye,
  Ban,
  CheckCircle2,
} from "lucide-react";

const roleStyle = {
  user: "bg-blue-100 text-blue-700",
  agent:
    "bg-green-100 text-green-700",
  admin:
    "bg-purple-100 text-purple-700",
};

const statusStyle = {
  active:
    "bg-green-100 text-green-700",
  suspended:
    "bg-red-100 text-red-700",
};

const ManageUsers = () => {
  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [users, setUsers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  // =====================================
  // LOAD USERS
  // =====================================
  const fetchUsers =
    useCallback(
      async (
        showLoader = false
      ) => {
        try {
          if (
            showLoader
          ) {
            setLoading(
              true
            );
          }

          const res =
            await axiosInstance.get(
              "/admin/users"
            );

          setUsers(
            res.data.users ||
              []
          );
        } catch (
          error
        ) {
          console.log(
            error
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );

  useEffect(() => {
    fetchUsers(false);
  }, [fetchUsers]);

  // =====================================
  // FILTERED USERS
  // =====================================
  const filtered =
    useMemo(() => {
      let data = [
        ...users,
      ];

      if (
        filter !== "all"
      ) {
        data =
          data.filter(
            (
              item
            ) =>
              item.role ===
                filter ||
              item.status ===
                filter
          );
      }

      if (
        search.trim()
      ) {
        const q =
          search.toLowerCase();

        data =
          data.filter(
            (
              item
            ) =>
              item.name
                ?.toLowerCase()
                .includes(
                  q
                ) ||
              item.email
                ?.toLowerCase()
                .includes(
                  q
                )
          );
      }

      return data;
    }, [
      users,
      search,
      filter,
    ]);

  // =====================================
  // CHANGE ROLE
  // =====================================
  const changeRole =
    async (
      userId,
      role
    ) => {
      try {
        await axiosInstance.put(
          "/admin/users/role",
          {
            userId,
            role,
          }
        );

        fetchUsers(
          true
        );
      } catch (
        error
      ) {
        console.log(
          error
        );
      }
    };

  // =====================================
  // TOGGLE STATUS
  // =====================================
  const toggleStatus =
    async (
      userId,
      current
    ) => {
      try {
        await axiosInstance.put(
          "/admin/users/status",
          {
            userId,
            status:
              current ===
              "active"
                ? "suspended"
                : "active",
          }
        );

        fetchUsers(
          true
        );
      } catch (
        error
      ) {
        console.log(
          error
        );
      }
    };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>
              <p className="text-sm text-slate-500">
                Admin Control
              </p>

              <h1 className="text-3xl font-bold text-slate-800 mt-1">
                Manage Users
              </h1>

              <p className="text-slate-500 mt-2">
                Search users, change roles, and manage access across ResolveHub.
              </p>
            </div>

            <button
              onClick={() =>
                fetchUsers(
                  true
                )
              }
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 h-fit"
            >
              <RefreshCcw
                size={17}
              />
              Refresh
            </button>

          </div>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 mb-6">
          <div className="grid lg:grid-cols-3 gap-4">

            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-4 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(
                  e
                ) =>
                  setSearch(
                    e.target
                      .value
                  )
                }
                className="w-full h-12 border rounded-2xl pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Filter
                size={18}
                className="absolute left-4 top-4 text-slate-400"
              />

              <select
                value={filter}
                onChange={(
                  e
                ) =>
                  setFilter(
                    e.target
                      .value
                  )
                }
                className="w-full h-12 border rounded-2xl pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="all">
                  All Users
                </option>
                <option value="user">
                  Users
                </option>
                <option value="agent">
                  Agents
                </option>
                <option value="admin">
                  Admins
                </option>
                <option value="active">
                  Active
                </option>
                <option value="suspended">
                  Suspended
                </option>
              </select>
            </div>

            <div className="h-12 rounded-2xl bg-slate-50 flex items-center px-5 text-slate-600 font-medium">
              Showing{" "}
              {
                filtered.length
              }{" "}
              records
            </div>

          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          {loading ? (
            <div className="p-16 flex justify-center text-slate-500">
              <Loader2 className="animate-spin" />
            </div>
          ) : filtered.length ===
            0 ? (
            <div className="p-16 text-center">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Users className="text-slate-500" />
              </div>

              <h3 className="text-xl font-bold text-slate-800">
                No Users Found
              </h3>

              <p className="text-slate-500 mt-2">
                Try changing search or filters.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50 border-b text-left text-sm text-slate-600">
                  <tr>
                    <th className="px-6 py-4">
                      Name
                    </th>
                    <th className="px-6 py-4">
                      Email
                    </th>
                    <th className="px-6 py-4">
                      Role
                    </th>
                    <th className="px-6 py-4">
                      Status
                    </th>
                    <th className="px-6 py-4">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(
                    (
                      item
                    ) => (
                      <tr
                        key={
                          item._id
                        }
                        className="border-b last:border-0 hover:bg-slate-50 transition"
                      >

                        <td className="px-6 py-5 font-medium text-slate-800">
                          {
                            item.name
                          }
                        </td>

                        <td className="px-6 py-5 text-slate-600 text-sm">
                          {
                            item.email
                          }
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              roleStyle[
                                item.role
                              ]
                            }`}
                          >
                            {
                              item.role
                            }
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              statusStyle[
                                item.status ||
                                  "active"
                              ]
                            }`}
                          >
                            {item.status ||
                              "active"}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {item.createdAt
                            ? new Date(
                                item.createdAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>

                        <td className="px-6 py-5">

                          <div className="flex items-center justify-center gap-2 flex-wrap">

                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/user/${item._id}`
                                )
                              }
                              className="px-3 py-2 rounded-xl border hover:bg-slate-100 text-sm flex items-center gap-2"
                            >
                              <Eye size={15} />
                              View
                            </button>

                            {item.role !==
                              "agent" && (
                              <button
                                onClick={() =>
                                  changeRole(
                                    item._id,
                                    "agent"
                                  )
                                }
                                className="px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm flex items-center gap-2"
                              >
                                <UserCog size={15} />
                                Make Agent
                              </button>
                            )}

                            {item.role !==
                              "admin" && (
                              <button
                                onClick={() =>
                                  changeRole(
                                    item._id,
                                    "admin"
                                  )
                                }
                                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm flex items-center gap-2"
                              >
                                <Crown size={15} />
                                Make Admin
                              </button>
                            )}

                            <button
                              onClick={() =>
                                toggleStatus(
                                  item._id,
                                  item.status ||
                                    "active"
                                )
                              }
                              className={`px-3 py-2 rounded-xl text-sm flex items-center gap-2 text-white ${
                                item.status ===
                                "suspended"
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "bg-red-600 hover:bg-red-700"
                              }`}
                            >
                              {item.status ===
                              "suspended" ? (
                                <>
                                  <CheckCircle2 size={15} />
                                  Activate
                                </>
                              ) : (
                                <>
                                  <Ban size={15} />
                                  Suspend
                                </>
                              )}
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}
                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="mt-6 bg-blue-600 rounded-3xl p-6 text-white shadow-sm">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div>
              <h3 className="text-xl font-bold">
                User Access Control Active
              </h3>

              <p className="text-blue-100 mt-1">
                Promote users, assign staff, and secure platform access.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm bg-white/15 px-4 py-3 rounded-2xl">
              <ShieldCheck size={16} />
              Security Monitoring Enabled
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ManageUsers;