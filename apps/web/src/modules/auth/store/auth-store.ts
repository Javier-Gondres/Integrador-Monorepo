"use client";

import { create } from "zustand";

import type { AuthUser } from "@/types";

type AuthStore = {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthReady: boolean;

  setAccessToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  setAuthReady: (ready: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  user: null,
  isAuthReady: false,

  setAccessToken: (accessToken) => set({ accessToken }),

  setUser: (user) => set({ user }),

  setAuthReady: (isAuthReady) => set({ isAuthReady }),

  clearAuth: () =>
    set({
      accessToken: null,
      user: null,
    }),
}));
