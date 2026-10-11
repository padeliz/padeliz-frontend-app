import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import CheckoutPaymentsList from '@/components/Registration/CheckoutPaymentsList';
import type { EventRegistrationCheckout } from '@/types/api';

const coverage = [
  {
    registration_id: 501,
    event_division_id: 7,
    division_title: 'Students Rookies',
    division_color: '#123456',
    amount_ron: 45,
  },
];

function makeCheckout(
  overrides: Partial<EventRegistrationCheckout> = {}
): EventRegistrationCheckout {
  return {
    id_checkout: 901,
    event_id: 42,
    player_user_id: 9,
    status: 'open',
    total_amount: 45,
    payment_method: null,
    paid_at: null,
    inserted_at: 1_700_000_000,
    updated_at: 1_700_000_000,
    items: [],
    payment_attempts: [],
    payment_proofs: [],
    ...overrides,
  };
}

describe('CheckoutPaymentsList', () => {
  it('labels Online card / Bank transfer, shows date and coverage, and maps status pills', () => {
    render(
      <CheckoutPaymentsList
        checkouts={[
          makeCheckout({
            payment_attempts: [
              {
                id_payment_attempt: 1,
                amount: 45,
                status: 'started',
                order_id: 'ORD-1',
                ntp_id: 'NTP-1',
                inserted_at: 1_700_000_100,
                coverage,
              },
              {
                id_payment_attempt: 2,
                amount: 45,
                status: 'succeeded',
                order_id: 'ORD-2',
                inserted_at: 1_700_000_200,
                coverage,
              },
              {
                id_payment_attempt: 3,
                amount: 45,
                status: 'failed',
                order_id: 'ORD-3',
                error_message: 'Card declined',
                inserted_at: 1_700_000_300,
                coverage,
              },
              {
                id_payment_attempt: 4,
                amount: 45,
                status: 'superseded',
                order_id: 'ORD-4',
                inserted_at: 1_700_000_050,
                coverage,
              },
            ],
            payment_proofs: [
              {
                id_payment_proof: 11,
                url: 'https://example.com/proof.png',
                review_status: 'pending',
                review_message: null,
                reviewed_at: null,
                inserted_at: 1_700_000_400,
                coverage,
              },
              {
                id_payment_proof: 12,
                url: 'https://example.com/ok.png',
                review_status: 'approved',
                review_message: 'Looks good',
                reviewed_at: 1_700_000_500,
                inserted_at: 1_700_000_450,
                coverage,
              },
              {
                id_payment_proof: 13,
                url: null,
                review_status: 'rejected',
                review_message: 'Blurry',
                reviewed_at: 1_700_000_600,
                inserted_at: 1_700_000_550,
                coverage,
              },
            ],
          }),
        ]}
      />
    );

    fireEvent.press(screen.getByTestId('payments-see-more'));

    expect(screen.getAllByText('Online card').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bank transfer').length).toBeGreaterThan(0);
    expect(screen.getByTestId('attempt-1-action')).toHaveTextContent('Pending');
    expect(screen.getByTestId('attempt-2-action')).toHaveTextContent('Paid');
    expect(screen.getByTestId('attempt-3-action')).toHaveTextContent('Failed');
    expect(screen.getByTestId('attempt-4-status')).toHaveTextContent('superseded');
    expect(screen.queryByTestId('attempt-4-action')).toBeNull();
    expect(screen.getByTestId('proof-11-action')).toHaveTextContent('Pending');
    expect(screen.queryByTestId('proof-11-cancel-proof')).toBeNull();
    expect(screen.queryByText('Cancel proof')).toBeNull();
    expect(screen.getByTestId('proof-12-action')).toHaveTextContent('Paid');
    expect(screen.getByTestId('proof-13-action')).toHaveTextContent('Rejected');
    expect(screen.getByTestId('attempt-1-coverage')).toBeTruthy();
  });

  it('opens Close-only detail modals without redirect controls', () => {
    render(
      <CheckoutPaymentsList
        checkouts={[
          makeCheckout({
            payment_attempts: [
              {
                id_payment_attempt: 1,
                amount: 45,
                status: 'pending',
                order_id: 'ORD-1',
                ntp_id: 'NTP-9',
                redirect_url: 'https://pay.example/continue',
                error_message: 'Waiting',
                inserted_at: 1_700_000_100,
                coverage,
              },
            ],
          }),
        ]}
      />
    );

    fireEvent.press(screen.getByTestId('attempt-1'));
    expect(screen.getByTestId('payment-record-detail-modal')).toBeTruthy();
    expect(screen.getByTestId('detail-status')).toHaveTextContent('pending');
    expect(screen.getByTestId('detail-amount')).toHaveTextContent('RON 45');
    expect(screen.getByTestId('detail-order-id')).toHaveTextContent('ORD-1');
    expect(screen.getByTestId('detail-ntp-id')).toHaveTextContent('NTP-9');
    expect(screen.getByTestId('detail-started')).toBeTruthy();
    expect(screen.getByTestId('detail-error-message')).toHaveTextContent('Waiting');
    expect(screen.getByTestId('detail-divisions')).toBeTruthy();
    expect(screen.queryByText(/continue/i)).toBeNull();
    expect(screen.queryByText(/redirect/i)).toBeNull();
    expect(screen.getByTestId('payment-record-detail-close')).toBeTruthy();
  });

  it('shows bank approved/rejected modal fields', () => {
    render(
      <CheckoutPaymentsList
        checkouts={[
          makeCheckout({
            payment_proofs: [
              {
                id_payment_proof: 12,
                url: 'https://example.com/ok.png',
                review_status: 'approved',
                review_message: 'Looks good',
                reviewed_at: 1_700_000_500,
                inserted_at: 1_700_000_450,
                coverage,
              },
            ],
          }),
        ]}
      />
    );

    fireEvent.press(screen.getByTestId('proof-12'));
    expect(screen.getByTestId('detail-proof-image')).toBeTruthy();
    expect(screen.getByTestId('detail-submitted')).toBeTruthy();
    expect(screen.getByTestId('detail-reviewed')).toBeTruthy();
    expect(screen.getByTestId('detail-review-message')).toHaveTextContent('Looks good');
    expect(screen.getByTestId('payment-record-detail-close')).toBeTruthy();
  });

  it('shows only the first two rows until See more is pressed', () => {
    render(
      <CheckoutPaymentsList
        checkouts={[
          makeCheckout({
            payment_attempts: [
              { id_payment_attempt: 1, amount: 45, status: 'failed', order_id: 'ORD-1', inserted_at: 1_700_000_100, coverage },
              { id_payment_attempt: 2, amount: 45, status: 'failed', order_id: 'ORD-2', inserted_at: 1_700_000_200, coverage },
              { id_payment_attempt: 3, amount: 45, status: 'succeeded', order_id: 'ORD-3', inserted_at: 1_700_000_300, coverage },
            ],
          }),
        ]}
      />
    );

    // Sorted newest first: attempt-3, attempt-2 visible; attempt-1 hidden.
    expect(screen.getByTestId('attempt-3')).toBeTruthy();
    expect(screen.getByTestId('attempt-2')).toBeTruthy();
    expect(screen.queryByTestId('attempt-1')).toBeNull();

    fireEvent.press(screen.getByTestId('payments-see-more'));

    expect(screen.getByTestId('attempt-1')).toBeTruthy();
    expect(screen.queryByTestId('payments-see-more')).toBeNull();
  });

  it('hides See more when there are two rows or fewer', () => {
    render(
      <CheckoutPaymentsList
        checkouts={[
          makeCheckout({
            payment_attempts: [
              { id_payment_attempt: 1, amount: 45, status: 'failed', order_id: 'ORD-1', inserted_at: 1_700_000_100, coverage },
              { id_payment_attempt: 2, amount: 45, status: 'succeeded', order_id: 'ORD-2', inserted_at: 1_700_000_200, coverage },
            ],
          }),
        ]}
      />
    );

    expect(screen.getByTestId('attempt-1')).toBeTruthy();
    expect(screen.getByTestId('attempt-2')).toBeTruthy();
    expect(screen.queryByTestId('payments-see-more')).toBeNull();
  });

  it('opens the detail modal from the whole row with a method-only title', () => {
    render(
      <CheckoutPaymentsList
        checkouts={[
          makeCheckout({
            payment_proofs: [
              {
                id_payment_proof: 12,
                url: null,
                review_status: 'rejected',
                review_message: 'Blurry',
                reviewed_at: 1_700_000_600,
                inserted_at: 1_700_000_550,
                coverage,
              },
            ],
          }),
        ]}
      />
    );

    fireEvent.press(screen.getByTestId('proof-12'));

    const modal = within(screen.getByTestId('payment-record-detail-modal'));
    expect(modal.getByText('Bank transfer')).toBeTruthy();
    expect(modal.queryByText('Bank transfer · Rejected')).toBeNull();
    expect(modal.getByTestId('detail-status')).toHaveTextContent('rejected');
    expect(modal.queryByTestId('payment-record-cancel-proof')).toBeNull();
  });

  it('offers Cancel proof only inside the modal for pending bank proofs', () => {
    const onReset = jest.fn();
    render(
      <CheckoutPaymentsList
        onReset={onReset}
        checkouts={[
          makeCheckout({
            payment_proofs: [
              {
                id_payment_proof: 11,
                url: 'https://example.com/proof.png',
                review_status: 'pending',
                review_message: null,
                reviewed_at: null,
                inserted_at: 1_700_000_400,
                coverage,
              },
            ],
          }),
        ]}
      />
    );

    expect(screen.getByTestId('proof-11-action')).toHaveTextContent('Pending');
    expect(screen.queryByText('Cancel proof')).toBeNull();

    fireEvent.press(screen.getByTestId('proof-11'));
    expect(
      within(screen.getByTestId('payment-record-detail-modal')).getByText('Bank transfer')
    ).toBeTruthy();
    fireEvent.press(screen.getByTestId('payment-record-cancel-proof'));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('payment-record-cancel-proof')).toBeNull();
  });

  it('does not offer Cancel proof for online card pending attempts', () => {
    render(
      <CheckoutPaymentsList
        onReset={jest.fn()}
        checkouts={[
          makeCheckout({
            payment_attempts: [
              { id_payment_attempt: 1, amount: 45, status: 'pending', order_id: 'ORD-1', inserted_at: 1_700_000_100, coverage },
            ],
          }),
        ]}
      />
    );

    fireEvent.press(screen.getByTestId('attempt-1'));
    expect(
      within(screen.getByTestId('payment-record-detail-modal')).getByText('Online card')
    ).toBeTruthy();
    expect(screen.queryByTestId('payment-record-cancel-proof')).toBeNull();
  });
});
