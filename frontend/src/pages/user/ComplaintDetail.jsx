// frontend/src/pages/user/ComplaintDetail.jsx

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import axiosInstance from "../../api/axiosInstance";

import {
  CalendarDays,
  UserCircle,
  ShieldCheck,
  Tag,
  AlertTriangle,
  Loader2,
  MessageCircle,
  ArrowLeft,
  Hash,
} from "lucide-react";

import UserLayout from "../../layouts/UserLayout";

const ComplaintDetail = () => {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [
    complaint,
    setComplaint,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // ======================================
  // FETCH COMPLAINT
  // ======================================
  useEffect(() => {
    const fetchComplaint =
      async () => {
        try {
          const res =
            await axiosInstance.get(
              `/complaints/${id}`
            );

          setComplaint(
            res.data
              .data ||
              res.data
          );
        } catch (
          err
        ) {
          setError(
            err
              .response
              ?.data
              ?.message ||
              "Failed to load complaint"
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    fetchComplaint();
  }, [id]);

  // ======================================
  // FORMATTERS
  // ======================================
  const formatText =
    (
      value
    ) => {
      return value
        ?.replace(
          "_",
          " "
        )
        ?.replace(
          /\b\w/g,
          (
            c
          ) =>
            c.toUpperCase()
        );
    };

  const statusColor =
    (
      status
    ) => {
      switch (
        status
      ) {
        case "open":
          return "bg-yellow-100 text-yellow-700";

        case "in_progress":
          return "bg-blue-100 text-blue-700";

        case "resolved":
          return "bg-green-100 text-green-700";

        case "closed":
          return "bg-gray-100 text-gray-700";

        default:
          return "bg-slate-100 text-slate-700";
      }
    };

  const priorityColor =
    (
      priority
    ) => {
      switch (
        priority
      ) {
        case "high":
          return "bg-red-100 text-red-700";

        case "medium":
          return "bg-orange-100 text-orange-700";

        case "low":
          return "bg-green-100 text-green-700";

        default:
          return "bg-slate-100 text-slate-700";
      }
    };

  // ======================================
  // LOADING
  // ======================================
  if (
    loading
  ) {
    return (
      <UserLayout>
        <div className="bg-white rounded-2xl shadow-sm p-10 flex justify-center items-center text-gray-500">
          <Loader2 className="animate-spin mr-2" />
          Loading complaint...
        </div>
      </UserLayout>
    );
  }

  // ======================================
  // ERROR
  // ======================================
  if (
    error
  ) {
    return (
      <UserLayout>
        <div className="bg-red-100 text-red-700 rounded-2xl p-6">
          {
            error
          }
        </div>
      </UserLayout>
    );
  }

  // ======================================
  // NO DATA
  // ======================================
  if (
    !complaint
  ) {
    return (
      <UserLayout>
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-500">
          Complaint
          not found.
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm p-8">

          <div className="flex flex-col md:flex-row md:justify-between gap-5 border-b pb-6">

            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {
                  complaint.title
                }
              </h1>

              <p className="text-gray-500 mt-2 max-w-3xl leading-relaxed">
                {
                  complaint.description
                }
              </p>
            </div>

            <div className="flex flex-wrap gap-2 h-fit">

              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${statusColor(
                  complaint.status
                )}`}
              >
                {formatText(
                  complaint.status
                )}
              </span>

              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${priorityColor(
                  complaint.priority
                )}`}
              >
                {formatText(
                  complaint.priority
                )}
              </span>

            </div>

          </div>

          {/* DETAILS */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">

            {/* LEFT */}
            <div className="space-y-5">

              <div className="bg-slate-50 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-2">
                  Category
                </p>

                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <Tag
                    size={
                      16
                    }
                  />
                  {formatText(
                    complaint.category
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-2">
                  Created By
                </p>

                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <UserCircle
                    size={
                      16
                    }
                  />
                  {complaint
                    .createdBy
                    ?.name ||
                    "Unknown"}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-2">
                  Assigned To
                </p>

                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <ShieldCheck
                    size={
                      16
                    }
                  />
                  {complaint
                    .assignedTo
                    ?.name ||
                    "Not Assigned"}
                </div>
              </div>

            </div>

            {/* RIGHT */}
            <div className="space-y-5">

              <div className="bg-slate-50 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-2">
                  Created Date
                </p>

                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <CalendarDays
                    size={
                      16
                    }
                  />
                  {new Date(
                    complaint.createdAt
                  ).toLocaleDateString()}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-2">
                  SLA Status
                </p>

                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <AlertTriangle
                    size={
                      16
                    }
                  />
                  {formatText(
                    complaint.slaStatus ||
                      "within_sla"
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-5">
                <p className="text-sm text-gray-500 mb-2">
                  Ticket ID
                </p>

                <div className="flex items-center gap-2 font-semibold text-slate-700 text-lg">
                  <Hash
                    size={
                      16
                    }
                  />
                  {complaint.ticketId ||
                    "RH-0000"}
                </div>
              </div>

            </div>

          </div>

          {/* ACTIONS */}
          <div className="border-t mt-8 pt-6 flex flex-wrap gap-3">

            <button
              onClick={() =>
                navigate(
                  -1
                )
              }
              className="px-5 py-3 rounded-xl border hover:bg-slate-50 flex items-center gap-2"
            >
              <ArrowLeft
                size={
                  16
                }
              />
              Back
            </button>

            <button
              onClick={() =>
                navigate(
                  `/chat/${complaint._id}`
                )
              }
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <MessageCircle
                size={
                  16
                }
              />
              Chat Support
            </button>

          </div>

        </div>
      </div>
    </UserLayout>
  );
};

export default ComplaintDetail;