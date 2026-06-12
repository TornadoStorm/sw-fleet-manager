import { requireAuthenticatedUser } from '@/lib/api/require-auth-user';
import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  getAccessibleStarships,
  parseIntegerQueryParam,
} from '@/lib/starships/accessible-starships';

export async function GET(request: Request): Promise<Response> {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return Response.json({ error: 'Unauthenticated.' }, { status: 401 });
  }

  const url = new URL(request.url);
  const offset = parseIntegerQueryParam(url.searchParams.get('offset'), DEFAULT_OFFSET);
  const requestedLimit = parseIntegerQueryParam(url.searchParams.get('limit'), DEFAULT_LIMIT);
  const payload = await getAccessibleStarships(user, {
    offset,
    limit: requestedLimit,
  });

  return Response.json(payload, { status: 200 });
}
