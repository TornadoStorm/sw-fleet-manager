import type {
  AuthUser,
  ManageableStarshipsResponse,
  Starship,
  StarshipWithMetadata,
} from '@/lib/auth/types';
import { fetchPlanetMetadata, fetchStarshipModelMetadata } from '@/lib/swapi';
import { MOCK_STARSHIPS } from './mock-starships';
import { canManageStarship } from './permissions';

export const DEFAULT_OFFSET = 0;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 50;

export interface AccessibleStarshipsQuery {
  offset?: number;
  limit?: number;
  search?: string;
  fleet?: string;
}

export function parseIntegerQueryParam(value: string | null, defaultValue: number): number {
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

function fuzzyTokenMatch(haystack: string, needle: string): boolean {
  if (!needle) {
    return true;
  }

  if (haystack.includes(needle)) {
    return true;
  }

  let needleIndex = 0;

  for (let index = 0; index < haystack.length && needleIndex < needle.length; index += 1) {
    if (haystack[index] === needle[needleIndex]) {
      needleIndex += 1;
    }
  }

  return needleIndex === needle.length;
}

function matchesSearchQuery(starship: StarshipWithMetadata, search: string): boolean {
  if (search) {
    const normalizedSearch = search.trim().toLowerCase();
    const searchableText = [starship.title, starship.fleet, starship.modelMetadata?.name]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matches = normalizedSearch
      .split(/\s+/)
      .filter(Boolean)
      .every((token) => fuzzyTokenMatch(searchableText, token));

    if (!matches) {
      return false;
    }
  }

  return true;
}

export async function getAccessibleStarships(
  user: AuthUser,
  query: AccessibleStarshipsQuery = {},
): Promise<ManageableStarshipsResponse> {
  const offset = Math.max(query.offset ?? DEFAULT_OFFSET, 0);
  const requestedLimit = query.limit ?? DEFAULT_LIMIT;
  const limit = Math.max(0, Math.min(requestedLimit, MAX_LIMIT));

  const manageableStarships = sortStarships(
    MOCK_STARSHIPS.filter((starship) => canManageStarship(user, starship)),
  );

  // Enrich all starships first to get model and location metadata for filtering
  const enrichedStarships = await Promise.all(
    manageableStarships.map((starship) => enrichStarship(starship)),
  );

  // Apply filters
  const search = query.search ?? '';
  const fleet = query.fleet ?? '';

  const filteredStarships = enrichedStarships.filter((starship) => {
    if (fleet && starship.fleet !== fleet) {
      return false;
    }

    if (!matchesSearchQuery(starship, search)) {
      return false;
    }

    return true;
  });

  const total = filteredStarships.length;
  const paginatedStarships = filteredStarships.slice(offset, offset + limit);

  return {
    items: paginatedStarships,
    pagination: {
      offset,
      limit,
      total,
      hasMore: offset + limit < total,
    },
  };
}
