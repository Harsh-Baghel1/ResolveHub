// frontend/src/app/store.js

import {
  configureStore,
} from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import complaintReducer from "../features/complaint/complaintSlice";

// ======================================
// REDUX STORE
// ======================================
export const store =
  configureStore({
    reducer: {
      auth:
        authReducer,

      complaint:
        complaintReducer,
    },

    devTools:
      import.meta.env
        .MODE !==
      "production",
  });

// ======================================
// OPTIONAL TYPES / HELPERS
// (Useful later for hooks)
// ======================================

// useSelector(state => state.auth)
// useSelector(state => state.complaint)