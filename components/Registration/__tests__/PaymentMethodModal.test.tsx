import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import PaymentMethodModal from '@/components/Registration/PaymentMethodModal';

describe('PaymentMethodModal', () => {
  it('disables close while busy', () => {
    const onClose = jest.fn();
    render(
      <PaymentMethodModal
        visible
        busy
        bankSettings={null}
        onClose={onClose}
        onStartNetopia={jest.fn()}
        onSubmitBankProof={jest.fn()}
      />
    );

    fireEvent.press(screen.getByTestId('close-payment-method'));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId('close-payment-method')).toBeDisabled();
  });
});
