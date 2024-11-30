import axios from "axios";
// Create an Axios instance
const api = axios.create({
  baseURL: "/api", // Set the base URL for your APIs
});
// Add a request interceptor to include the access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken && !originalRequest._retry) {
        originalRequest._retry = true; // Prevent infinite retry loops
        try {
          // Call refresh API
          const { data } = await axios.post("/api/user/refresh", {
            refreshToken,
          });
          // Update access token in localStorage
          localStorage.setItem("accessToken", data.accessToken);
          // Update the failed request with the new access token and retry
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          // Clear tokens and redirect to login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/users/login";
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);
export default api;