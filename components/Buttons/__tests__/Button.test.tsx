import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import Button from '@/components/Buttons/Button';

describe('Button loading', () => {
  it('shows indicator and disables press while loading', () => {
    const onPress = jest.fn();
    render(
      <Button label="Save" onPress={onPress} loading testID="save-btn" />
    );

    expect(screen.getByTestId('save-btn-loading')).toBeTruthy();
    expect(screen.queryByText('Save')).toBeNull();
    fireEvent.press(screen.getByTestId('save-btn'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
