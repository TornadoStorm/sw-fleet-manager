import type { AuthUser } from '@/lib/auth/types';
import { auth } from '@/auth';

export async function requireAuthenticatedUser(): Promise<AuthUser | null> {
  const session = await auth();
  const user = session?.user;

  if (!user?.username || !user.fullname || !user.faction || !Array.isArray(user.roles)) {
    return null;
  }

  return {
    username: user.username,
    fullname: user.fullname,
    faction: user.faction,
    roles: user.roles,
  };
}
