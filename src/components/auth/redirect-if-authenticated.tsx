'use client';

import { Box, Spinner } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface RedirectIfAuthenticatedProps {
  children: ReactNode;
}

export function RedirectIfAuthenticated({ children }: RedirectIfAuthenticatedProps) {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    router.replace('/dashboard');
  }, [status, router]);

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="50vh">
        <Spinner size="lg" />
      </Box>
    );
  }

  if (status === 'authenticated') {
    return null;
  }

  return <>{children}</>;
}
