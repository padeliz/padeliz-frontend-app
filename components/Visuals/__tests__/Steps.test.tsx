import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Steps from '@/components/Visuals/Steps';

describe('Steps', () => {
  it('uses completedSteps for checkmarks when provided', () => {
    render(
      <Steps
        labels={['Sports', 'Details', 'Photo', 'Status']}
        currentStep={3}
        completedSteps={[1]}
        enabledSteps={[1, 2, 3, 4]}
      />
    );

    const root = screen.UNSAFE_root;
    const checks = root.findAll(
      (node) =>
        (node.type as unknown) === 'MaterialCommunityIcons' &&
        node.props.name === 'check'
    );
    expect(checks).toHaveLength(1);
  });

  it('falls back to positional completion when completedSteps is omitted', () => {
    render(
      <Steps
        labels={['One', 'Two', 'Three']}
        currentStep={3}
        enabledSteps={[1, 2, 3]}
      />
    );

    const root = screen.UNSAFE_root;
    const checks = root.findAll(
      (node) =>
        (node.type as unknown) === 'MaterialCommunityIcons' &&
        node.props.name === 'check'
    );
    expect(checks).toHaveLength(2);
  });

  it('shows loaders for multiple loadingSteps', () => {
    render(
      <Steps
        labels={['Sports', 'Details', 'Photo', 'Status']}
        currentStep={3}
        enabledSteps={[1, 2, 3, 4]}
        loadingSteps={[1, 2]}
      />
    );

    expect(screen.getByTestId('wizard-step-1-loading')).toBeTruthy();
    expect(screen.getByTestId('wizard-step-2-loading')).toBeTruthy();
    expect(screen.queryByTestId('wizard-step-3-loading')).toBeNull();
  });

  it('shows error X for errorSteps', () => {
    render(
      <Steps
        labels={['Sports', 'Details', 'Photo', 'Status']}
        currentStep={2}
        enabledSteps={[1, 2, 3, 4]}
        errorSteps={[1]}
      />
    );

    expect(screen.getByTestId('wizard-step-1-error')).toBeTruthy();
  });

  it('prefers loading over error on the same step', () => {
    render(
      <Steps
        labels={['Sports', 'Details', 'Photo', 'Status']}
        currentStep={2}
        enabledSteps={[1, 2, 3, 4]}
        loadingSteps={[1]}
        errorSteps={[1]}
      />
    );

    expect(screen.getByTestId('wizard-step-1-loading')).toBeTruthy();
    expect(screen.queryByTestId('wizard-step-1-error')).toBeNull();
  });
});
