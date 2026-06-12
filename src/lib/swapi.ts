const SWAPI_BASE_URL = 'https://swapi.info/api';
const SWAPI_REVALIDATE_SECONDS = 60 * 60 * 24;

async function fetchSwapi<T extends object = Record<string, unknown>>(
  path: string,
): Promise<T | null> {
  try {
    const response = await fetch(`${SWAPI_BASE_URL}${path}`, {
      cache: 'force-cache',
      next: {
        revalidate: SWAPI_REVALIDATE_SECONDS,
        tags: ['swapi-metadata'],
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as unknown;

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return null;
    }

    return payload as T;
  } catch {
    return null;
  }
}

export interface StarshipMetadata {
  name: string;
  model: string;
  manufacturer: string;
  cost_in_credits: string;
  length: string;
  max_atmosphering_speed: string;
  crew: string;
  passengers: string;
  cargo_capacity: string;
  consumables: string;
  hyperdrive_rating: string;
  MGLT: string;
  starship_class: string;
  pilots: string[];
  films: string[];
  created: string;
  edited: string;
  url: string;
}

export function fetchStarshipModelMetadata(modelId: number) {
  return fetchSwapi<StarshipMetadata>(`/starships/${modelId}`);
}

export interface PlanetMetadata {
  name: string;
  rotation_period: string;
  orbital_period: string;
  diameter: string;
  climate: string;
  gravity: string;
  terrain: string;
  surface_water: string;
  population: string;
  residents: string[];
  films: string[];
  created: string;
  edited: string;
  url: string;
}

export function fetchPlanetMetadata(locationId: number) {
  return fetchSwapi<PlanetMetadata>(`/planets/${locationId}`);
}
