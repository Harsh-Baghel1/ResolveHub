import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const Login = () => {
  const { accessToken } = useSelector((state) => state.auth);

  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

};

export default Login;