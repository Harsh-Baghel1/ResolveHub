// frontend/src/pages/auth/Signup.jsx

import { useState } from "react";
import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  Navigate,
  useNavigate,
  Link,
} from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout";

import {
  loginStart,
  loginSuccess,
  loginFail,
} from "../../features/auth/authSlice";

import {
  signupAPI,
  loginAPI,
} from "../../features/auth/authAPI";

const Signup = () => {
  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  const {
    accessToken,
    user,
    loading,
    error,
  } = useSelector(
    (state) =>
      state.auth
  );

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      password: "",
    });

  // ======================================
  // REDIRECT IF ALREADY LOGGED IN
  // ======================================
  if (
    accessToken &&
    user
  ) {
    if (
      user.role ===
      "admin"
    ) {
      return (
        <Navigate
          to="/admin"
          replace
        />
      );
    }

    if (
      user.role ===
      "agent"
    ) {
      return (
        <Navigate
          to="/agent"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  // ======================================
  // HANDLE INPUT
  // ======================================
  const handleChange = (
    e
  ) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  // ======================================
  // SIGNUP
  // ======================================
  const handleSubmit =
    async (e) => {
      e.preventDefault();

      try {
        dispatch(
          loginStart()
        );

        // Register
        await signupAPI(
          form
        );

        // Auto Login
        const res =
          await loginAPI({
            email:
              form.email,
            password:
              form.password,
          });

        const {
          user,
          accessToken,
          refreshToken,
        } = res.data;

        localStorage.setItem(
          "refreshToken",
          refreshToken
        );

        dispatch(
          loginSuccess({
            user,
            accessToken,
          })
        );

        if (
          user.role ===
          "admin"
        ) {
          navigate(
            "/admin"
          );
        } else if (
          user.role ===
          "agent"
        ) {
          navigate(
            "/agent"
          );
        } else {
          navigate(
            "/dashboard"
          );
        }
      } catch (err) {
        dispatch(
          loginFail(
            err.response
              ?.data
              ?.message ||
              "Signup failed"
          )
        );
      }
    };

  return (
    <AuthLayout>
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Create
          Account
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4"
        >
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={
              form.name
            }
            onChange={
              handleChange
            }
            required
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={
              form.email
            }
            onChange={
              handleChange
            }
            required
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={
              form.password
            }
            onChange={
              handleChange
            }
            required
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={
              loading
            }
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Signup"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have
          an account?{" "}
          <Link
            to="/"
            className="text-blue-600"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Signup;