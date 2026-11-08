import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import LegalLinksRow from '@/components/Compliance/LegalLinksRow';
import { legalUrl } from '@/constants/legalUrls';

describe('LegalLinksRow', () => {
  it('opens terms URL from legal site base', () => {
    const openURL = jest
      .spyOn(Linking, 'openURL')
      .mockResolvedValue(undefined as never);
    render(<LegalLinksRow />);
    fireEvent.press(screen.getByTestId('legal-link-terms'));
    expect(openURL).toHaveBeenCalledWith(legalUrl('terms'));
    openURL.mockRestore();
  });
});
