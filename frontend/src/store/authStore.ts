import { create } from "zustand";
import { authApi } from "../api/api";

interface User {
  id: string;
  name: string;
  email: string;
  status: "student" | "teacher" | "admin";
}

interface AuthState {
  user: User | null;
  token: string | null;
  status: "student" | "teacher" | "admin" | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  clearMessages: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  status: null,
  isLoading: false,
  error: null,
  success: null,

  clearMessages: () => set({ error: null, success: null }),

  initialize: () => {
    const token = localStorage.getItem("auth_token");
    const userInfo = localStorage.getItem("user_info");
    if (token && userInfo) {
      try {
        const user = JSON.parse(userInfo);
        set({ token, user, status: user.status });
      } catch (e) {
        // Clear corrupt storage
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_info");
      }
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await authApi.login(credentials);
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_info", JSON.stringify(data.user));
      set({
        token: data.token,
        user: data.user,
        status: data.user.status,
        isLoading: false,
        success: "Login berhasil! Memuat dashboard...",
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || "Terjadi kesalahan saat login",
      });
      throw err;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await authApi.register(userData);
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_info", JSON.stringify(data.user));
      set({
        token: data.token,
        user: data.user,
        status: data.user.status,
        isLoading: false,
        success: "Registrasi berhasil! Memuat dashboard...",
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || "Terjadi kesalahan saat registrasi",
      });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_info");
    set({ user: null, token: null, status: null, error: null, success: null });
  },
}));
