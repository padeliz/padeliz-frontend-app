import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import EventsList from '@/components/Events/EventsList';
import { EVENTS_CHIP_SCROLL_STYLE } from '@/services/eventsListLayout';
let mockUser: { id: string } | null = null;

jest.mock('@/context/auth', () => ({
  useAuth: () => ({ user: mockUser, isLoading: false }),
}));

jest.mock('@/services/hooks/useEvents', () => ({
  useEventCount: () => 0,
  useEventsPager: () => ({
    events: [require('@/testing/fixtures').makeEvent()],
    isInitialLoading: false,
    loadingMore: false,
    error: null,
    hasMore: false,
    total: 3,
    loadMore: jest.fn(),
    refetch: jest.fn(),
  }),
}));

jest.mock('@/services/events', () => ({
  fetchFilterOptions: jest.fn(async () => ({
    clubs: [{ id_club: 1, name: 'Club A' }],
    unpaid_count: 0,
    has_lottery_winner: false,
  })),
}));

describe('EventsList', () => {
  beforeEach(() => {
    mockUser = null;
  });

  it('uses shared chip scroll layout with flexShrink 0', () => {
    render(<EventsList onSelectEvent={jest.fn()} />);

    expect(EVENTS_CHIP_SCROLL_STYLE.flexShrink).toBe(0);
    expect(screen.getByTestId('events-filter-chips')).toBeTruthy();
    expect(screen.getByTestId('chip-membership')).toBeTruthy();
    expect(screen.getByText("I'm Registered")).toBeTruthy();
  });

  it('gives the events list ScrollView flex 1', async () => {
    render(<EventsList onSelectEvent={jest.fn()} />);

    await waitFor(() => expect(screen.getByTestId('events-list-scroll')).toBeTruthy());
    expect(screen.getByTestId('events-list-scroll').props.style).toMatchObject({ flex: 1 });
  });

  it('resets membership filter and closes clubs sheet when the user changes', async () => {
    mockUser = { id: '1' };
    const { rerender } = render(<EventsList onSelectEvent={jest.fn()} />);

    await waitFor(() => expect(screen.getByTestId('chip-clubs')).toBeTruthy());
    fireEvent.press(screen.getByTestId('chip-membership'));
    fireEvent.press(screen.getByTestId('chip-clubs'));
    expect(screen.getByTestId('clubs-sheet')).toBeTruthy();

    mockUser = { id: '2' };
    rerender(<EventsList onSelectEvent={jest.fn()} />);

    await waitFor(() => {
      expect(screen.queryByTestId('clubs-sheet')).toBeNull();
      expect(screen.queryByTestId('events-count-label')).toBeNull();
    });
  });

  it('resets filters when the user signs out', async () => {
    mockUser = { id: '1' };
    const { rerender } = render(<EventsList onSelectEvent={jest.fn()} />);

    await waitFor(() => expect(screen.getByTestId('chip-membership')).toBeTruthy());
    fireEvent.press(screen.getByTestId('chip-membership'));
    expect(screen.getByTestId('events-count-label')).toBeTruthy();

    mockUser = null;
    rerender(<EventsList onSelectEvent={jest.fn()} />);

    await waitFor(() => expect(screen.queryByTestId('events-count-label')).toBeNull());
  });

  it('navigates with optional slug segment in the detail path', async () => {
    const onSelectEvent = jest.fn();
    render(<EventsList onSelectEvent={onSelectEvent} />);

    await waitFor(() => expect(screen.getByTestId('event-card-42')).toBeTruthy());
    fireEvent.press(screen.getByTestId('event-card-42'));

    expect(onSelectEvent).toHaveBeenCalledWith('/event/42/tour-org-minitour-21');
  });
});
