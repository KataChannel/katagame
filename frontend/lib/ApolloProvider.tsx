'use client';

import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import apolloClient from './apolloClient';
import type { ReactNode } from 'react';

export function ApolloProvider({ children }: { children: ReactNode }) {
  return (
    <BaseApolloProvider client={apolloClient}>
      {children}
    </BaseApolloProvider>
  );
}
