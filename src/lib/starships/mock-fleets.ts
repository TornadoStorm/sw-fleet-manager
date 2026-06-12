import type { Fleet } from '@/lib/auth/types';

export const MOCK_FLEETS: Fleet[] = [
  {
    name: 'Death Squadron',
    faction: 'Galactic Empire',
    managingRoles: ['dark_lord'],
  },
  {
    name: 'Imperial Remnant Fleet',
    faction: 'Galactic Empire',
    managingRoles: ['dark_lord', 'moff_gideon'],
  },
  {
    name: 'Starfighter Assault Fleet',
    faction: 'Rebel Alliance',
    managingRoles: ['yoda'],
  },
  {
    name: 'Heavy Alliance Line Fleet',
    faction: 'Rebel Alliance',
    managingRoles: ['line_commander', 'yoda'],
  },
];

export function findFleetByName(name: string): Fleet | undefined {
  return MOCK_FLEETS.find((fleet) => fleet.name === name);
}
