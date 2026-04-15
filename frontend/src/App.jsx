import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "./api/axiosInstance";
import { loginSuccess } from "./features/auth/authSlice";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get("/auth/me");

      dispatch(
        loginSuccess({
          user: res.data,
          accessToken: localStorage.getItem("accessToken"),
        })
      );

    } catch (error) {
      console.log("User not authenticated:", error.message);
    }
  };

  fetchUser();
}, [dispatch]); 
  return <AppRoutes />;
};



export default App;