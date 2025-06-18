import axios from "axios";
import type {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "../store/auth";

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  error?: string;
  lesson?: string[];
}

export type ApiError = AxiosError<ApiErrorResponse>;

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.garaad.org/api",
  headers: {
    "Content-Type": "application/json",
  },
}) as AxiosInstance;

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        // Handle unauthorized
        useAuthStore.getState().clearTokens();
      }
    }
    return Promise.reject(error);
  }
);

export { api, type AxiosError };
