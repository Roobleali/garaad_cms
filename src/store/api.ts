import axios from "axios";
import { useAuthStore } from "./auth";

const api = axios.create({
  baseURL: "https://api.garaad.org/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      // Try to refresh the token
      const response = await axios.post(
        "https://api.garaad.org/api/auth/token/refresh/",
        {
          refresh: refreshToken,
        }
      );

      const { access: newToken } = response.data;
      const user = JSON.parse(localStorage.getItem("user") || "null");
      useAuthStore.getState().setTokens(newToken, refreshToken, user);

      // Update the failed request with new token and retry
      originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
      return axios(originalRequest);
    } catch (refreshError) {
      // If refresh fails, clear tokens and reject
      useAuthStore.getState().clearTokens();
      return Promise.reject(refreshError);
    }
  }
);

export default api;
