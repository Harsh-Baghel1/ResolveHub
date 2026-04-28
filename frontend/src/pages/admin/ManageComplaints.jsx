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
  Search,
  Filter,
  Loader2,
  Eye,
  UserPlus,
  RefreshCcw,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";

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

  const [loading, setLoading] =
    useState(true);

  const [
    complaints,
    setComplaints,
  ] = useState([]);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  // =====================================
  // LOAD DATA (UPDATED FIX)
  // =====================================
  const fetchData =
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
              "/admin/complaints"
            );

          setComplaints(
            res.data
              .complaints ||
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
    fetchData(false);
  }, [fetchData]);

  // =====================================
  // FILTER DATA
  // =====================================
  const filtered =
    useMemo(() => {
      let data = [
        ...complaints,
      ];

      if (
        filter !== "all"
      ) {
        if (
          filter ===
          "unassigned"
        ) {
          data =
            data.filter(
              (
                item
              ) =>
                !item.assignedTo
            );
        } else if (
          filter ===
          "overdue"
        ) {
          data =
            data.filter(
              (
                item
              ) =>
                item.slaStatus ===
                "overdue"
            );
        } else if (
          [
            "high",
            "medium",
            "low",
          ].includes(
            filter
          )
        ) {
          data =
            data.filter(
              (
                item
              ) =>
                item.priority ===
                filter
            );
        } else {
          data =
            data.filter(
              (
                item
              ) =>
                item.status ===
                filter
            );
        }
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
              item.title
                ?.toLowerCase()
                .includes(
                  q
                ) ||
              item.ticketId
                ?.toLowerCase()
                .includes(
                  q
                ) ||
              item.createdBy?.name
                ?.toLowerCase()
                .includes(
                  q
                )
          );
      }

      return data;
    }, [
      complaints,
      search,
      filter,
    ]);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>
              <p className="text-sm text-slate-500">
                Admin Operations
              </p>

              <h1 className="text-3xl font-bold text-slate-800 mt-1">
                Manage Complaints
              </h1>

              <p className="text-slate-500 mt-2">
                Monitor all tickets, assign agents,
                manage priorities, and control workflow.
              </p>
            </div>

            <button
              onClick={() =>
                fetchData(true)
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
                placeholder="Search ticket, title or user..."
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
                  All Complaints
                </option>
                <option value="unassigned">
                  Unassigned
                </option>
                <option value="open">
                  Open
                </option>
                <option value="in_progress">
                  In Progress
                </option>
                <option value="resolved">
                  Resolved
                </option>
                <option value="high">
                  High Priority
                </option>
                <option value="overdue">
                  Overdue
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
                <ClipboardList className="text-slate-500" />
              </div>

              <h3 className="text-xl font-bold text-slate-800">
                No Complaints Found
              </h3>

              <p className="text-slate-500 mt-2">
                Try adjusting filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">

                <thead className="bg-slate-50 border-b text-left text-sm text-slate-600">
                  <tr>
                    <th className="px-6 py-4">
                      Ticket
                    </th>
                    <th className="px-6 py-4">
                      Title
                    </th>
                    <th className="px-6 py-4">
                      User
                    </th>
                    <th className="px-6 py-4">
                      Priority
                    </th>
                    <th className="px-6 py-4">
                      Status
                    </th>
                    <th className="px-6 py-4">
                      Agent
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
                        <td className="px-6 py-5 font-semibold text-slate-700">
                          {item.ticketId ||
                            "N/A"}
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-medium text-slate-800">
                            {
                              item.title
                            }
                          </p>

                          {item.slaStatus ===
                            "overdue" && (
                            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                              <AlertTriangle size={12} />
                              SLA Overdue
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-700">
                          {item.createdBy
                            ?.name ||
                            "N/A"}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              priorityColor[
                                item.priority
                              ] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {
                              item.priority
                            }
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColor[
                                item.status
                              ] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {item.status?.replace(
                              "_",
                              " "
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm">
                          {item.assignedTo
                            ?.name ? (
                            <span className="text-slate-700 font-medium">
                              {
                                item
                                  .assignedTo
                                  .name
                              }
                            </span>
                          ) : (
                            <span className="text-red-600 font-medium">
                              Unassigned
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2 flex-wrap">

                            <button
                              onClick={() =>
                                navigate(
                                  `/complaint/${item._id}`
                                )
                              }
                              className="px-3 py-2 rounded-xl border hover:bg-slate-100 flex items-center gap-2 text-sm"
                            >
                              <Eye size={15} />
                              View
                            </button>

                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/assign/${item._id}`
                                )
                              }
                              className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 text-sm"
                            >
                              <UserPlus size={15} />
                              {item.assignedTo
                                ? "Reassign"
                                : "Assign"}
                            </button>

                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/chat/${item._id}`
                                )
                              }
                              className="px-3 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 flex items-center gap-2 text-sm"
                            >
                              <MessageSquare size={15} />
                              Chat
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
                Admin Control Active
              </h3>

              <p className="text-blue-100 mt-1">
                Keep tickets assigned, resolved, and SLA compliant.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm bg-white/15 px-4 py-3 rounded-2xl">
              <ShieldCheck size={16} />
              Complaint Monitoring Enabled
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageComplaints;