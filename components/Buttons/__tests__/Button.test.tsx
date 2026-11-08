import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import Button from '@/components/Buttons/Button';
import * as Colors from '@/constants/Colors';

describe('Button', () => {
  it('shows indicator and disables press while loading', () => {
    const onPress = jest.fn();
    render(<Button label="Save" onPress={onPress} loading testID="save-btn" />);

    expect(screen.getByTestId('save-btn-loading')).toBeTruthy();
    expect(screen.queryByText('Save')).toBeNull();
    fireEvent.press(screen.getByTestId('save-btn'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('uses gray surface for disabled prop', () => {
    const onPress = jest.fn();
    render(<Button label="Go" disabled onPress={onPress} testID="disabled-btn" />);
    const btn = screen.getByTestId('disabled-btn');
    expect(btn).toHaveStyle({ backgroundColor: Colors.INACTIVE });
    expect(btn.props.accessibilityState.disabled).toBe(true);
    fireEvent.press(btn);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('uses gray surface for variant=disabled', () => {
    render(<Button label="Nope" variant="disabled" testID="variant-disabled" />);
    const btn = screen.getByTestId('variant-disabled');
    expect(btn).toHaveStyle({ backgroundColor: Colors.INACTIVE });
    expect(btn.props.accessibilityState.disabled).toBe(true);
  });
});
