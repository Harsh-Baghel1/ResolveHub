import { useSelector } from "react-redux";

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <div>
      <h2>User Dashboard 👤</h2>
      <h3>Welcome {user?.name}</h3>
    </div>
  );
};

export default Dashboard;