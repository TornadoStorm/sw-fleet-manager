import type { PlanetMetadata, StarshipMetadata } from '@/lib/swapi';

export type Faction = 'Rebel Alliance' | 'Galactic Empire';

export interface AuthUser {
  username: string;
  fullname: string;
  faction: Faction;
  roles: string[];
}

export interface LoginRequestBody {
  username?: string;
  password?: string;
}

export interface AuthSessionResponse {
  user: AuthUser;
}

export interface LoginErrorResponse {
  error: string;
}

export interface Fleet {
  name: string;
  faction: Faction;
  managingRoles: string[];
}

export interface Starship {
  title: string;
  modelId: number;
  location: number;
  roles: string[];
  fleet: string;
}

export interface StarshipWithMetadata extends Starship {
  modelMetadata: StarshipMetadata | null;
  locationMetadata: PlanetMetadata | null;
}

export interface StarshipPagination {
  offset: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ManageableStarshipsResponse {
  items: StarshipWithMetadata[];
  pagination: StarshipPagination;
}
