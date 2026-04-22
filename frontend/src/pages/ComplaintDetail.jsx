// src/pages/ComplaintDetail.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  CalendarDays,
  UserCircle,
  ShieldCheck,
  Tag,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  // FETCH DATA
  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await axiosInstance.get(`/complaints/${id}`);
        setComplaint(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  // FORMAT STATUS
  const formatStatus = (status) => {
    return status
      ?.replace("_", " ")
      ?.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // STATUS COLOR
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

  // PRIORITY COLOR
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

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        <Loader2 className="animate-spin mr-2" />
        Loading complaint...
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        Complaint not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      {/* MAIN CARD */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 border-b pb-6">

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {complaint.title}
            </h1>

            <p className="text-gray-500 mt-2 max-w-2xl">
              {complaint.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${statusColor(
                complaint.status
              )}`}
            >
              {formatStatus(complaint.status)}
            </span>

            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${priorityColor(
                complaint.priority
              )}`}
            >
              {complaint.priority}
            </span>

          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">

          {/* LEFT */}
          <div className="space-y-5">

            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Category</p>
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <Tag size={16} />
                {complaint.category}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Created By</p>
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <UserCircle size={16} />
                {complaint.createdBy?.name || "Unknown"}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Assigned To</p>
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <ShieldCheck size={16} />
                {complaint.assignedTo?.name || "Not Assigned"}
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-5">

            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Created Date</p>
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <CalendarDays size={16} />
                {new Date(complaint.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">SLA Status</p>
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <AlertTriangle size={16} />
                {complaint.slaStatus || "Within SLA"}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl">
  <p className="text-sm text-gray-500 mb-1">Ticket ID</p>
  <div className="font-semibold text-slate-700 text-lg">
    {complaint.ticketId || "RH-0000"}
  </div>
</div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t mt-8 pt-6 flex flex-wrap gap-3">

          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 rounded-xl border hover:bg-slate-50 transition"
          >
            Back
          </button>

          <button className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">
            Chat Support
          </button>

        </div>

      </div>
    </div>
  );
};

export default ComplaintDetail;