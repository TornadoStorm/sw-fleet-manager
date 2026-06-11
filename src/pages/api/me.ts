import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import type { AuthSessionResponse, LoginErrorResponse } from "@/lib/auth/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<AuthSessionResponse | LoginErrorResponse>,
) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method not allowed." });
    }

    const user = verifySessionToken(req.cookies[AUTH_COOKIE_NAME]);

    if (!user) {
        return res.status(401).json({ error: "Unauthenticated." });
    }

    return res.status(200).json({ user });
}