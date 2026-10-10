import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import LevelBandScale from '@/components/Level/LevelBandScale';
import type { Level } from '@/types/api';

const levels: Level[] = [
  { id_level: 31, name: 'Division 3 Low', level_min: '3.99', level_max: '3.67' },
  { id_level: 32, name: 'Division 3 Mid', level_min: '3.66', level_max: '3.34' },
  { id_level: 33, name: 'Division 3 High', level_min: '3.33', level_max: '3.00' },
  { id_level: 21, name: 'Division 2 Low', level_min: '2.99', level_max: '2.67' },
];

const pointerLeft = () =>
  StyleSheet.flatten(screen.getByTestId('level-band-pointer').props.style).left;

describe('LevelBandScale', () => {
  it('renders three labelled segments for the division family', () => {
    render(<LevelBandScale bandName="Division 3 Mid" level="3.50" levels={levels} />);

    expect(screen.getByTestId('level-band-segment-low')).toBeTruthy();
    expect(screen.getByTestId('level-band-segment-mid')).toBeTruthy();
    expect(screen.getByTestId('level-band-segment-high')).toBeTruthy();
    expect(screen.getByText('Low')).toBeTruthy();
    expect(screen.getByText('Mid')).toBeTruthy();
    expect(screen.getByText('High')).toBeTruthy();
  });

  it('puts N.99 at the left and N.00 at the right of the inverted axis', () => {
    const { rerender } = render(
      <LevelBandScale bandName="Division 3 Low" level="3.99" levels={levels} />
    );
    expect(pointerLeft()).toBe('0%');

    rerender(<LevelBandScale bandName="Division 3 High" level="3.00" levels={levels} />);
    expect(pointerLeft()).toBe('100%');
  });

  it('places a mid level in the middle', () => {
    render(<LevelBandScale bandName="Division 3 Mid" level="3.495" levels={levels} />);
    expect(parseFloat(String(pointerLeft()))).toBeCloseTo(50, 3);
  });

  it('renders nothing when the band has no division number or no levels', () => {
    const { rerender } = render(
      <LevelBandScale bandName="Advanced" level="3.50" levels={levels} />
    );
    expect(screen.queryByTestId('level-band-scale')).toBeNull();

    rerender(<LevelBandScale bandName="Division 3 Mid" level="3.50" levels={null} />);
    expect(screen.queryByTestId('level-band-scale')).toBeNull();
  });
});
