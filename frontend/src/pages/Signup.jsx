import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/auth/authSlice";
import AuthLayout from "../layouts/AuthLayout";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      // 1. Register user
      await axiosInstance.post("/auth/register", form);

      // 2. Login automatically
      const res = await axiosInstance.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      // 3. Save to Redux
      dispatch(
        loginSuccess({
          user: res.data.user,
          accessToken: res.data.accessToken,
        })
      );

      localStorage.setItem("accessToken", res.data.accessToken);

      // 4. Redirect
      navigate("/dashboard");

    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed");
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Create Account
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
            required
          />

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
            Signup
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Signup;