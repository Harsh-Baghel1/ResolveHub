// frontend/src/layouts/AgentLayout.jsx

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  logout,
} from "../features/auth/authSlice";

const AgentLayout = ({
  children,
}) => {
  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  const { user } =
    useSelector(
      (state) =>
        state.auth
    );

  const handleLogout =
    () => {
      dispatch(
        logout()
      );

      navigate("/");
    };

  const navClass =
    ({ isActive }) =>
      `block px-4 py-2 rounded-lg transition ${
        isActive
          ? "bg-blue-600 text-white"
          : "hover:bg-blue-50 text-gray-700"
      }`;

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* SIDEBAR */}
      <aside className="hidden md:flex w-72 bg-white shadow-md flex-col justify-between">

        <div>
          {/* BRAND */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-blue-600">
              ResolveHub
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Agent Panel
            </p>
          </div>

          {/* NAVIGATION */}
          <nav className="p-4 space-y-2">

            <NavLink
              to="/agent"
              end
              className={
                navClass
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/agent/complaints"
              className={
                navClass
              }
            >
              Assigned Complaints
            </NavLink>

            <NavLink
              to="/agent/chat"
              className={
                navClass
              }
            >
              Chats
            </NavLink>

            <NavLink
              to="/agent/performance"
              className={
                navClass
              }
            >
              Performance
            </NavLink>

            <NavLink
              to="/agent/profile"
              className={
                navClass
              }
            >
              Profile
            </NavLink>

          </nav>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t">
          <button
            onClick={
              handleLogout
            }
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Welcome,{" "}
            {user?.name ||
              "Agent"}
          </h2>

          <span className="text-sm text-gray-500">
            Support Agent
          </span>
        </header>

        {/* CONTENT */}
        <main className="p-6 flex-1 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
};

export default AgentLayout;