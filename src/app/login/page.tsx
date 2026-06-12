'use client';

import { RedirectIfAuthenticated } from '@/components/auth/redirect-if-authenticated';
import { Button, Card, Field, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SubmitEvent, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        username: username.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          result.error === 'CredentialsSignin'
            ? 'Invalid username or password.'
            : 'Unable to log in.',
        );
        return;
      }

      router.replace('/dashboard');
    } catch {
      setError('Network error while logging in.');
    } finally {
      setIsLoading(false);
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
                  <Text color="fg.muted">
                    Please enter your credentials to access the Star Wars Fleet Manager.
                  </Text>
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
