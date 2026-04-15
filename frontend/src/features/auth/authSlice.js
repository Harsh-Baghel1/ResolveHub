import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  accessToken: localStorage.getItem("accessToken") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
  state.user = action.payload.user;
  state.accessToken = action.payload.accessToken;

  localStorage.setItem("accessToken", action.payload.accessToken);
  localStorage.setItem("user", JSON.stringify(action.payload.user)); // ✅ ADD
},

    logout: (state) => {
      state.user = null;
      state.accessToken = null;

      localStorage.removeItem("accessToken");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;