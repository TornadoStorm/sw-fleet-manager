import { useAuthStore } from "@/lib/stores/auth-store";
import { beforeEach, describe, expect, it, vi } from "vitest";

const defaultState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    hydrated: false,
};

describe("useAuthStore login", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        useAuthStore.setState(defaultState);
    });

    it("sets authenticated state on successful login", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: true,
            json: async () => ({
                user: { username: "captain", roles: ["admin"] },
            }),
        } as unknown as Response);

        const result = await useAuthStore.getState().login("captain", "password");
        const state = useAuthStore.getState();

        expect(result).toBe(true);
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual({ username: "captain", roles: ["admin"] });
        expect(state.error).toBeNull();
        expect(state.hydrated).toBe(true);
    });

    it("uses API error message when response is not ok", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: false,
            json: async () => ({ error: "Invalid credentials" }),
        } as unknown as Response);

        const result = await useAuthStore.getState().login("captain", "bad-password");
        const state = useAuthStore.getState();

        expect(result).toBe(false);
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.error).toBe("Invalid credentials");
    });

    it("falls back to a default error when non-JSON error body is returned", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: false,
            json: async () => {
                throw new Error("not-json");
            },
        } as unknown as Response);

        const result = await useAuthStore.getState().login("captain", "bad-password");
        const state = useAuthStore.getState();

        expect(result).toBe(false);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe("Unable to log in.");
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
    });

    it("sets network error when fetch throws", async () => {
        vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));

        const result = await useAuthStore.getState().login("captain", "password");
        const state = useAuthStore.getState();

        expect(result).toBe(false);
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.error).toBe("Network error while logging in.");
    });
});

describe("useAuthStore initSession", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        useAuthStore.setState(defaultState);
    });

    it("sets authenticated user when /api/me succeeds", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: true,
            json: async () => ({ user: { username: "captain", roles: ["admin"] } }),
        } as unknown as Response);

        await useAuthStore.getState().initSession();
        const state = useAuthStore.getState();

        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual({ username: "captain", roles: ["admin"] });
        expect(state.hydrated).toBe(true);
    });

    it("marks user unauthenticated when /api/me returns 401", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: false,
            json: async () => ({ error: "Unauthenticated." }),
        } as unknown as Response);

        await useAuthStore.getState().initSession();
        const state = useAuthStore.getState();

        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.hydrated).toBe(true);
    });

    it("hydrates only once to avoid duplicate /api/me calls", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: false,
            json: async () => ({ error: "Unauthenticated." }),
        } as unknown as Response);

        await useAuthStore.getState().initSession();
        await useAuthStore.getState().initSession();

        expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
});

describe("useAuthStore logout", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        useAuthStore.setState(defaultState);
    });

    it("clears user state even if logout endpoint fails", async () => {
        useAuthStore.setState({
            ...defaultState,
            hydrated: true,
            isAuthenticated: true,
            user: { username: "captain", roles: ["admin"] },
        });

        vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("failed"));

        await useAuthStore.getState().logout();
        const state = useAuthStore.getState();

        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.hydrated).toBe(true);
    });
});
