import axios from "axios";

const api = axios.create({
  baseURL: "https://api.garaad.org/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token from localStorage if available
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
