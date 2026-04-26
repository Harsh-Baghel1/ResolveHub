// frontend/src/features/auth/authSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user:
    JSON.parse(
      localStorage.getItem("user")
    ) || null,

  accessToken:
    localStorage.getItem(
      "accessToken"
    ) || null,

  loading: false,
  error: null,
};

const authSlice =
  createSlice({
    name: "auth",
    initialState,

    reducers: {
      loginStart: (state) => {
        state.loading = true;
        state.error = null;
      },

      loginSuccess: (
        state,
        action
      ) => {
        state.loading = false;
        state.user =
          action.payload.user;
        state.accessToken =
          action.payload.accessToken;
        state.error = null;

        localStorage.setItem(
          "accessToken",
          action.payload
            .accessToken
        );

        localStorage.setItem(
          "user",
          JSON.stringify(
            action.payload.user
          )
        );
      },

      loginFail: (
        state,
        action
      ) => {
        state.loading = false;
        state.error =
          action.payload;
      },

      logout: (state) => {
        state.user = null;
        state.accessToken =
          null;
        state.loading = false;
        state.error = null;

        localStorage.removeItem(
          "accessToken"
        );
        localStorage.removeItem(
          "refreshToken"
        );
        localStorage.removeItem(
          "user"
        );
      },
    },
  });

export const {
  loginStart,
  loginSuccess,
  loginFail,
  logout,
} = authSlice.actions;

export default authSlice.reducer;