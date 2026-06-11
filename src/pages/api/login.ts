import { findMockAccount } from "@/lib/auth/mock-accounts";
import { createSessionCookie } from "@/lib/auth/session";
import type { AuthSessionResponse, LoginErrorResponse, LoginRequestBody } from "@/lib/auth/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<AuthSessionResponse | LoginErrorResponse>,
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method not allowed." });
    }

    const { username, password } = (req.body ?? {}) as LoginRequestBody;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    const account = findMockAccount(username, password);

    if (!account) {
        return res.status(401).json({ error: "Invalid username or password." });
    }

    const user = {
        username: account.username,
        roles: account.roles,
    };
    const sessionCookie = createSessionCookie(user);

    res.setHeader("Set-Cookie", sessionCookie);

    return res.status(200).json({
        user,
    });
}
