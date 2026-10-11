import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import StepPayment from '@/components/Registration/StepPayment';
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

describe('StepPayment', () => {
  it('renders pay-for-it under the details card at full width', () => {
    const onPay = jest.fn();
    render(
      <StepPayment
        event={event}
        boxes={[
          {
            key: '901',
            statusLabel: 'Open',
            dateLabel: '15 Jun',
            lines: [{ label: 'Students Rookies', fee: 45 }],
            totalLabel: 'Total',
            showPay: true,
            payDisabled: false,
          },
        ]}
        checkouts={[]}
        onPayForIt={onPay}
      />
    );

    const pay = screen.getByTestId('pay-for-it');
    expect(pay).toBeTruthy();
    expect(pay.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ width: '100%' })])
    );
    fireEvent.press(pay);
    expect(onPay).toHaveBeenCalled();
  });

  it('does not render the shared division color chip on Order summary', () => {
    render(
      <StepPayment
        event={event}
        boxes={[
          {
            key: '901',
            statusLabel: 'Open',
            dateLabel: '15 Jun',
            lines: [{ label: 'Students Rookies', fee: 45 }],
            totalLabel: 'Total',
            showPay: true,
            payDisabled: false,
          },
        ]}
        checkouts={[]}
        onPayForIt={jest.fn()}
      />
    );

    expect(screen.getByText('Order summary')).toBeTruthy();
    expect(screen.queryByText('Payment Details')).toBeNull();
    expect(screen.queryByTestId(/division-badge-/)).toBeNull();
  });
});
