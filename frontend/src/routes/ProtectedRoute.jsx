

import { useSelector } from "react-redux";

import { Navigate, useLocation,} from "react-router-dom";

const ProtectedRoute = ({ children,}) => {
  const {
    accessToken,
    user,
  } = useSelector(
    (state) =>
      state.auth
  );

  const location =
    useLocation();

  if (
    !accessToken ||
    !user
  ) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from:
            location,
        }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;