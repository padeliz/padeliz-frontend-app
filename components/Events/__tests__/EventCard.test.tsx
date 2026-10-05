import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import EventCard from '@/components/Events/EventCard';
import type { EventCardData } from '@/types/types';

const baseEvent: EventCardData = {
  id: '42',
  title: 'Minitour',
  location: 'Arena',
  date: '15 June 2099',
  coverImage: { uri: 'https://example.com/cover.png' },
  status: 'none',
  timing: 'upcoming',
  badges: [
    { key: 'pending_payment', label: 'Pending Payment' },
    { key: 'lottery_winner', label: 'Lottery Winner' },
    { key: 'new', label: 'New' },
  ],
};

describe('EventCard', () => {
  it('renders remote cover, stacked badges, and no description body', () => {
    const onPress = jest.fn();
    render(<EventCard event={baseEvent} onPress={onPress} />);

    expect(screen.getByTestId('event-card-cover')).toBeTruthy();
    expect(screen.queryByTestId('event-card-cover-empty')).toBeNull();
    expect(screen.getByTestId('event-card-badges')).toBeTruthy();
    expect(screen.getByTestId('event-badge-pending_payment')).toBeTruthy();
    expect(screen.getByTestId('event-badge-lottery_winner')).toBeTruthy();
    expect(screen.getByTestId('event-badge-new')).toBeTruthy();
    expect(screen.getByText('Pending Payment')).toBeTruthy();
    expect(screen.getByText('Lottery Winner')).toBeTruthy();
    expect(screen.getByText('New')).toBeTruthy();
    expect(screen.queryByText(/Join us/i)).toBeNull();

    fireEvent.press(screen.getByTestId('event-card-42'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders an empty cover area when coverImage is null', () => {
    render(<EventCard event={{ ...baseEvent, coverImage: null }} />);
    expect(screen.getByTestId('event-card-cover-empty')).toBeTruthy();
    expect(screen.queryByTestId('event-card-cover')).toBeNull();
  });

  it('renders without badges when none provided', () => {
    const { badges: _omit, ...noBadges } = baseEvent;
    render(<EventCard event={noBadges} />);
    expect(screen.queryByTestId('event-card-badges')).toBeNull();
  });
});
