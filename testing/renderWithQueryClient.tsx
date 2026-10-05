import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react-native';
import { createTestQueryClient } from '@/testing/createTestQueryClient';

export function createQueryWrapper(client: QueryClient) {
  return function QueryWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

export function renderWithQueryClient(
  ui: React.ReactElement,
  client: QueryClient = createTestQueryClient()
) {
  return { client, ...render(ui, { wrapper: createQueryWrapper(client) }) };
}

export function renderHookWithQueryClient<T>(
  hook: () => T,
  client: QueryClient = createTestQueryClient()
) {
  return {
    client,
    ...renderHook(hook, { wrapper: createQueryWrapper(client) }),
  };
}
