import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { ArrowLeft, Loader2 } from "lucide-react";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);

  const fetchUser = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(`/admin/users/${id}`);

      setUser(res.data.user);
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <div className="p-10">User not found</div>;
  }

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="bg-white p-6 rounded-3xl mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 border rounded"
            >
              <ArrowLeft size={16} />
            </button>

            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-slate-500">{user.email}</p>
            </div>
          </div>

          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded">
            {user.role}
          </span>
        </div>

        {/* INFO CARDS */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">

          <Card title="Status" value={user.status || "active"} />
          <Card title="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
          <Card title="Total Complaints" value={complaints.length} />

        </div>

        {/* COMPLAINT LIST */}
        <div className="bg-white rounded-3xl p-6">
          <h2 className="text-xl font-bold mb-4">
            Complaint History
          </h2>

          {complaints.length === 0 ? (
            <p className="text-slate-500">
              No complaints found
            </p>
          ) : (
            <table className="w-full">
              <thead className="text-left text-sm text-slate-600 border-b">
                <tr>
                  <th className="py-3">Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id} className="border-b">
                    <td className="py-3">{c.title}</td>
                    <td>{c.status}</td>
                    <td>{c.priority}</td>
                    <td>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="bg-white p-5 rounded-2xl border">
    <p className="text-sm text-slate-500">{title}</p>
    <h2 className="text-xl font-bold">{value}</h2>
  </div>
);

export default UserDetail;