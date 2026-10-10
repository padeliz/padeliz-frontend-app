import React from 'react';
import { render, screen } from '@testing-library/react-native';
import StepRacketExperience, {
  SPORT_ICON_NAMES,
} from '@/components/LevelAssessment/StepRacketExperience';
import {
  RACKET_SPORTS,
  formReducer,
  initialFormState,
} from '@/services/levelAssessmentForm';
import * as Colors from '@/constants/Colors';

describe('StepRacketExperience sport icons', () => {
  it('maps every racket sport to a MaterialCommunityIcons glyph', () => {
    expect(SPORT_ICON_NAMES).toEqual({
      padel: 'star',
      tennis: 'tennis',
      badminton: 'badminton',
      squash: 'racquetball',
      'ping-pong': 'table-tennis',
      pickleball: 'baseball',
    });
    expect(Object.keys(SPORT_ICON_NAMES).sort()).toEqual(
      RACKET_SPORTS.map((s) => s.id).sort()
    );
  });

  it('renders one MaterialCommunityIcons per sport using the map', () => {
    const { UNSAFE_root } = render(
      <StepRacketExperience state={initialFormState} dispatch={jest.fn()} />
    );

    const icons = UNSAFE_root.findAll(
      (node) => (node.type as unknown) === 'MaterialCommunityIcons'
    );
    const names = icons
      .map((n) => n.props.name as string)
      .filter((name) => name !== 'check');

    expect(names).toEqual(RACKET_SPORTS.map((s) => SPORT_ICON_NAMES[s.id]));
  });
});

describe('StepRacketExperience dirty borders', () => {
  it('marks level/metrics dirty without wrapping the sport OptionCard', () => {
    let state = formReducer(initialFormState, { type: 'TOGGLE_SPORT', sport: 'padel' });
    state = formReducer(state, {
      type: 'SET_RACKET',
      sport: 'padel',
      patch: { level: 'advanced', matches_played: '10' },
    });

    render(
      <StepRacketExperience
        state={state}
        dispatch={jest.fn()}
        dirtyKeys={new Set(['racket:padel'])}
      />
    );

    const level = screen.getByTestId('racket-padel-level');
    expect(JSON.stringify(level.props.style)).toContain(Colors.YELLOW);

    const section = screen.getByTestId('racket-padel');
    expect(JSON.stringify(section.props.style ?? {})).not.toContain(Colors.YELLOW);
  });
});
