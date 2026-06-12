import { requireAuthenticatedUser } from "@/lib/api/require-auth-user";

export async function GET(): Promise<Response> {
    const user = await requireAuthenticatedUser();

    if (!user) {
        return Response.json({ error: "Unauthenticated." }, { status: 401 });
    }

    return Response.json({ user }, { status: 200 });
}
