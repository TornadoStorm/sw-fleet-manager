"use client";

import type { AuthSessionResponse, LoginErrorResponse } from "@/lib/auth/types";
import { create } from "zustand";

interface AuthState {
    user: AuthSessionResponse["user"] | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    hydrated: boolean;
    initSession: () => Promise<void>;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    hydrated: false,
    initSession: async () => {
        if (get().hydrated) {
            return;
        }

        try {
            const response = await fetch("/api/me", { method: "GET" });

            if (!response.ok) {
                set({ user: null, isAuthenticated: false, hydrated: true });
                return;
            }

            const data = (await response.json()) as AuthSessionResponse;

            set({ user: data.user, isAuthenticated: true, hydrated: true, error: null });
        } catch {
            set({ user: null, isAuthenticated: false, hydrated: true });
        }
    },
    login: async (username, password) => {
        set({ isLoading: true, error: null });

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorBody = (await response.json().catch(() => null)) as LoginErrorResponse | null;
                set({
                    isLoading: false,
                    isAuthenticated: false,
                    user: null,
                    error: errorBody?.error ?? "Unable to log in.",
                });
                return false;
            }

            const data = (await response.json()) as AuthSessionResponse;
            set({
                isLoading: false,
                isAuthenticated: true,
                user: data.user,
                error: null,
                hydrated: true,
            });
            return true;
        } catch {
            set({
                isLoading: false,
                isAuthenticated: false,
                user: null,
                error: "Network error while logging in.",
            });
            return false;
        }
    },
    logout: async () => {
        try {
            await fetch("/api/logout", {
                method: "POST",
            });
        } catch {
            // Ignore logout request failures and still clear client state.
        } finally {
            set({ user: null, isAuthenticated: false, error: null, hydrated: true });
        }
    },
    clearError: () => {
        set({ error: null });
    },
}));
