import type { DefaultSession } from 'next-auth';
import type { Faction } from '@/lib/auth/types';

declare module 'next-auth' {
  interface User {
    username: string;
    fullname: string;
    faction: Faction;
    roles: string[];
  }

  interface Session {
    user: DefaultSession['user'] & {
      username: string;
      fullname: string;
      faction: Faction;
      roles: string[];
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username?: string;
    fullname?: string;
    faction?: Faction;
    roles?: string[];
  }
}
