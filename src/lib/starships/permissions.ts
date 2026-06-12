import type { AuthUser, Starship } from '@/lib/auth/types';
import { findFleetByName } from '@/lib/starships/mock-fleets';

function hasAnyRole(userRoles: string[], managedRoles: string[]): boolean {
  return managedRoles.some((role) => userRoles.includes(role));
}

export function canManageStarship(user: AuthUser, starship: Starship): boolean {
  const fleet = findFleetByName(starship.fleet);

  if (!fleet) {
    return false;
  }

  if (user.faction !== fleet.faction) {
    return false;
  }

  // RBAC union rule: fleet-level OR ship-level role grants access.
  return hasAnyRole(user.roles, fleet.managingRoles) || hasAnyRole(user.roles, starship.roles);
}
