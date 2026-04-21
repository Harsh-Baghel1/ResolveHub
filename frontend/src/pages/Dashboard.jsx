import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import ComplaintsList from "../components/complaints/ComplaintsList";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    dispatch(logout());
    navigate("/");
  };

  const handleNewComplaint = () => {
    navigate("/create-complaint"); // you can create this page later
  };

  // Safety
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">

      {/* Top Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow mb-4">
        
        {/* LEFT - Username */}
        <h2 className="text-xl font-semibold">
          {user.name}
        </h2>

        {/* RIGHT - Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleNewComplaint}
            className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition"
          >
            New Complaint
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/*  Main Section (ONLY LIST) */}
      <div className="bg-white p-4 rounded-xl shadow">
        
        <h3 className="text-lg font-semibold mb-4">
          Complaints
        </h3>

        {/* Only show list (no create form) */}
        {user.role === "user" && <ComplaintsList type="user" />}
        {user.role === "admin" && <ComplaintsList type="admin" />}
        {user.role === "agent" && <ComplaintsList type="agent" />}
        
      </div>
    </div>
  );
};

export default Dashboard;