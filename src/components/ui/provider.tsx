'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';

interface ProviderProps {
  children: React.ReactNode;
}

export function Provider({ children }: ProviderProps) {
  return (
    <SessionProvider>
      <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
    </SessionProvider>
  );
}
