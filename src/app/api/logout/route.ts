import { clearSessionCookie } from "@/lib/auth/session";

interface LogoutResponse {
    ok: true;
}

export async function POST(): Promise<Response> {
    return Response.json(
        { ok: true } satisfies LogoutResponse,
        {
            status: 200,
            headers: {
                "Set-Cookie": clearSessionCookie(),
            },
        },
    );
}
