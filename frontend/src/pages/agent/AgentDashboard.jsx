// frontend/src/pages/agent/AgentDashboard.jsx

import {
  useEffect,
  useMemo,
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
  ClipboardList,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Ticket,
  UserCheck,
} from "lucide-react";

const StatCard = ({
  title,
  value,
  icon,
  color,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 font-medium">
          {title}
        </p>

        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
      </div>

      <h2 className="text-3xl font-bold text-slate-800 mt-4">
        {value}
      </h2>
    </div>
  );
};

const PriorityBadge = ({
  value,
}) => {
  const map = {
    high:
      "bg-red-100 text-red-700",
    medium:
      "bg-orange-100 text-orange-700",
    low:
      "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        map[
          value
        ] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {value}
    </span>
  );
};

const StatusBadge = ({
  value,
}) => {
  const map = {
    open:
      "bg-yellow-100 text-yellow-700",
    in_progress:
      "bg-blue-100 text-blue-700",
    resolved:
      "bg-green-100 text-green-700",
    closed:
      "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        map[
          value
        ] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {value?.replace(
        "_",
        " "
      )}
    </span>
  );
};

const AgentDashboard = () => {
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

  const { user } =
    useSelector(
      (state) =>
        state.auth || {}
    );

  useEffect(() => {
    dispatch(
      fetchComplaints(
        "agent"
      )
    );
  }, [dispatch]);

  const stats =
    useMemo(() => {
      const total =
        complaints.length;

      const pending =
        complaints.filter(
          (
            c
          ) =>
            c.status ===
              "open" ||
            c.status ===
              "pending"
        ).length;

      const progress =
        complaints.filter(
          (
            c
          ) =>
            c.status ===
            "in_progress"
        ).length;

      const resolved =
        complaints.filter(
          (
            c
          ) =>
            c.status ===
              "resolved" ||
            c.status ===
              "closed"
        ).length;

      const high =
        complaints.filter(
          (
            c
          ) =>
            c.priority ===
            "high"
        ).length;

      return {
        total,
        pending,
        progress,
        resolved,
        high,
      };
    }, [
      complaints,
    ]);

  const recent =
    complaints.slice(
      0,
      5
    );

  return (
    <AgentLayout>
      <div className="max-w-7xl mx-auto">

        {/* HERO */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-sm mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>
              <p className="text-blue-100 text-sm">
                Agent Workspace
              </p>

              <h1 className="text-3xl md:text-4xl font-bold mt-2">
                Welcome,
                {" "}
                {user?.name ||
                  "Agent"}
              </h1>

              <p className="mt-3 text-blue-100 max-w-2xl">
                Manage assigned complaints, respond faster,
                and keep SLA performance strong.
              </p>
            </div>

            <button
              onClick={() =>
                navigate(
                  "/agent/complaints"
                )
              }
              className="bg-white text-blue-700 px-6 py-3 rounded-2xl font-semibold hover:bg-blue-50 transition flex items-center gap-2 h-fit"
            >
              View Queue
              <ArrowRight
                size={
                  18
                }
              />
            </button>

          </div>

        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

          <StatCard
            title="Assigned Tickets"
            value={
              stats.total
            }
            color="bg-blue-100 text-blue-700"
            icon={
              <ClipboardList
                size={
                  22
                }
              />
            }
          />

          <StatCard
            title="Pending"
            value={
              stats.pending
            }
            color="bg-yellow-100 text-yellow-700"
            icon={
              <Clock3
                size={
                  22
                }
              />
            }
          />

          <StatCard
            title="In Progress"
            value={
              stats.progress
            }
            color="bg-indigo-100 text-indigo-700"
            icon={
              <Ticket
                size={
                  22
                }
              />
            }
          />

          <StatCard
            title="Resolved"
            value={
              stats.resolved
            }
            color="bg-green-100 text-green-700"
            icon={
              <CheckCircle2
                size={
                  22
                }
              />
            }
          />

        </div>

        {/* LOWER GRID */}
        <div className="grid xl:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm">

            <div className="px-6 py-5 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Recent Assigned Complaints
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Latest tickets needing action.
                </p>
              </div>

              <button
                onClick={() =>
                  navigate(
                    "/agent/complaints"
                  )
                }
                className="text-blue-600 font-medium text-sm hover:text-blue-700"
              >
                View All
              </button>
            </div>

            {loading ? (
              <div className="p-10 flex justify-center text-slate-500">
                <Loader2 className="animate-spin" />
              </div>
            ) : recent.length ===
              0 ? (
              <div className="p-10 text-center text-slate-500">
                No assigned complaints yet.
              </div>
            ) : (
              <div className="divide-y">
                {recent.map(
                  (
                    item
                  ) => (
                    <div
                      key={
                        item._id
                      }
                      className="px-6 py-5 hover:bg-slate-50 transition cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/complaint/${item._id}`
                        )
                      }
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {
                              item.title
                            }
                          </h3>

                          <p className="text-sm text-slate-500 mt-1">
                            Ticket #
                            {" "}
                            {item.ticketId ||
                              "N/A"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <PriorityBadge
                            value={
                              item.priority
                            }
                          />

                          <StatusBadge
                            value={
                              item.status
                            }
                          />
                        </div>

                      </div>
                    </div>
                  )
                )}
              </div>
            )}

          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* Priority Alert */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center">
                  <AlertTriangle
                    size={
                      22
                    }
                  />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    High Priority
                  </p>

                  <h3 className="text-2xl font-bold text-slate-800">
                    {
                      stats.high
                    }
                  </h3>
                </div>
              </div>

              <p className="text-sm text-slate-500 mt-4">
                Tickets requiring immediate response.
              </p>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
                  <UserCheck
                    size={
                      22
                    }
                  />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Completion Rate
                  </p>

                  <h3 className="text-2xl font-bold text-slate-800">
                    {stats.total ===
                    0
                      ? "0%"
                      : `${Math.round(
                          (stats.resolved /
                            stats.total) *
                            100
                        )}%`}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-slate-500 mt-4">
                Based on assigned complaints resolved.
              </p>
            </div>

            {/* CTA */}
            <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-sm">
              <h3 className="text-xl font-bold">
                Ready to Resolve?
              </h3>

              <p className="text-blue-100 mt-2 text-sm">
                Continue working through your queue and keep users satisfied.
              </p>

              <button
                onClick={() =>
                  navigate(
                    "/agent/complaints"
                  )
                }
                className="mt-5 bg-white text-blue-700 px-5 py-3 rounded-2xl font-semibold hover:bg-blue-50"
              >
                Open Queue
              </button>
            </div>

          </div>

        </div>

      </div>
    </AgentLayout>
  );
};

export default AgentDashboard;