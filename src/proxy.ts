import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
    const hasSession = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);
    const { pathname } = request.nextUrl;

    if (pathname.startsWith("/dashboard") && !hasSession) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (pathname === "/login" && hasSession) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
};