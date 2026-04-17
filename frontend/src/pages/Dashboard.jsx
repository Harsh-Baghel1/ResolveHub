import { useSelector } from "react-redux";
import ComplaintsList from "../components/complaints/ComplaintsList";
import CreateComplaint from "../components/complaints/CreateComplaint";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div>
      <h2>Welcome {user?.name}</h2>

      {user?.role === "user" && (
        <>
          <CreateComplaint />
          <ComplaintsList type="user" />
        </>
      )}

      {user?.role === "admin" && (
        <ComplaintsList type="admin" />
      )}

      {user?.role === "agent" && (
        <ComplaintsList type="agent" />
      )}
    </div>
  );
};

export default Dashboard;