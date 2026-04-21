import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createComplaint } from "../../features/complaint/complaintSlice";
import toast from "react-hot-toast";

const CreateComplaint = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.complaint);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation with toast
    if (!form.title || !form.description || !form.category) {
      return toast.error("Please fill all fields");
    }

    const promise = dispatch(createComplaint(form));

    // ✅ Toast with loading → success → error
    toast.promise(promise, {
      loading: "Creating complaint...",
      success: "Complaint created successfully 🎉",
      error: "Failed to create complaint",
    });

    const res = await promise;

    if (res.meta.requestStatus === "fulfilled") {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">

      {/* 🔙 Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 mb-4"
      >
        ← Back
      </button>

      <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow">
        
        <h2 className="text-2xl font-semibold mb-4">
          Create New Complaint
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <input
            value={form.title}
            placeholder="Title"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          {/* Description */}
          <textarea
            rows={4}
            value={form.description}
            placeholder="Description"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          {/* Category */}
          <select
            value={form.category}
            className="w-full p-2 border rounded"
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          >
            <option value="">Select Category</option>
            <option value="technical">Technical</option>
            <option value="billing">Billing</option>
            <option value="service">Service</option>
            <option value="other">Other</option>
          </select>

          {/* Priority */}
          <select
            value={form.priority}
            className="w-full p-2 border rounded"
            onChange={(e) =>
              setForm({ ...form, priority: e.target.value })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateComplaint;