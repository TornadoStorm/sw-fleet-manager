import { findMockAccount } from "@/lib/auth/mock-accounts";
import { createSessionCookie } from "@/lib/auth/session";
import type { LoginRequestBody } from "@/lib/auth/types";

export async function POST(request: Request): Promise<Response> {
    let body: LoginRequestBody;

    try {
        body = (await request.json()) as LoginRequestBody;
    } catch {
        return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { username, password } = body ?? {};

    if (!username || !password) {
        return Response.json({ error: "Username and password are required." }, { status: 400 });
    }

    const account = findMockAccount(username, password);

    if (!account) {
        return Response.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const user = {
        username: account.username,
        faction: account.faction,
        roles: account.roles,
    };

    return Response.json(
        { user },
        {
            status: 200,
            headers: {
                "Set-Cookie": createSessionCookie(user),
            },
        },
    );
}
