import React from 'react';
import { render } from '@testing-library/react-native';
import StatusBanner from '@/components/Feedback/StatusBanner';

function iconNames(root: ReturnType<typeof render>['UNSAFE_root']): string[] {
  return root
    .findAll((n) => (n.type as unknown) === 'MaterialCommunityIcons')
    .map((n) => n.props.name as string);
}

describe('StatusBanner', () => {
  it.each([
    ['success', 'check-circle'],
    ['warning', 'alert'],
    ['error', 'close-circle'],
  ] as const)('uses MaterialCommunityIcons "%s" -> %s', (variant, expected) => {
    const { UNSAFE_root, getByText } = render(<StatusBanner variant={variant} message="msg" />);
    expect(getByText('msg')).toBeTruthy();
    expect(iconNames(UNSAFE_root)).toEqual([expected]);
  });

  it('shows a spinner instead of an icon when loading', () => {
    const { UNSAFE_root } = render(<StatusBanner variant="loading" message="Loading" />);
    expect(iconNames(UNSAFE_root)).toEqual([]);
  });
});
