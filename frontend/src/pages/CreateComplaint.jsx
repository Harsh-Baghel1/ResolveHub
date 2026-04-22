
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Layers,
  Flag,
  Send,
  Loader2,
} from "lucide-react";

import { createComplaint } from "../features/complaint/complaintSlice";

const CreateComplaint = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector(
    (state) => state.complaint
  );

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
  });

  const [successMsg, setSuccessMsg] = useState("");

  // ===============================
  // HANDLE CHANGE
  // ===============================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ===============================
  // SUBMIT
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMsg("");

    const res = await dispatch(createComplaint(form));

    if (res.meta.requestStatus === "fulfilled") {
      setSuccessMsg("Complaint submitted successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);

      setForm({
        title: "",
        description: "",
        category: "",
        priority: "medium",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      {/* CARD */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b pb-5 mb-6">

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Raise New Complaint
            </h1>

            <p className="text-gray-500 mt-1">
              Submit your issue and our support team will assist you.
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-slate-50 transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        {/* SUCCESS */}
        {successMsg && (
          <div className="mb-5 bg-green-100 text-green-700 px-4 py-3 rounded-xl">
            {successMsg}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Complaint Title
            </label>

            <div className="relative">
              <FileText
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter issue title"
                className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>

            <textarea
              rows="5"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Explain your issue in detail..."
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* GRID */}
          <div className="grid md:grid-cols-2 gap-5">

            {/* CATEGORY */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>

              <div className="relative">
                <Layers
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="service">Service</option>
                  <option value="account">Account</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* PRIORITY */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Priority
              </label>

              <div className="relative">
                <Flag
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex justify-center">
  <button
    type="submit"
    disabled={loading}
    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition"
  >
    {loading ? (
      <>
        <Loader2 className="animate-spin" size={18} />
        Submitting...
      </>
    ) : (
      <>
        <Send size={18} />
        Submit Complaint
      </>
    )}
  </button>
</div>

        </form>
      </div>
    </div>
  );
};

export default CreateComplaint;