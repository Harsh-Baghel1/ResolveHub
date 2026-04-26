// frontend/src/App.jsx

import { useEffect } from "react";
import {
  useDispatch,
} from "react-redux";

import AppRoutes from "./routes/AppRoutes";

import {
  loginSuccess,
  logout,
} from "./features/auth/authSlice";

import {
  getMeAPI,
} from "./features/auth/authAPI";

import { Toaster } from "react-hot-toast";

const App = () => {
  const dispatch =
    useDispatch();

  useEffect(() => {
    const accessToken =
      localStorage.getItem(
        "accessToken"
      );

    // No token
    if (!accessToken)
      return;

    const restoreAuth =
      async () => {
        try {
          const res =
            await getMeAPI();

          dispatch(
            loginSuccess({
              user:
                res.data
                  .data ||
                res.data,
              accessToken,
            })
          );
        } catch  {
          console.log(
            "Session expired"
          );

          dispatch(
            logout()
          );
        }
      };

    restoreAuth();
  }, [dispatch]);

  return (
    <>
      <AppRoutes />

      <Toaster
        position="top-right"
        reverseOrder={
          false
        }
      />
    </>
  );
};

export default App;