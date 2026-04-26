// frontend/src/features/auth/authAPI.js

import axiosInstance from "../../api/axiosInstance";
import ENDPOINTS from "../../api/endpoints";

export const loginAPI = (
  data
) => {
  return axiosInstance.post(
    ENDPOINTS.AUTH.LOGIN,
    data
  );
};

export const signupAPI = (
  data
) => {
  return axiosInstance.post(
    ENDPOINTS.AUTH.REGISTER,
    data
  );
};

export const getMeAPI =
  () => {
    return axiosInstance.get(
      ENDPOINTS.AUTH.ME
    );
  };