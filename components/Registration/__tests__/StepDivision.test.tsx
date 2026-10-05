import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import StepDivision from '@/components/Registration/StepDivision';
import type { DivisionDetails, EventDetails } from '@/types/types';

const event: EventDetails = {
  eventImage: { uri: 'https://example.com/e.png' },
  eventName: 'Minitour 21',
  date: '15 June 2099',
  dateShort: '15 Jun 2099',
  weekday: 'Monday',
  location: 'Padel Arena',
  locationAddress: 'Str. Exemplu 1',
  price: 'RON 45',
  schedule: [],
  eventDescription: 'Desc',
  organizerImage: { uri: 'https://example.com/o.png' },
  organizerName: 'Org',
  status: 'none',
  timing: 'upcoming',
};

const divisions: DivisionDetails[] = [
  {
    id: 7,
    name: 'Students Rookies',
    price: 45,
    description: 'Playing 10:00 - 12:00',
    num_spots: 10,
    isEligible: true,
    isActive: true,
    playingStart: '10:00',
    playingEnd: '12:00',
  },
  {
    id: 8,
    name: 'Intermediate',
    price: 45,
    description: 'Playing 12:00 - 14:00',
    num_spots: 8,
    isEligible: true,
    isActive: true,
    playingStart: '12:00',
    playingEnd: '14:00',
  },
];

describe('StepDivision', () => {
  it('shows select hint and Select labels when unlocked', () => {
    const onToggle = jest.fn();
    render(
      <StepDivision
        event={event}
        divisions={divisions}
        selectedDivisionIds={[]}
        divisionStates={{}}
        onToggle={onToggle}
      />
    );

    expect(
      screen.getByText('Select one or more divisions to reserve, then continue.')
    ).toBeTruthy();
    expect(screen.getAllByText('Select')).toHaveLength(2);
    expect(screen.queryByText(/spots left/i)).toBeNull();
    expect(screen.queryByText('Reserved')).toBeNull();
    fireEvent.press(screen.getByTestId('division-toggle-7'));
    expect(onToggle).toHaveBeenCalledWith(divisions[0]);
  });

  it('shows only the lock banner when editLocked (no Locked button)', () => {
    const onToggle = jest.fn();
    render(
      <StepDivision
        event={event}
        divisions={divisions}
        selectedDivisionIds={[]}
        divisionStates={{ 7: 'reserved' }}
        onToggle={onToggle}
        editLocked
        lockMessage="Locked while proof is reviewed. Use Cancel proof on Payment."
      />
    );

    expect(screen.getByTestId('division-edit-locked')).toBeTruthy();
    expect(
      screen.getByText('Locked while proof is reviewed. Use Cancel proof on Payment.')
    ).toBeTruthy();
    expect(screen.queryByTestId('division-toggle-7')).toBeNull();
    expect(screen.queryByTestId('division-locked-7')).toBeNull();
    expect(screen.queryByText('Locked')).toBeNull();
    expect(
      screen.queryByText('Select one or more divisions to reserve, then continue.')
    ).toBeNull();
  });

  it('lock copy mentions Cancel proof / Payment, not Status reset', () => {
    render(
      <StepDivision
        event={event}
        divisions={divisions}
        selectedDivisionIds={[]}
        divisionStates={{}}
        onToggle={jest.fn()}
        editLocked
      />
    );

    const banner = screen.getByTestId('division-edit-locked');
    expect(banner.props.children).toMatch(/Cancel proof/i);
    expect(banner.props.children).toMatch(/Payment/i);
    expect(String(banner.props.children)).not.toMatch(/Status/i);
    expect(String(banner.props.children)).not.toMatch(/Reset/i);
  });

  it('shows Select/Remove and Paid right states without spots/Reserved text', () => {
    render(
      <StepDivision
        event={event}
        divisions={divisions}
        selectedDivisionIds={[8]}
        divisionStates={{ 7: 'paid', 8: 'reserved' }}
        onToggle={jest.fn()}
      />
    );

    expect(screen.getByTestId('division-paid-7')).toBeTruthy();
    expect(screen.getByTestId('division-toggle-8')).toBeTruthy();
    expect(screen.getByText('Remove')).toBeTruthy();
    expect(screen.queryByText(/spots left/i)).toBeNull();
    // Left-side Reserved label must not appear; Paid is the right control only.
    expect(screen.queryByText('Reserved')).toBeNull();
  });

  it('groups by different playing starts into multiple headers', () => {
    render(
      <StepDivision
        event={event}
        divisions={divisions}
        selectedDivisionIds={[]}
        divisionStates={{}}
        onToggle={jest.fn()}
      />
    );

    expect(screen.getByText('Playing 10:00 - 12:00')).toBeTruthy();
    expect(screen.getByText('Playing 12:00 - 14:00')).toBeTruthy();
    expect(screen.getByTestId('division-group-10:00|12:00')).toBeTruthy();
    expect(screen.getByTestId('division-group-12:00|14:00')).toBeTruthy();
  });

  it('keeps one group when playing starts match', () => {
    const sameStart: DivisionDetails[] = [
      { ...divisions[0], id: 7, playingStart: '11:00', playingEnd: '14:00' },
      { ...divisions[1], id: 8, playingStart: '11:00', playingEnd: '14:00' },
    ];
    render(
      <StepDivision
        event={event}
        divisions={sameStart}
        selectedDivisionIds={[]}
        divisionStates={{}}
        onToggle={jest.fn()}
      />
    );

    expect(screen.getAllByText('Playing 11:00 - 14:00')).toHaveLength(1);
    expect(screen.getByTestId('division-group-11:00|14:00')).toBeTruthy();
  });

  it('shows empty catalog message when no divisions', () => {
    render(
      <StepDivision
        event={event}
        divisions={[]}
        selectedDivisionIds={[]}
        divisionStates={{}}
        onToggle={jest.fn()}
      />
    );

    expect(screen.getByText('No divisions are open for this event yet.')).toBeTruthy();
  });
});
