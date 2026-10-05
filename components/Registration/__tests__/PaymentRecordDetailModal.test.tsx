import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import PaymentRecordDetailModal from '@/components/Registration/PaymentRecordDetailModal';

describe('PaymentRecordDetailModal', () => {
  it('disables close while cancelling proof', () => {
    const onClose = jest.fn();
    render(
      <PaymentRecordDetailModal
        visible
        cancelling
        onClose={onClose}
        onCancelProof={jest.fn()}
        detail={{
          kind: 'proof',
          title: 'Bank proof',
          status: 'awaiting_review',
          startedAt: null,
          submittedAt: null,
          reviewedAt: null,
          amount: 45,
          orderId: null,
          coverage: [],
          canCancelProof: true,
        }}
      />
    );

    fireEvent.press(screen.getByTestId('payment-record-detail-close'));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId('payment-record-detail-close')).toBeDisabled();
  });
});
