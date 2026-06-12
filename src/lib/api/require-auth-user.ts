import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";
import { cookies } from "next/headers";

export async function requireAuthenticatedUser(): Promise<AuthUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
        return null;
    }

    return verifySessionToken(token);
}
