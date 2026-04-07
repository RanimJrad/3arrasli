import axios from "axios";
import { getStoredUser } from "./auth";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const user = getStoredUser();

  if (user?.role) {
    config.headers["X-User-Role"] = user.role;
  }

  return config;
});

export default api;
