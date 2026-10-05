import React from 'react';
import { render, screen } from '@testing-library/react-native';
import DivisionColorBadge from '@/components/Events/DivisionColorBadge';
import * as Fonts from '@/constants/Fonts';

describe('DivisionColorBadge', () => {
  it('uses BODY_S and FONT_MEDIUM for the label', () => {
    render(<DivisionColorBadge name="Open" color="#2E7D32" testID="badge" />);
    const label = screen.getByText('Open');
    expect(label.props.style).toEqual(
      expect.objectContaining({
        fontSize: Fonts.BODY_S,
        fontFamily: Fonts.FONT_MEDIUM,
      })
    );
  });
});
