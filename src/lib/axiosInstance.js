import axios from "axios";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

export const axiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  timeout: 30000,
});
