// frontend/src/layouts/UserLayout.jsx

import { Link } from "react-router-dom";
import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useNavigate,
} from "react-router-dom";

import {
  logout,
} from "../features/auth/authSlice";

const UserLayout = ({
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

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-white shadow-md flex-col justify-between">

        <div>
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-blue-600">
              ResolveHub
            </h1>
          </div>

          <nav className="p-4 space-y-2">

            <Link
              to="/dashboard"
              className="block px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              Dashboard
            </Link>

            <Link
              to="/create-complaint"
              className="block px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              Create Complaint
            </Link>

            <Link
              to="/my-complaints"
              className="block px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              My Complaints
            </Link>

          </nav>
        </div>

        <div className="p-4 border-t">
          <button
            onClick={
              handleLogout
            }
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
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
              "User"}
          </h2>

          <span className="text-sm text-gray-500">
            User Panel
          </span>
        </header>

        {/* CONTENT */}
        <main className="p-6 flex-1">
          {children}
        </main>

      </div>
    </div>
  );
};

export default UserLayout;