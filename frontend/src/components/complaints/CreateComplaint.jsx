import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createComplaint } from "../../features/complaint/complaintSlice";

const CreateComplaint = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.complaint);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await dispatch(createComplaint(form));

    // reset form
    setForm({
      title: "",
      description: "",
      category: "",
      priority: "medium",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Complaint</h2>

      <input
        value={form.title}
        placeholder="Title"
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      /> <br></br>

      <textarea
        value={form.description}
        placeholder="Description"
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      /><br></br>

      <input
        value={form.category}
        placeholder="Category"
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      /><br></br>

      <select
        value={form.priority}
        onChange={(e) => setForm({ ...form, priority: e.target.value })}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select><br></br>

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

export default CreateComplaint;