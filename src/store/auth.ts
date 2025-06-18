import { create } from "zustand";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_premium: boolean;
  is_superuser: boolean;
  has_completed_onboarding: boolean;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  setTokens: (token: string, refreshToken: string, user: User) => void;
  clearTokens: () => void;
  isAuthenticated: () => boolean;
  isSuperuser: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  refreshToken:
    typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null,
  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null,

  setTokens: (token: string, refreshToken: string, user: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ token, refreshToken, user });
  },

  clearTokens: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    set({ token: null, refreshToken: null, user: null });
  },

  isAuthenticated: () => {
    const state = get();
    if (!state.token) return false;

    try {
      const payload = JSON.parse(atob(state.token.split(".")[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;

      // Token is considered valid if it has more than 5 minutes until expiry
      return timeUntilExpiry > 5 * 60 * 1000;
    } catch {
      return false;
    }
  },

  isSuperuser: () => {
    const state = get();
    return state.user?.is_superuser || false;
  },
}));
