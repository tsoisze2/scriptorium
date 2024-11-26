import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const api = axios.create({
  baseURL: "/api", // Your base API URL
});

// Add an interceptor to attach the access token to all requests
api.interceptors.request.use(
  async (config) => {
    const { accessToken, refreshAccessToken } = useAuth();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add an interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { refreshAccessToken, logout } = useAuth();

    if (error.response?.status === 401) {
      try {
        await refreshAccessToken();
        return api.request(error.config); // Retry the failed request with the new token
      } catch {
        logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
