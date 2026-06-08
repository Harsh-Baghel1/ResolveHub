import { useSelector } from "react-redux";

const AgentProfile = () => {
  const { user } = useSelector(
    (state) => state.auth
  );

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm">
      <h1 className="text-2xl font-bold">
        Agent Profile
      </h1>

      <div className="mt-4 space-y-2">
        <p>
          <strong>Name:</strong>{" "}
          {user?.name}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {user?.email}
        </p>

        <p>
          <strong>Role:</strong>{" "}
          {user?.role}
        </p>
      </div>
    </div>
  );
};

export default AgentProfile;