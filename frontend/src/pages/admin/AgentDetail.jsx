import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

import {
  ArrowLeft,
  Loader2,
  Plus,
  X,
  Briefcase,
  CheckCircle2,
  Clock3,
  Activity,
  TrendingUp,
  MessageCircle,
} from "lucide-react";

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [agent, setAgent] = useState(null);
  const [skills, setSkills] = useState([]);
  const [input, setInput] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [recentComplaints, setRecentComplaints] = useState([]);

  // ================================
  // FETCH
  // ================================
  const fetchAgent = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(`/admin/users/${id}`);

      const user = res.data.user;
      const complaints = res.data.complaints || [];

      setAgent(user);
      setSkills(user.skills || []);
      setIsAvailable(user.isAvailable ?? true);
      setRecentComplaints(complaints.slice(0, 5));

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgent();
  }, [id]);

  // ================================
  // SKILLS
  // ================================
  const addSkill = () => {
    const val = input.trim().toLowerCase();
    if (!val) return;

    if (!skills.includes(val)) {
      setSkills([...skills, val]);
    }

    setInput("");
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  // ================================
  // SAVE
  // ================================
  const handleSave = async () => {
    try {
      setSaving(true);

      await axiosInstance.patch(`/admin/agents/${id}`, {
        skills,
        isAvailable,
      });

      toast.success("Agent updated successfully ✅");

    } catch {
      toast.error("Update failed ");
    } finally {
      setSaving(false);
    }
  };

  // ================================
  // INSIGHTS (SMART LOGIC)
  // ================================
  const getInsights = () => {
    const insights = [];

    if (agent.status === "suspended") {
      insights.push("⚠ Agent is suspended");
    }

    if (!isAvailable) {
      insights.push("⚠ Agent is unavailable");
    }

    if (agent.activeTickets > 5) {
      insights.push("⚠ High workload");
    }

    if (skills.length > 0) {
      insights.push(`✔ Skilled in: ${skills.join(", ")}`);
    }

    if (agent.activeTickets <= 2 && isAvailable) {
      insights.push("✔ Ideal for assignment");
    }

    return insights;
  };

  // ================================
  // CALCULATIONS
  // ================================
  const resolved = agent?.resolvedTickets || 0;
  const active = agent?.activeTickets || 0;
  const total = resolved + active;

  const efficiency = total
    ? Math.round((resolved / total) * 100)
    : 0;

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!agent) return <div>Agent not found</div>;

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white p-6 rounded-3xl mb-6 flex justify-between items-center border">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 border rounded">
              <ArrowLeft size={16} />
            </button>

            <div>
              <h1 className="text-2xl font-bold">{agent.name}</h1>
              <p className="text-slate-500">{agent.email}</p>
            </div>
          </div>

          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded">
            Agent
          </span>
        </div>

        {/* PERFORMANCE */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card title="Active Tickets" value={active} icon={<Briefcase />} />
          <Card title="Resolved" value={resolved} icon={<CheckCircle2 />} />
          <Card title="Efficiency %" value={`${efficiency}%`} icon={<TrendingUp />} />
          <Card
            title="Joined"
            value={new Date(agent.createdAt).toLocaleDateString()}
            icon={<Clock3 />}
          />
        </div>

        {/* GRID */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">

            {/* ACTIVITY (UPGRADED) */}
            <div className="bg-white p-6 rounded-3xl border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity size={18} /> Recent Activity
              </h2>

              {recentComplaints.map((c) => (
                <div key={c._id} className="border-b pb-3 mb-3">

                  <p className="font-medium">{c.title}</p>
                  <p className="text-sm text-slate-500">
                    {c.priority} • {c.status}
                  </p>

                  {/* ACTIONS */}
                  <div className="flex gap-2 mt-2">

                    <button
                      onClick={() => navigate(`/complaint/${c._id}`)}
                      className="text-xs px-2 py-1 border rounded"
                    >
                      View
                    </button>

                    <button
                      onClick={() => navigate(`/admin/complaints?reassign=${c._id}`)}
                      className="text-xs px-2 py-1 bg-yellow-500 text-white rounded"
                    >
                      Reassign
                    </button>

                    <button
                      onClick={() => navigate(`/admin/chat/${c._id}`)}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded flex items-center gap-1"
                    >
                      <MessageCircle size={12} />
                      Chat
                    </button>

                  </div>

                </div>
              ))}
            </div>

            {/* SKILLS */}
            <div className="bg-white p-6 rounded-3xl border">
              <h2 className="text-lg font-semibold mb-4">Skills</h2>

              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map((skill) => (
                  <div key={skill} className="px-3 py-1 bg-blue-100 rounded flex items-center gap-2">
                    {skill}
                    <X size={14} onClick={() => removeSkill(skill)} />
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                />
                <button onClick={addSkill} className="bg-blue-600 text-white px-4 rounded">
                  <Plus size={16} />
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* AVAILABILITY */}
            <div className="bg-white p-6 rounded-3xl border">
              <h2 className="font-semibold mb-3">Availability</h2>

              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`w-full py-2 rounded ${
                  isAvailable ? "bg-green-600" : "bg-red-600"
                } text-white`}
              >
                {isAvailable ? "Available" : "Unavailable"}
              </button>
            </div>

            {/* SMART INSIGHTS */}
            <div className="bg-blue-50 p-6 rounded-3xl border">
              <h2 className="font-semibold mb-3">Smart Insights</h2>

              {getInsights().map((i, index) => (
                <p key={index} className="text-sm text-slate-700 mb-2">
                  {i}
                </p>
              ))}
            </div>

          </div>

        </div>

        {/* SAVE */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="min-w-[220px] px-8 py-3 bg-black text-white rounded-2xl"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
};

// CARD
const Card = ({ title, value, icon }) => (
  <div className="bg-white p-5 rounded-2xl border flex items-center gap-3">
    <div className="p-2 bg-slate-100 rounded">{icon}</div>
    <div>
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  </div>
);

export default AgentDetail;