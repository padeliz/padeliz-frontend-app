import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import CancelRegistrationModal from '@/components/Registration/CancelRegistrationModal';

describe('CancelRegistrationModal', () => {
  it('shows division checkboxes for a single registration', () => {
    render(
      <CancelRegistrationModal
        visible
        registrations={[{ id: 501, label: 'Students Rookies' }]}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    );

    expect(
      screen.getByText(
        'Choose which divisions to cancel. This frees those spots for other players.'
      )
    ).toBeTruthy();
    expect(screen.getByTestId('cancel-reg-501')).toBeTruthy();
    expect(screen.getByTestId('cancel-reg-divider')).toBeTruthy();
    expect(
      screen.getByText("Why you're cancelling your registration?")
    ).toBeTruthy();
  });

  it('requires a reason and at least one division before confirming', () => {
    const onConfirm = jest.fn();
    render(
      <CancelRegistrationModal
        visible
        registrations={[
          { id: 501, label: 'A' },
          { id: 502, label: 'B' },
        ]}
        onClose={jest.fn()}
        onConfirm={onConfirm}
      />
    );

    fireEvent.press(screen.getByTestId('cancel-registration-confirm'));
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('cancel-reg-501'));
    fireEvent.press(screen.getByTestId('cancel-reason-injury_or_illness'));
    fireEvent.press(screen.getByTestId('cancel-registration-confirm'));

    expect(onConfirm).toHaveBeenCalledWith('injury_or_illness', [502]);
  });

  it('disables secondary dismiss while submitting', () => {
    const onClose = jest.fn();
    render(
      <CancelRegistrationModal
        visible
        submitting
        registrations={[{ id: 501, label: 'Students Rookies' }]}
        onClose={onClose}
        onConfirm={jest.fn()}
      />
    );

    fireEvent.press(screen.getByTestId('cancel-registration-dismiss'));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId('cancel-registration-dismiss')).toBeDisabled();
  });
});
