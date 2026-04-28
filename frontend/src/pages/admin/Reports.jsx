// frontend/src/pages/admin/Reports.jsx

import {
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";

import axiosInstance from "../../api/axiosInstance";

import {
  BarChart3,
  TrendingUp,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  Users,
  RefreshCcw,
  Download,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

const Reports = () => {
  const [loading, setLoading] =
    useState(true);

  const [range, setRange] =
    useState("30");

  const [report, setReport] =
    useState({
      total: 0,
      resolved: 0,
      open: 0,
      inProgress: 0,
      overdue: 0,
      avgResolutionHours: 0,
      activeAgents: 0,
      monthly: [],
      topAgents: [],
      priorities: {
        high: 0,
        medium: 0,
        low: 0,
      },
    });

  // =====================================
  // LOAD REPORTS
  // =====================================
  const fetchReports =
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
              `/admin/reports?days=${range}`
            );

          setReport(
            res.data ||
              {}
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
      [range]
    );

  useEffect(() => {
    fetchReports(false);
  }, [fetchReports]);

  // =====================================
  // KPI
  // =====================================
  const resolvedRate =
    useMemo(() => {
      if (
        !report.total
      )
        return 0;

      return Math.round(
        (report.resolved /
          report.total) *
          100
      );
    }, [report]);

  const overdueRate =
    useMemo(() => {
      if (
        !report.total
      )
        return 0;

      return Math.round(
        (report.overdue /
          report.total) *
          100
      );
    }, [report]);

  const maxMonthly =
    Math.max(
      ...(
        report.monthly ||
        []
      ).map(
        (
          m
        ) =>
          m.count
      ),
      1
    );

  const maxAgent =
    Math.max(
      ...(
        report.topAgents ||
        []
      ).map(
        (
          a
        ) =>
          a.count
      ),
      1
    );

  const Card = ({
    title,
    value,
    icon,
    color,
    note,
  }) => (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
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

      <h3 className="text-3xl font-bold text-slate-800 mt-4">
        {value}
      </h3>

      <p className="text-xs text-slate-500 mt-2">
        {note}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center text-slate-500">
        <RefreshCcw className="animate-spin mr-2" />
        Loading reports...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>
              <p className="text-sm text-slate-500">
                Admin Analytics
              </p>

              <h1 className="text-3xl font-bold text-slate-800 mt-1">
                Reports & Insights
              </h1>

              <p className="text-slate-500 mt-2">
                Track operational performance, SLA health, and resolution trends.
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-4 top-4 text-slate-400"
                />

                <select
                  value={
                    range
                  }
                  onChange={(
                    e
                  ) =>
                    setRange(
                      e.target
                        .value
                    )
                  }
                  className="h-12 pl-11 pr-4 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="7">
                    Last 7 Days
                  </option>

                  <option value="30">
                    Last 30 Days
                  </option>

                  <option value="90">
                    Last 90 Days
                  </option>

                  <option value="365">
                    Last 1 Year
                  </option>
                </select>
              </div>

              <button
                onClick={() =>
                  fetchReports(
                    true
                  )
                }
                className="h-12 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <RefreshCcw size={16} />
                Refresh
              </button>

              <button className="h-12 px-5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-2">
                <Download size={16} />
                Export
              </button>

            </div>

          </div>

        </div>

        {/* KPI */}
        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-5 mb-6">

          <Card
            title="Total Tickets"
            value={
              report.total
            }
            color="bg-slate-100 text-slate-700"
            icon={<BarChart3 size={22} />}
            note="All complaints"
          />

          <Card
            title="Resolved Rate"
            value={`${resolvedRate}%`}
            color="bg-green-100 text-green-700"
            icon={<CheckCircle2 size={22} />}
            note="Closure efficiency"
          />

          <Card
            title="Avg Time"
            value={`${report.avgResolutionHours || 0}h`}
            color="bg-blue-100 text-blue-700"
            icon={<Clock3 size={22} />}
            note="Resolution speed"
          />

          <Card
            title="SLA Breach"
            value={`${overdueRate}%`}
            color="bg-red-100 text-red-700"
            icon={<AlertTriangle size={22} />}
            note="Overdue ratio"
          />

          <Card
            title="Active Agents"
            value={
              report.activeAgents
            }
            color="bg-purple-100 text-purple-700"
            icon={<Users size={22} />}
            note="Support workforce"
          />

        </div>

        {/* CHARTS */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">

          {/* MONTHLY */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

            <h3 className="text-xl font-bold text-slate-800">
              Complaint Trend
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Tickets created over time
            </p>

            <div className="mt-6 space-y-4">

              {(report.monthly ||
                []).map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                  >
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">
                        {
                          item.label
                        }
                      </span>

                      <span className="font-medium text-slate-800">
                        {
                          item.count
                        }
                      </span>
                    </div>

                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{
                          width: `${
                            (item.count /
                              maxMonthly) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}

            </div>

          </div>

          {/* TOP AGENTS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

            <h3 className="text-xl font-bold text-slate-800">
              Top Performing Agents
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Most resolved complaints
            </p>

            <div className="mt-6 space-y-4">

              {(report.topAgents ||
                []).map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                  >
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">
                        {
                          item.name
                        }
                      </span>

                      <span className="font-medium text-slate-800">
                        {
                          item.count
                        }
                      </span>
                    </div>

                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 rounded-full"
                        style={{
                          width: `${
                            (item.count /
                              maxAgent) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}

            </div>

          </div>

        </div>

        {/* PRIORITY + INSIGHT */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* PRIORITY */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

            <h3 className="text-xl font-bold text-slate-800">
              Priority Breakdown
            </h3>

            <div className="mt-6 space-y-4">

              {[
                {
                  label:
                    "High",
                  count:
                    report
                      .priorities
                      ?.high ||
                    0,
                  color:
                    "bg-red-600",
                },
                {
                  label:
                    "Medium",
                  count:
                    report
                      .priorities
                      ?.medium ||
                    0,
                  color:
                    "bg-orange-500",
                },
                {
                  label:
                    "Low",
                  count:
                    report
                      .priorities
                      ?.low ||
                    0,
                  color:
                    "bg-green-600",
                },
              ].map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full ${item.color}`}
                      />

                      <span className="text-slate-700">
                        {
                          item.label
                        }
                      </span>
                    </div>

                    <span className="font-semibold text-slate-800">
                      {
                        item.count
                      }
                    </span>
                  </div>
                )
              )}

            </div>

          </div>

          {/* INSIGHT */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-7 text-white shadow-sm">

            <div className="flex items-center gap-3">
              <TrendingUp />

              <h3 className="text-xl font-bold">
                Executive Insight
              </h3>
            </div>

            <p className="mt-5 text-blue-100 leading-relaxed">
              Resolution rate is{" "}
              <span className="font-semibold text-white">
                {
                  resolvedRate
                }%
              </span>
              . Current SLA breach ratio is{" "}
              <span className="font-semibold text-white">
                {
                  overdueRate
                }%
              </span>
              . Focus on high-priority unresolved tickets and improve response speed.
            </p>

            <div className="mt-6 bg-white/15 rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
              <ShieldCheck size={16} />
              Real-time Monitoring Enabled
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Reports;