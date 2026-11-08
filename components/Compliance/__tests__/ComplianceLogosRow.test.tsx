import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import ComplianceLogosRow from '@/components/Compliance/ComplianceLogosRow';
import { ANPC_SAL_URL } from '@/constants/legalUrls';

describe('ComplianceLogosRow', () => {
  it('renders Netopia then ANPC with testIDs', () => {
    render(<ComplianceLogosRow />);
    expect(screen.getByTestId('compliance-logos-row')).toBeTruthy();
    expect(screen.getByTestId('compliance-netopia-logo')).toBeTruthy();
    expect(screen.getByTestId('compliance-anpc-logo')).toBeTruthy();
  });

  it('opens ANPC SAL URL and does not require Netopia press handler', () => {
    const openURL = jest
      .spyOn(Linking, 'openURL')
      .mockResolvedValue(undefined as never);
    render(<ComplianceLogosRow />);
    fireEvent.press(screen.getByTestId('compliance-anpc-logo'));
    expect(openURL).toHaveBeenCalledWith(ANPC_SAL_URL);
    openURL.mockRestore();
  });
});
