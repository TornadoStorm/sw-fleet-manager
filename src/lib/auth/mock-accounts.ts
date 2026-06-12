import type { Faction } from '@/lib/auth/types';

interface MockAccount {
  username: string;
  password: string;
  faction: Faction;
  roles: string[];
}

const MOCK_ACCOUNTS: MockAccount[] = [
  {
    username: 'vader',
    password: 'password',
    faction: 'Galactic Empire',
    roles: ['dark_lord'],
  },
  {
    username: 'moff',
    password: 'password',
    faction: 'Galactic Empire',
    roles: ['moff_gideon'],
  },
  {
    username: 'yoda',
    password: 'password',
    faction: 'Rebel Alliance',
    roles: ['yoda'],
  },
  {
    username: 'leia',
    password: 'password',
    faction: 'Rebel Alliance',
    roles: ['line_commander'],
  },
];

export function findMockAccount(
  username: string,
  password: string,
): Omit<MockAccount, 'password'> | null {
  const account = MOCK_ACCOUNTS.find(
    (candidate) => candidate.username === username && candidate.password === password,
  );

  if (!account) {
    return null;
  }

  return {
    username: account.username,
    faction: account.faction,
    roles: account.roles,
  };
}
