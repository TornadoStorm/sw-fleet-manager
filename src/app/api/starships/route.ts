import { requireAuthenticatedUser } from "@/lib/api/require-auth-user";
import type { Starship, StarshipWithMetadata } from "@/lib/auth/types";
import { MOCK_STARSHIPS } from "@/lib/starships/mock-starships";
import { canManageStarship } from "@/lib/starships/permissions";
import { fetchPlanetMetadata, fetchStarshipModelMetadata } from "@/lib/swapi";

const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function parseIntegerQueryParam(value: string | null, defaultValue: number): number {
    if (!value) {
        return defaultValue;
    }

    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed) || parsed < 0) {
        return defaultValue;
    }

    return parsed;
}

function sortStarships(starships: Starship[]): Starship[] {
    return [...starships].sort((left, right) => left.title.localeCompare(right.title));
}

async function enrichStarship(starship: Starship): Promise<StarshipWithMetadata> {
    const [modelMetadata, locationMetadata] = await Promise.all([
        fetchStarshipModelMetadata(starship.modelId),
        fetchPlanetMetadata(starship.location),
    ]);

    return {
        ...starship,
        modelMetadata,
        locationMetadata,
    };
}

export async function GET(request: Request): Promise<Response> {
    const user = await requireAuthenticatedUser();

    if (!user) {
        return Response.json({ error: "Unauthenticated." }, { status: 401 });
    }

    const url = new URL(request.url);
    const offset = parseIntegerQueryParam(url.searchParams.get("offset"), DEFAULT_OFFSET);
    const requestedLimit = parseIntegerQueryParam(url.searchParams.get("limit"), DEFAULT_LIMIT);
    const limit = Math.max(0, Math.min(requestedLimit, MAX_LIMIT));

    const manageableStarships = sortStarships(
        MOCK_STARSHIPS.filter((starship) => canManageStarship(user, starship)),
    );
    const total = manageableStarships.length;
    const paginatedStarships = manageableStarships.slice(offset, offset + limit);

    // This may cause a burst of requests to the SWAPI, but since this is a mock implementation with a small dataset, it's acceptable for now. In a real implementation, we would want to optimize this by batching requests or caching metadata.
    const items = await Promise.all(paginatedStarships.map((starship) => enrichStarship(starship)));

    return Response.json(
        {
            items,
            pagination: {
                offset,
                limit,
                total,
                hasMore: offset + limit < total,
            },
        },
        { status: 200 },
    );
}
