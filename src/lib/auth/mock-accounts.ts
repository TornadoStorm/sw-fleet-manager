import type { Faction } from '@/lib/auth/types';

interface MockAccount {
  username: string;
  fullname: string;
  password: string;
  faction: Faction;
  roles: string[];
}

const MOCK_ACCOUNTS: MockAccount[] = [
  {
    username: 'vader',
    fullname: 'Darth Vader',
    password: 'password',
    faction: 'Galactic Empire',
    roles: ['dark_lord'],
  },
  {
    username: 'moff',
    fullname: 'Moff Gideon',
    password: 'password',
    faction: 'Galactic Empire',
    roles: ['moff_gideon'],
  },
  {
    username: 'yoda',
    fullname: 'Master Yoda',
    password: 'password',
    faction: 'Rebel Alliance',
    roles: ['yoda'],
  },
  {
    username: 'leia',
    fullname: 'Leia Organa',
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
    fullname: account.fullname,
    faction: account.faction,
    roles: account.roles,
  };
}
