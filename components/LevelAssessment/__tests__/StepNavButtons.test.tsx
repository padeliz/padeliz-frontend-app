import React from 'react';
import { render, screen } from '@testing-library/react-native';
import StepNavButtons from '@/components/LevelAssessment/StepNavButtons';
import * as Colors from '@/constants/Colors';

describe('StepNavButtons', () => {
  it('renders disabled forward with inactive colors', () => {
    const { UNSAFE_root } = render(
      <StepNavButtons forwardLabel="Status" forwardDisabled />
    );

    expect(screen.getByTestId('step-forward-disabled')).toBeTruthy();
    const node = UNSAFE_root.findByProps({ testID: 'step-forward-disabled' });
    const flat = [node.props.style].flat(Infinity).filter(Boolean);
    expect(flat.some((s: { borderColor?: string }) => s.borderColor === Colors.INACTIVE)).toBe(
      true
    );
  });
});
