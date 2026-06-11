import { clearSessionCookie } from "@/lib/auth/session";
import type { LoginErrorResponse } from "@/lib/auth/types";
import type { NextApiRequest, NextApiResponse } from "next";

interface LogoutResponse {
    ok: true;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<LogoutResponse | LoginErrorResponse>) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method not allowed." });
    }

    res.setHeader("Set-Cookie", clearSessionCookie());

    return res.status(200).json({ ok: true });
}