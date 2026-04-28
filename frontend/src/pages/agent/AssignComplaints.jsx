// frontend/src/pages/agent/AssignedComplaints.jsx

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useNavigate,
} from "react-router-dom";

import AgentLayout from "../../layouts/AgentLayout";

import {
  fetchComplaints,
} from "../../features/complaint/complaintSlice";

import {
  Search,
  Loader2,
  Eye,
  MessageCircle,
  CheckCircle2,
  Filter,
  ClipboardList,
} from "lucide-react";

const statusMap = {
  open:
    "bg-yellow-100 text-yellow-700",
  pending:
    "bg-yellow-100 text-yellow-700",
  in_progress:
    "bg-blue-100 text-blue-700",
  resolved:
    "bg-green-100 text-green-700",
  closed:
    "bg-slate-100 text-slate-700",
};

const priorityMap = {
  high:
    "bg-red-100 text-red-700",
  medium:
    "bg-orange-100 text-orange-700",
  low:
    "bg-green-100 text-green-700",
};

const AssignedComplaints = () => {
  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  const {
    complaints = [],
    loading = false,
  } = useSelector(
    (state) =>
      state.complaint ||
      {}
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState("all");

  useEffect(() => {
    dispatch(
      fetchComplaints(
        "agent"
      )
    );
  }, [dispatch]);

  const filtered =
    useMemo(() => {
      let data = [
        ...complaints,
      ];

      if (
        filter !==
        "all"
      ) {
        data =
          data.filter(
            (
              item
            ) =>
              item.status ===
                filter ||
              item.priority ===
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
              item.title
                ?.toLowerCase()
                .includes(
                  q
                ) ||
              item.ticketId
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
    <AgentLayout>
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>
              <p className="text-sm text-slate-500">
                Agent Queue
              </p>

              <h1 className="text-3xl font-bold text-slate-800 mt-1">
                Assigned Complaints
              </h1>

              <p className="text-slate-500 mt-2">
                Manage your active tickets, respond quickly,
                and close issues efficiently.
              </p>
            </div>

            <div className="px-5 py-4 bg-blue-50 rounded-2xl min-w-[180px]">
              <p className="text-sm text-blue-600 font-medium">
                Total Assigned
              </p>

              <h2 className="text-3xl font-bold text-blue-700 mt-1">
                {
                  complaints.length
                }
              </h2>
            </div>

          </div>

        </div>

        {/* FILTER BAR */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 mb-6">

          <div className="grid lg:grid-cols-3 gap-4">

            {/* SEARCH */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-4 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search by title or ticket ID..."
                value={
                  search
                }
                onChange={(
                  e
                ) =>
                  setSearch(
                    e
                      .target
                      .value
                  )
                }
                className="w-full h-12 border rounded-2xl pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* FILTER */}
            <div className="relative">
              <Filter
                size={18}
                className="absolute left-4 top-4 text-slate-400"
              />

              <select
                value={
                  filter
                }
                onChange={(
                  e
                ) =>
                  setFilter(
                    e
                      .target
                      .value
                  )
                }
                className="w-full h-12 border rounded-2xl pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="all">
                  All Tickets
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
              </select>
            </div>

            {/* COUNT */}
            <div className="h-12 rounded-2xl bg-slate-50 flex items-center px-5 text-slate-600 font-medium">
              Showing{" "}
              {
                filtered.length
              }{" "}
              records
            </div>

          </div>

        </div>

        {/* CONTENT */}
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
                Try adjusting search or filters.
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
                      Priority
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4">
                      Date
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
                          <div>
                            <p className="font-medium text-slate-800">
                              {
                                item.title
                              }
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              {item.category}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              priorityMap[
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
                              statusMap[
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

                        <td className="px-6 py-5 text-sm text-slate-500">
                          {new Date(
                            item.createdAt
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-5">

                          <div className="flex items-center justify-center gap-2">

                            <button
                              onClick={() =>
                                navigate(
                                  `/complaint/${item._id}`
                                )
                              }
                              className="px-3 py-2 rounded-xl border hover:bg-slate-100 flex items-center gap-2 text-sm"
                            >
                              <Eye
                                size={
                                  15
                                }
                              />
                              View
                            </button>

                            <button
                              onClick={() =>
                                navigate(
                                  `/agent/chat/${item._id}`
                                )
                              }
                              className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 text-sm"
                            >
                              <MessageCircle
                                size={
                                  15
                                }
                              />
                              Chat
                            </button>

                            <button
                              onClick={() =>
                                navigate(
                                  `/agent/resolve/${item._id}`
                                )
                              }
                              className="px-3 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 text-sm"
                            >
                              <CheckCircle2
                                size={
                                  15
                                }
                              />
                              Resolve
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

      </div>
    </AgentLayout>
  );
};

export default AssignedComplaints;