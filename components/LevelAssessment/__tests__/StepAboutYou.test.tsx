import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import StepAboutYou from '@/components/LevelAssessment/StepAboutYou';
import {
  initialFormState,
  yearOfBirthOptions,
} from '@/services/levelAssessmentForm';
import type { Level } from '@/types/api';
import * as Colors from '@/constants/Colors';

const mockLevels: Level[] = [
  { id_level: 12, name: 'Division 2 Mid', level_min: '2.66', level_max: '2.34' },
  { id_level: 22, name: 'Division 3 Mid', level_min: '3.66', level_max: '3.34' },
];

jest.mock('@/services/hooks/useLevels', () => ({
  useLevels: () => ({ data: mockLevels, loading: false, error: null, refetch: jest.fn() }),
}));

describe('StepAboutYou', () => {
  it('renders labels and help_text without placeholders or intro copy', () => {
    render(<StepAboutYou state={initialFormState} dispatch={jest.fn()} />);

    expect(screen.getByText('Playtomic')).toBeTruthy();
    expect(screen.getByText('Paste your Playtomic profile URL.')).toBeTruthy();
    expect(screen.getByText('Rankedin')).toBeTruthy();
    expect(screen.getByText('Paste your Rankedin profile URL.')).toBeTruthy();
    expect(screen.getByText('Year of birth')).toBeTruthy();
    expect(screen.getByTestId('field-big-tournament-division')).toBeTruthy();
    expect(screen.queryByText(/Tell us more/i)).toBeNull();
    expect(screen.queryByText(/All of these/i)).toBeNull();

    expect(screen.queryByPlaceholderText(/YYYY/i)).toBeNull();
    expect(screen.queryByPlaceholderText(/Digits from/i)).toBeNull();
  });

  it('offers YOB options from now-6 down to now-80', () => {
    const options = yearOfBirthOptions(new Date('2026-10-09T00:00:00Z'));
    expect(options[0]?.value).toBe('2020');
    expect(options[options.length - 1]?.value).toBe('1946');
    expect(options).toHaveLength(75);
  });

  it('marks dirty fields', () => {
    render(
      <StepAboutYou
        state={{ ...initialFormState, playtomicId: '1' }}
        dispatch={jest.fn()}
        dirtyKeys={new Set(['playtomicId'])}
      />
    );
    expect(screen.getByTestId('field-playtomic-id')).toBeTruthy();
  });

  it('does not put a dirty border on the gender row wrapper', () => {
    render(
      <StepAboutYou
        state={{ ...initialFormState, gender: 'female' }}
        dispatch={jest.fn()}
        dirtyKeys={new Set(['gender'])}
      />
    );
    const row = screen.getByTestId('field-gender');
    expect(row.props.style).toEqual(
      expect.not.objectContaining({ borderColor: Colors.YELLOW })
    );
  });

  it('dispatches year of birth from the dropdown', () => {
    const dispatch = jest.fn();
    render(<StepAboutYou state={initialFormState} dispatch={dispatch} />);
    fireEvent.press(screen.getByTestId('field-year-of-birth'));
    const newest = String(new Date().getFullYear() - 6);
    fireEvent.press(screen.getByTestId(`field-year-of-birth-option-${newest}`));
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_FIELD',
      field: 'yearOfBirth',
      value: newest,
    });
  });

  it('dispatches big tournament division as a level id', () => {
    const dispatch = jest.fn();
    render(<StepAboutYou state={initialFormState} dispatch={dispatch} />);
    fireEvent.press(screen.getByTestId('field-big-tournament-division'));
    fireEvent.press(screen.getByTestId('field-big-tournament-division-option-12'));
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_FIELD',
      field: 'bigTournamentDivision',
      value: '12',
    });
  });
});
