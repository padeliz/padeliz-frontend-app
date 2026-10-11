import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import StepPending from '@/components/Registration/StepPending';
import type { EventDetails } from '@/types/types';

const event: EventDetails = {
  eventImage: { uri: 'https://example.com/e.png' },
  coverAspectRatio: 1.5,
  eventName: 'Minitour 21',
  date: '15 June 2099',
  dateShort: '15 Jun 2099',
  weekday: 'Monday',
  dateModalLines: ['15 June 2099 · Monday'],
  location: 'Padel Arena',
  locationAddress: 'Str. Exemplu 1',
  price: 'RON 45',
  schedule: [],
  eventDescription: 'Desc',
  organizerImage: null,
  organizerName: null,
  status: 'none',
  timing: 'upcoming',
};

describe('StepPending', () => {
  it('hides Registered box when there are no paid lines', () => {
    render(
      <StepPending
        event={event}
        registered={[]}
        totalPaid={0}
        pending={[
          {
            id: 1,
            name: 'Students Rookies',
            playingTime: '11:00 - 14:00',
            amount: 45,
            color: '#2E7D32',
          },
        ]}
        pendingDue={45}
        onCancelRegistrations={jest.fn()}
      />
    );

    expect(screen.queryByTestId('status-registered-block')).toBeNull();
    expect(screen.queryByText('No paid divisions yet.')).toBeNull();
    expect(screen.getByTestId('status-pending-block')).toBeTruthy();
    expect(screen.getByTestId('status-division-badge-1')).toBeTruthy();
    expect(screen.getByText('11:00 - 14:00').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#2E7D32' })])
    );
    expect(screen.queryByTestId('reset-payment-path')).toBeNull();
    expect(screen.getByTestId('open-cancel-registrations')).toBeTruthy();
  });

  it('shows Registered box when paid lines exist', () => {
    render(
      <StepPending
        event={event}
        registered={[
          { id: 1, name: 'Students Rookies', playingTime: '11:00 - 14:00', amount: 45 },
        ]}
        totalPaid={45}
        pending={[]}
        pendingDue={0}
      />
    );

    expect(screen.getByTestId('status-registered-block')).toBeTruthy();
    expect(screen.getByTestId('status-total-paid')).toHaveTextContent('RON 45');
  });

  it('keeps Cancel registration and never exposes Reset', () => {
    const onCancel = jest.fn();
    render(
      <StepPending
        event={event}
        registered={[]}
        totalPaid={0}
        pending={[]}
        pendingDue={0}
        onCancelRegistrations={onCancel}
      />
    );

    expect(screen.queryByTestId('reset-payment-path')).toBeNull();
    fireEvent.press(screen.getByTestId('open-cancel-registrations'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('does not render a reject message on the Status step', () => {
    render(
      <StepPending
        event={event}
        registered={[]}
        totalPaid={0}
        pending={[
          { id: 1, name: 'Students Rookies', playingTime: '11:00 - 14:00', amount: 45 },
        ]}
        pendingDue={45}
      />
    );

    expect(screen.queryByTestId('status-reject-message')).toBeNull();
  });
});
