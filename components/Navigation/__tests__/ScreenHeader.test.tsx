import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import ScreenHeader from '@/components/Navigation/ScreenHeader';

describe('ScreenHeader', () => {
  it('renders root variant title without back button', () => {
    render(<ScreenHeader title="Events" variant="root" />);

    expect(screen.getByTestId('screen-header-root')).toBeTruthy();
    expect(screen.getByText('Events')).toBeTruthy();
    expect(screen.queryByTestId('screen-header-back')).toBeNull();
  });

  it('renders stack variant with back and optional rightAction', () => {
    const onBack = jest.fn();
    render(
      <ScreenHeader
        title="Event Details"
        variant="stack"
        onBack={onBack}
        rightAction={<Text testID="header-right">Share</Text>}
      />
    );

    expect(screen.getByTestId('screen-header-stack')).toBeTruthy();
    expect(screen.getByText('Event Details')).toBeTruthy();
    expect(screen.getByTestId('header-right')).toBeTruthy();

    fireEvent.press(screen.getByTestId('screen-header-back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('does not use rounded-pill card chrome on either variant', () => {
    const { getByTestId, rerender } = render(
      <ScreenHeader title="Events" variant="root" />
    );
    expect(getByTestId('screen-header-root').props.style).toEqual(
      expect.not.objectContaining({ borderRadius: 12, borderWidth: 1 })
    );

    rerender(<ScreenHeader title="Stack" variant="stack" onBack={() => {}} />);
    const stackStyle = getByTestId('screen-header-stack').props.style;
    const flat = Array.isArray(stackStyle)
      ? Object.assign({}, ...stackStyle)
      : stackStyle;
    expect(flat.borderRadius).toBeUndefined();
    expect(flat.borderWidth).toBeUndefined();
    expect(flat.height).toBe(57);
  });
});
