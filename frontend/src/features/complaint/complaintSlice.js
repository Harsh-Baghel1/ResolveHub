// frontend/src/features/complaint/complaintSlice.js

import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import axiosInstance from "../../api/axiosInstance";

import ENDPOINTS from "../../api/endpoints";

// ======================================
// FETCH COMPLAINTS
// role based:
// user  -> my complaints
// admin -> all complaints
// agent -> assigned complaints
// ======================================
export const fetchComplaints =
  createAsyncThunk(
    "complaint/fetchComplaints",

    async (
      role = "user",
      {
        rejectWithValue,
      }
    ) => {
      try {
        let url =
          ENDPOINTS
            .COMPLAINT
            .MY;

        if (
          role ===
          "admin"
        ) {
          url =
            ENDPOINTS
              .ADMIN
              .COMPLAINTS;
        }

        if (
          role ===
          "agent"
        ) {
          url =
            ENDPOINTS
              .COMPLAINT
              .ASSIGNED;
        }

        const res =
          await axiosInstance.get(
            url
          );

        return (
          res.data
            .complaints ||
          res.data.data ||
          []
        );
      } catch (err) {
        return rejectWithValue(
          err.response
            ?.data
            ?.message ||
            "Failed to fetch complaints"
        );
      }
    }
  );

// ======================================
// CREATE COMPLAINT
// ======================================
export const createComplaint =
  createAsyncThunk(
    "complaint/createComplaint",

    async (
      formData,
      {
        rejectWithValue,
      }
    ) => {
      try {
        const res =
          await axiosInstance.post(
            ENDPOINTS
              .COMPLAINT
              .CREATE,
            formData
          );

        return (
          res.data
            .complaint ||
          res.data.data
        );
      } catch (err) {
        return rejectWithValue(
          err.response
            ?.data
            ?.message ||
            "Failed to create complaint"
        );
      }
    }
  );

// ======================================
// SLICE
// ======================================
const complaintSlice =
  createSlice({
    name: "complaint",

    initialState: {
      complaints:
        [],
      loading:
        false,
      error:
        null,
    },

    reducers: {
      clearComplaintError:
        (
          state
        ) => {
          state.error =
            null;
        },
    },

    extraReducers: (
      builder
    ) => {
      builder

        // ==================
        // FETCH
        // ==================
        .addCase(
          fetchComplaints.pending,
          (
            state
          ) => {
            state.loading =
              true;

            state.error =
              null;
          }
        )

        .addCase(
          fetchComplaints.fulfilled,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.complaints =
              action.payload;
          }
        )

        .addCase(
          fetchComplaints.rejected,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.error =
              action.payload;
          }
        )

        // ==================
        // CREATE
        // ==================
        .addCase(
          createComplaint.pending,
          (
            state
          ) => {
            state.loading =
              true;

            state.error =
              null;
          }
        )

        .addCase(
          createComplaint.fulfilled,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.complaints.unshift(
              action.payload
            );
          }
        )

        .addCase(
          createComplaint.rejected,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.error =
              action.payload;
          }
        );
    },
  });

export const {
  clearComplaintError,
} =
  complaintSlice.actions;

export default complaintSlice.reducer;