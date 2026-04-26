// frontend/src/pages/auth/Login.jsx

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
  loginAPI,
} from "../../features/auth/authAPI";

const Login = () => {
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
  // INPUT CHANGE
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
  // LOGIN
  // ======================================
  const handleSubmit =
    async (e) => {
      e.preventDefault();

      try {
        dispatch(
          loginStart()
        );

        const res =
          await loginAPI(
            form
          );

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
              "Login failed"
          )
        );
      }
    };

  return (
    <AuthLayout>
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Sign in to
          ResolveHub
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
              ? "Signing In..."
              : "Login"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don’t have an
          account?{" "}
          <Link
            to="/signup"
            className="text-blue-600"
          >
            Signup
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;