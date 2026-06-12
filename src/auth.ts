import { findMockAccount } from '@/lib/auth/mock-accounts';
import type { Faction } from '@/lib/auth/types';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 8,
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize(credentials) {
        const username = typeof credentials?.username === 'string' ? credentials.username : '';
        const password = typeof credentials?.password === 'string' ? credentials.password : '';

        if (!username || !password) {
          return null;
        }

        const account = findMockAccount(username, password);

        if (!account) {
          return null;
        }

        return {
          id: account.username,
          username: account.username,
          fullname: account.fullname,
          faction: account.faction,
          roles: account.roles,
          name: account.fullname,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.fullname = user.fullname;
        token.faction = user.faction as Faction;
        token.roles = Array.isArray(user.roles) ? user.roles : [];
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.username = typeof token.username === 'string' ? token.username : '';
        session.user.fullname = typeof token.fullname === 'string' ? token.fullname : '';
        session.user.faction = token.faction as Faction;
        session.user.roles = Array.isArray(token.roles)
          ? token.roles.filter((role): role is string => typeof role === 'string')
          : [];
      }

      return session;
    },
  },
});

export { handlers, signIn, signOut, auth };
