import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// ============================
// FETCH COMPLAINTS
// ============================
export const fetchComplaints = createAsyncThunk(
  "complaint/fetch",
  async (type, { rejectWithValue }) => {
    try {
      let url = "/complaints/my";

      if (type === "admin") url = "/complaints/all";
      if (type === "agent") url = "/complaints/assigned";

      const res = await axiosInstance.get(url);

      return res.data.complaints;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.msg || "Error fetching complaints"
      );
    }
  }
);

// ============================
// CREATE COMPLAINT
// ============================
export const createComplaint = createAsyncThunk(
  "complaint/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/complaints", formData);
      return res.data.complaint;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.msg || "Error creating complaint"
      );
    }
  }
);

const complaintSlice = createSlice({
  name: "complaint",
  initialState: {
    loading: false,
    error: null,
    complaints: [],
  },
  reducers: {},

  extraReducers: (builder) => {
    builder

      // ============================
      // FETCH
      // ============================
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints = action.payload;
      })

      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ============================
      // CREATE
      // ============================
      .addCase(createComplaint.pending, (state) => {
        state.loading = true;
      })

      .addCase(createComplaint.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints.unshift(action.payload);
      })

      .addCase(createComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default complaintSlice.reducer;