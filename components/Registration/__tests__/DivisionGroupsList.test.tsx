import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import DivisionGroupsList from '@/components/Registration/DivisionGroupsList';
import type { DivisionDetails } from '@/types/types';

const divisions: DivisionDetails[] = [
  {
    id: 7,
    name: 'Students Rookies',
    price: 45,
    description: '',
    num_spots: 10,
    isEligible: true,
    isActive: true,
    color: '#2E7D32',
    playingStart: '10:00',
    playingEnd: '12:00',
  },
  {
    id: 8,
    name: 'Intermediate',
    price: 60,
    description: '',
    num_spots: 8,
    isEligible: false,
    isActive: true,
    color: '#1565C0',
    playingStart: '12:00',
    playingEnd: '14:00',
  },
];

describe('DivisionGroupsList', () => {
  it('readonly renders grouped divisions without any action controls', () => {
    const onToggle = jest.fn();
    render(
      <DivisionGroupsList
        readonly
        divisions={divisions}
        divisionStates={{ 7: 'paid' }}
        onToggle={onToggle}
      />
    );

    expect(screen.getByText('Playing 10:00 - 12:00')).toBeTruthy();
    expect(screen.getByText('Playing 12:00 - 14:00')).toBeTruthy();
    expect(screen.getByText('Students Rookies')).toBeTruthy();
    expect(screen.getByTestId('division-badge-7')).toBeTruthy();
    expect(screen.getByText('RON 60/player')).toBeTruthy();
    expect(screen.queryByTestId('division-toggle-7')).toBeNull();
    expect(screen.queryByTestId('division-paid-7')).toBeNull();
    expect(screen.queryByText('Not Eligible')).toBeNull();
    expect(screen.queryByText('Select')).toBeNull();
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('interactive mode still toggles', () => {
    const onToggle = jest.fn();
    render(<DivisionGroupsList divisions={divisions} onToggle={onToggle} />);

    fireEvent.press(screen.getByTestId('division-toggle-7'));
    expect(onToggle).toHaveBeenCalledWith(divisions[0]);
    expect(screen.getByText('Not Eligible')).toBeTruthy();
  });
});
