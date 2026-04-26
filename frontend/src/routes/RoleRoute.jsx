// frontend/src/routes/RoleRoute.jsx

import { useSelector } from "react-redux";

import {
  Navigate,
} from "react-router-dom";

const RoleRoute = ({
  children,
  allowedRoles,
}) => {
  const {
    user,
    accessToken,
  } = useSelector(
    (state) =>
      state.auth
  );

  // Not logged in
  if (
    !accessToken ||
    !user
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // Role not allowed
  if (
    !allowedRoles.includes(
      user.role
    )
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

  return children;
};

export default RoleRoute;