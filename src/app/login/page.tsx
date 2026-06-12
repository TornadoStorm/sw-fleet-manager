'use client';

import { RedirectIfAuthenticated } from '@/components/auth/redirect-if-authenticated';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button, Card, Field, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SubmitEvent, useState } from 'react';

function getSafeRedirectPath(redirectTo: string | null): string {
  if (!redirectTo) {
    return '/dashboard';
  }

  if (!redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
    return '/dashboard';
  }

  return redirectTo;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const clearError = useAuthStore((state) => state.clearError);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    const success = await login(username.trim(), password);

    if (success) {
      router.replace(getSafeRedirectPath(searchParams?.get('redirect') ?? null));
    }
  };

  return (
    <RedirectIfAuthenticated>
      <Stack minH="calc(100vh - 4rem)" align="center" justify="center" p={6}>
        <Card.Root w="full" maxW="md" p={6}>
          <Card.Body>
            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                <Stack gap={1}>
                  <Heading size="lg">Sign in</Heading>
                  <Text color="fg.muted">Use one of the mock server accounts.</Text>
                </Stack>

                <Field.Root required>
                  <Field.Label>Username</Field.Label>
                  <Input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Enter username"
                    autoComplete="username"
                  />
                </Field.Root>

                <Field.Root required>
                  <Field.Label>Password</Field.Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                  />
                </Field.Root>

                {error ? <Text color="red.500">{error}</Text> : null}

                <Button
                  type="submit"
                  loading={isLoading}
                  loadingText="Signing in"
                  colorPalette="blue"
                >
                  Sign in
                </Button>
              </Stack>
            </form>
          </Card.Body>
        </Card.Root>
      </Stack>
    </RedirectIfAuthenticated>
  );
}
