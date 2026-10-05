import React from 'react';
import { render, screen } from '@testing-library/react-native';
import PaymentDetailsCard from '@/components/Registration/PaymentDetailsCard';

describe('PaymentDetailsCard', () => {
  it('shows named redemptions instead of a flat student discount line', () => {
    render(
      <PaymentDetailsCard
        lines={[
          {
            label: 'Students Rookies',
            fee: 60,
            redemptions: [
              { name: 'Student', amount_ron: 15 },
              { name: 'Referred', amount_ron: 10 },
            ],
          },
        ]}
      />
    );

    expect(screen.getByTestId('payment-redemption-Student')).toBeTruthy();
    expect(screen.getByTestId('payment-redemption-Referred')).toBeTruthy();
    expect(screen.getByTestId('payment-details-total')).toHaveTextContent('RON 35');
    expect(screen.queryByText('Student Discount')).toBeNull();
  });

  it('drops Fee suffix and keeps status as plain text without pay-for-it', () => {
    render(
      <PaymentDetailsCard
        lines={[{ label: 'Students Rookies', fee: 45 }]}
        statusLabel="Open"
        dateLabel="15 Jun"
      />
    );

    expect(screen.getByText('Students Rookies')).toBeTruthy();
    expect(screen.queryByText(/Fee$/)).toBeNull();
    expect(screen.getByTestId('payment-details-card-status')).toHaveTextContent('Open');
    expect(screen.queryByTestId('pay-for-it')).toBeNull();
  });
});
