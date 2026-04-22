import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "./api/axiosInstance";
import { loginSuccess, logout } from "./features/auth/authSlice";
import { Toaster } from "react-hot-toast";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    // No token → do nothing
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");

        // Sync Redux with backend
        dispatch(
          loginSuccess({
            user: res.data,
            accessToken: token,
          })
        );

      } catch  {
        console.log("User not authenticated");

        //  IMPORTANT FIX
        localStorage.clear();
        dispatch(logout()); 
      }
    };

    fetchUser();
  }, [dispatch]);

  return   <>
    <AppRoutes />
    <Toaster position="top-right" reverseOrder={false} />
  </>;
};

export default App;