import type { AuthUser } from "@/lib/auth/types";
import { createHmac } from "node:crypto";

export const AUTH_COOKIE_NAME = "demo-auth-session";

const SESSION_TTL_SECONDS = 60 * 60 * 8;

interface SessionPayload {
    user: AuthUser;
    exp: number;
}

function getSessionSecret(): string {
    return process.env.AUTH_SESSION_SECRET ?? "demo-interview-secret-change-me";
}

function toBase64Url(value: string): string {
    return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string): string {
    return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string): string {
    return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function serializeCookie(value: string, maxAge: number): string {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return `${AUTH_COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function createSessionCookie(user: AuthUser): string {
    const payload: SessionPayload = {
        user,
        exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    };
    const encodedPayload = toBase64Url(JSON.stringify(payload));
    const signature = sign(encodedPayload);
    const token = `${encodedPayload}.${signature}`;

    return serializeCookie(token, SESSION_TTL_SECONDS);
}

export function clearSessionCookie(): string {
    return serializeCookie("", 0);
}

export function verifySessionToken(token: string | null | undefined): AuthUser | null {
    if (!token) {
        return null;
    }

    const [encodedPayload, signature] = token.split(".");

    if (!encodedPayload || !signature) {
        return null;
    }

    const expectedSignature = sign(encodedPayload);

    if (expectedSignature !== signature) {
        return null;
    }

    try {
        const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;

        if (!payload.user?.username || !Array.isArray(payload.user.roles)) {
            return null;
        }

        if (payload.exp <= Math.floor(Date.now() / 1000)) {
            return null;
        }

        return payload.user;
    } catch {
        return null;
    }
}