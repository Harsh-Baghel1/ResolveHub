import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

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
      return rejectWithValue(err.response?.data?.msg || "Error fetching");
    }
  }
);

//  CREATE COMPLAINT API CALL
export const createComplaint = createAsyncThunk(
  "complaint/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/complaints", formData);
      return res.data.complaint;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || "Error");
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
      .addCase(createComplaint.pending, (state) => {
        state.loading = true;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints.unshift(action.payload); // add new complaint
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});



export default complaintSlice.reducer;