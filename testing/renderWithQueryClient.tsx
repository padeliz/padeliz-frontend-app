import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createTestQueryClient } from '@/testing/createTestQueryClient';

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

export function createQueryWrapper(client: QueryClient) {
  return function QueryWrapper({ children }: { children: React.ReactNode }) {
    return (
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </SafeAreaProvider>
    );
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
