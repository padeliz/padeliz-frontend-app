import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';
import { renderWithQueryClient } from '@/testing/renderWithQueryClient';
import EventsList from '@/components/Events/EventsList';

jest.mock('@/context/auth', () => ({
  useAuth: () => ({
    user: null,
    requestLogin: jest.fn(),
  }),
}));

const mockPagerState = {
  events: [] as unknown[],
  isInitialLoading: false,
  loadingMore: false,
  error: null as Error | null,
  hasMore: false,
  total: 0,
  loadMore: jest.fn(),
  refetch: jest.fn(),
};

jest.mock('@/services/hooks/useEvents', () => ({
  useEventCount: () => 0,
  useEventsPager: () => ({ ...mockPagerState }),
}));

jest.mock('@/services/events', () => ({
  fetchFilterOptions: jest.fn(async () => ({
    clubs: [],
    unpaid_count: 0,
    has_lottery_winner: false,
  })),
}));

describe('EventsList compliance chrome', () => {
  beforeEach(() => {
    mockPagerState.events = [];
    mockPagerState.isInitialLoading = false;
    mockPagerState.error = null;
    mockPagerState.hasMore = false;
    mockPagerState.total = 0;
  });

  it('shows logos and legal links when the list is empty', async () => {
    renderWithQueryClient(
      <EventsList title="Events" onSelectEvent={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByTestId('compliance-logos-row')).toBeTruthy();
    });
    expect(screen.getByTestId('legal-links-row')).toBeTruthy();
    expect(screen.getByTestId('compliance-netopia-logo')).toBeTruthy();
    expect(screen.getByTestId('compliance-anpc-logo')).toBeTruthy();
  });

  it('shows logos when the list failed to load', async () => {
    mockPagerState.error = new Error('network down');
    renderWithQueryClient(
      <EventsList title="Events" onSelectEvent={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByTestId('compliance-logos-row')).toBeTruthy();
    });
    expect(screen.getByText('network down')).toBeTruthy();
  });
});
