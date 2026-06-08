// frontend/src/pages/agent/ResolveComplaint.jsx

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import axiosInstance from "../../api/axiosInstance";

import {
  ArrowLeft,
  Loader2,
  Save,
  MessageCircle,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock3,
} from "lucide-react";

const statusColors = {
  open: "bg-yellow-100 text-yellow-700",
  pending: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-700",
};

const priorityColors = {
  high: "bg-red-100 text-red-700",
  medium: "bg-orange-100 text-orange-700",
  low: "bg-green-100 text-green-700",
};

const ResolveComplaint = () => {
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
    saving,
    setSaving,
  ] = useState(false);

  const [
    form,
    setForm,
  ] = useState({
    status:
      "in_progress",
    resolutionNote:
      "",
  });

  // =====================================
  // LOAD COMPLAINT
  // =====================================
  useEffect(() => {
    const fetchData =
      async () => {
        try {
          const res =
            await axiosInstance.get(
              `/complaints/${id}`
            );

          const data =
            res.data
              .data ||
            res.data;

          setComplaint(
            data
          );

          setForm({
            status:
              data.status ||
              "open",
            resolutionNote:
              data.resolutionNote ||
              "",
          });
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
      };

    fetchData();
  }, [id]);

  // =====================================
  // CHANGE
  // =====================================
  const handleChange =
    (e) => {
      setForm({
        ...form,
        [
          e.target
            .name
        ]:
          e.target
            .value,
      });
    };

  // =====================================
  // SAVE
  // =====================================
  const handleSubmit =
    async (
      e
    ) => {
      e.preventDefault();

      try {
        setSaving(
          true
        );

        await axiosInstance.patch("/agent/complaints/status", {
  complaintId: id,
  status: form.status,
});

        navigate(
          "/agent/complaints"
        );
      } catch (
        error
      ) {
        console.log(
          error
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  if (loading) {
  return (
    <div className="h-[70vh] flex justify-center items-center text-slate-500">
      <Loader2 className="animate-spin mr-2" />
      Loading complaint...
    </div>
  );
}

  return (
    
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>
              <p className="text-sm text-slate-500">
                Agent Action Panel
              </p>

              <h1 className="text-3xl font-bold text-slate-800 mt-1">
                Resolve Complaint
              </h1>

              <p className="text-slate-500 mt-2">
                Update status, add notes, and close tickets professionally.
              </p>
            </div>

            <button
              onClick={() =>
                navigate(
                  "/agent/complaints"
                )
              }
              className="px-5 py-3 rounded-2xl border hover:bg-slate-50 flex items-center gap-2 h-fit"
            >
              <ArrowLeft
                size={
                  17
                }
              />
              Back to Queue
            </button>

          </div>

        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT INFO */}
          <div className="space-y-6">

            {/* Ticket */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

              <p className="text-sm text-slate-500">
                Ticket ID
              </p>

              <h2 className="text-xl font-bold text-slate-800 mt-1">
                {complaint.ticketId ||
                  "N/A"}
              </h2>

              <p className="text-slate-600 mt-4 font-medium">
                {
                  complaint.title
                }
              </p>

              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {
                  complaint.description
                }
              </p>

            </div>

            {/* Meta */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">

              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm">
                  Priority
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    priorityColors[
                      complaint.priority
                    ] ||
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {
                    complaint.priority
                  }
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm">
                  Current Status
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    statusColors[
                      complaint.status
                    ] ||
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {complaint.status?.replace(
                    "_",
                    " "
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm">
                  Created
                </span>

                <span className="text-sm text-slate-700">
                  {new Date(
                    complaint.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>

            </div>

            {/* Quick CTA */}
            <button
              onClick={() =>
                navigate(
                  `/agent/chat/${id}`
                )
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-3xl px-5 py-4 flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle
                size={
                  18
                }
              />
              Open Chat
            </button>

          </div>

          {/* RIGHT FORM */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-7">

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-6"
            >

              {/* STATUS */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Update Status
                </label>

                <select
                  name="status"
                  value={
                    form.status
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full h-12 border rounded-2xl px-4 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="open">
                    Open
                  </option>

                  <option value="in_progress">
                    In Progress
                  </option>

                  <option value="resolved">
                    Resolved
                  </option>
                </select>
              </div>

              {/* NOTE */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Resolution Notes
                </label>

                <textarea
                  rows="8"
                  name="resolutionNote"
                  value={
                    form.resolutionNote
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Describe what action was taken, solution applied, follow-up needed..."
                  className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* HINT BOX */}
              <div className="grid md:grid-cols-3 gap-4">

                <div className="rounded-2xl bg-yellow-50 p-4">
                  <Clock3 className="text-yellow-600 mb-2" />
                  <p className="text-sm font-medium text-slate-700">
                    In Progress
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Working on issue.
                  </p>
                </div>

                <div className="rounded-2xl bg-green-50 p-4">
                  <CheckCircle2 className="text-green-600 mb-2" />
                  <p className="text-sm font-medium text-slate-700">
                    Resolved
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Problem fixed.
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50 p-4">
                  <ShieldCheck className="text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-slate-700">
                    Professional Notes
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Add clear resolution details.
                  </p>
                </div>

              </div>

              {/* SAVE */}
              <button
                type="submit"
                disabled={
                  saving
                }
                className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save
                      size={
                        18
                      }
                    />
                    Save Update
                  </>
                )}
              </button>

            </form>

          </div>

        </div>

      </div>
    
  );
};

export default ResolveComplaint;