import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { loginSuccess } from "../features/auth/authSlice";
import AuthLayout from "../layouts/AuthLayout";

const Login = () => {
  const { accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  if (accessToken) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post("/auth/login", form);

      dispatch(
        loginSuccess({
          user: res.data.user,
          accessToken: res.data.accessToken,
        })
      );

      localStorage.setItem("accessToken", res.data.accessToken);

      navigate("/dashboard");

    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Sign in to ResolveHub
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
            required
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
            Login
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600">
            Signup
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;