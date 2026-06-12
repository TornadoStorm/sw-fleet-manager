import type { AuthUser, Starship } from '@/lib/auth/types';
import { canManageStarship } from '@/lib/starships/permissions';
import { describe, expect, it } from 'vitest';

const baseShip: Starship = {
  title: 'Test Ship',
  modelId: 12,
  location: 1,
  roles: [],
  fleet: 'Death Squadron',
};

describe('canManageStarship', () => {
  it('grants access by fleet role', () => {
    const user: AuthUser = {
      username: 'darthvader',
      faction: 'Galactic Empire',
      roles: ['dark_lord'],
    };

    expect(canManageStarship(user, baseShip)).toBe(true);
  });

  it('grants access by starship role even when fleet role is missing', () => {
    const ship: Starship = {
      ...baseShip,
      roles: ['logistics_officer'],
    };
    const user: AuthUser = {
      username: 'user',
      faction: 'Galactic Empire',
      roles: ['logistics_officer'],
    };

    expect(canManageStarship(user, ship)).toBe(true);
  });

  it('denies access when faction does not match even if roles match', () => {
    const user: AuthUser = {
      username: 'rebel-user',
      faction: 'Rebel Alliance',
      roles: ['dark_lord'],
    };

    expect(canManageStarship(user, baseShip)).toBe(false);
  });

  it('denies access when user matches neither fleet nor starship roles', () => {
    const ship: Starship = {
      ...baseShip,
      roles: ['escort_commander'],
    };
    const user: AuthUser = {
      username: 'user',
      faction: 'Galactic Empire',
      roles: ['logistics_officer'],
    };

    expect(canManageStarship(user, ship)).toBe(false);
  });
});
