import { GET } from '@/app/api/starships/route';
import type { AuthUser } from '@/lib/auth/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthenticatedUserMock, fetchStarshipModelMetadataMock, fetchPlanetMetadataMock } =
  vi.hoisted(() => ({
    requireAuthenticatedUserMock: vi.fn(),
    fetchStarshipModelMetadataMock: vi.fn(),
    fetchPlanetMetadataMock: vi.fn(),
  }));

vi.mock('@/lib/api/require-auth-user', () => ({
  requireAuthenticatedUser: requireAuthenticatedUserMock,
}));

vi.mock('@/lib/swapi', () => ({
  fetchStarshipModelMetadata: fetchStarshipModelMetadataMock,
  fetchPlanetMetadata: fetchPlanetMetadataMock,
}));

describe('GET /api/starships', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchStarshipModelMetadataMock.mockImplementation(async (modelId: number) => ({ id: modelId }));
    fetchPlanetMetadataMock.mockImplementation(async (locationId: number) => ({ id: locationId }));
  });

  it('returns paginated manageable starships for authenticated users', async () => {
    const user: AuthUser = {
      username: 'user',
      faction: 'Galactic Empire',
      roles: ['logistics_officer'],
    };
    requireAuthenticatedUserMock.mockReturnValue(user);

    const request = new Request('http://localhost:3000/api/starships?offset=1&limit=1');
    const response = await GET(request);
    const payload = (await response.json()) as unknown;

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      items: [
        {
          title: 'TIE Fighter 2',
          modelId: 13,
          location: 8,
          roles: ['logistics_officer'],
          fleet: 'Imperial Remnant Fleet',
          modelMetadata: { id: 13 },
          locationMetadata: { id: 8 },
        },
      ],
      pagination: {
        offset: 1,
        limit: 1,
        total: 2,
        hasMore: false,
      },
    });
  });

  it('returns default pagination values for invalid query params', async () => {
    const user: AuthUser = {
      username: 'leia',
      faction: 'Rebel Alliance',
      roles: ['line_commander'],
    };
    requireAuthenticatedUserMock.mockReturnValue(user);

    const request = new Request('http://localhost:3000/api/starships?offset=-10&limit=-1');
    const response = await GET(request);

    const payload = (await response.json()) as {
      items: Array<{ title: string }>;
      pagination: { offset: number; limit: number; total: number; hasMore: boolean };
    };

    expect(response.status).toBe(200);
    expect(payload.pagination).toEqual({ offset: 0, limit: 10, total: 6, hasMore: false });
    expect(payload.items.map((item) => item.title)).toEqual([
      'A-Wing 1',
      'A-Wing 2',
      'B-Wing',
      'Escort Frigate 1',
      'Escort Frigate 2',
      'Mon Calamari Cruiser 1',
    ]);
  });

  it('returns 401 for unauthenticated requests', async () => {
    requireAuthenticatedUserMock.mockReturnValue(null);

    const request = new Request('http://localhost:3000/api/starships');
    const response = await GET(request);
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(401);
    expect(payload.error).toBe('Unauthenticated.');
  });
});
