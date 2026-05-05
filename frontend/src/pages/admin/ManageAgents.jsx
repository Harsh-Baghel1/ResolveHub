// frontend/src/pages/admin/ManageAgents.jsx

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
  UserCog,
  Search,
  Filter,
  Loader2,
  RefreshCcw,
  Eye,
  ShieldCheck,
  Crown,
  Ban,
  CheckCircle2,
  Briefcase,
  Clock3,
  Star,
} from "lucide-react";

const statusStyle = {
  available:
    "bg-green-100 text-green-700",
  busy:
    "bg-yellow-100 text-yellow-700",
  offline:
    "bg-slate-100 text-slate-700",
  suspended:
    "bg-red-100 text-red-700",
};

const ManageAgents = () => {
  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [agents, setAgents] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  // =====================================
  // LOAD AGENTS
  // =====================================
  const fetchAgents =
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
              "/admin/agents"
            );

          setAgents(res.data.data || []);
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
    fetchAgents(false);
  }, [fetchAgents]);

  // =====================================
  // FILTER DATA
  // =====================================
  const filtered =
    useMemo(() => {
      let data = [
        ...agents,
      ];

      if (
        filter !== "all"
      ) {
        data =
          data.filter(
            (
              item
            ) =>
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
                ) ||
              item.department
                ?.toLowerCase()
                .includes(
                  q
                )
          );
      }

      return data;
    }, [
      agents,
      search,
      filter,
    ]);

  // =====================================
  // TOGGLE STATUS
  // =====================================
  const toggleStatus =
    async (
      id,
      current
    ) => {
      try {
        await axiosInstance.put(
          "/admin/agents/status",
          {
            agentId:
              id,
            status:
              current ===
              "suspended"
                ? "available"
                : "suspended",
          }
        );

        fetchAgents(
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
  // PROMOTE
  // =====================================
  const makeAdmin =
    async (
      id
    ) => {
      try {
        await axiosInstance.put(
          "/admin/users/role",
          {
            userId:
              id,
            role:
              "admin",
          }
        );

        fetchAgents(
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
                Admin Workforce
              </p>

              <h1 className="text-3xl font-bold text-slate-800 mt-1">
                Manage Agents
              </h1>

              <p className="text-slate-500 mt-2">
                Monitor agent workload, performance, and availability.
              </p>
            </div>

            <button
              onClick={() =>
                fetchAgents(
                  true
                )
              }
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 h-fit"
            >
              <RefreshCcw size={17} />
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
                placeholder="Search name, email or department..."
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
                  All Agents
                </option>
                <option value="available">
                  Available
                </option>
                <option value="busy">
                  Busy
                </option>
                <option value="offline">
                  Offline
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
                <UserCog className="text-slate-500" />
              </div>

              <h3 className="text-xl font-bold text-slate-800">
                No Agents Found
              </h3>

              <p className="text-slate-500 mt-2">
                Try adjusting filters or search.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50 border-b text-left text-sm text-slate-600">
                  <tr>
                    <th className="px-6 py-4">
                      Agent
                    </th>
                    <th className="px-6 py-4">
                      Department
                    </th>
                    <th className="px-6 py-4">
                      Active Tickets
                    </th>
                    <th className="px-6 py-4">
                      Resolved
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

                        <td className="px-6 py-5">
                          <div>
                            <p className="font-medium text-slate-800">
                              {
                                item.name
                              }
                            </p>

                            <p className="text-sm text-slate-500">
                              {
                                item.email
                              }
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-slate-700">
                          {item.department ||
                            "Support"}
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-2 text-slate-700">
                            <Briefcase size={15} />
                            {item.activeTickets ||
                              0}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-2 text-green-700">
                            <Star size={15} />
                            {item.resolvedTickets ||
                              0}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              statusStyle[
                                item.status ||
                                  "available"
                              ]
                            }`}
                          >
                            {item.status ||
                              "available"}
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
                                  `/admin/agent/${item._id}`
                                )
                              }
                              className="px-3 py-2 rounded-xl border hover:bg-slate-100 text-sm flex items-center gap-2"
                            >
                              <Eye size={15} />
                              View
                            </button>

                            <button
                              onClick={() =>
                                makeAdmin(
                                  item._id
                                )
                              }
                              className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm flex items-center gap-2"
                            >
                              <Crown size={15} />
                              Make Admin
                            </button>

                            <button
                              onClick={() =>
                                toggleStatus(
                                  item._id,
                                  item.status ||
                                    "available"
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
                Agent Workforce Active
              </h3>

              <p className="text-blue-100 mt-1">
                Optimize staffing and improve complaint resolution speed.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm bg-white/15 px-4 py-3 rounded-2xl">
              <ShieldCheck size={16} />
              Workforce Monitoring Enabled
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ManageAgents;