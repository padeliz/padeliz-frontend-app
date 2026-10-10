import {
  eventDetailPath,
  discoveryPath,
  levelAssessmentPath,
  levelTargetPath,
  studentProofPath,
  eventRegistrationPath,
} from '@/utils/eventPaths';

describe('eventPaths', () => {
  it('builds detail paths with and without slug', () => {
    expect(eventDetailPath(9)).toBe('/event/9');
    expect(eventDetailPath(9, null)).toBe('/event/9');
    expect(eventDetailPath(9, '')).toBe('/event/9');
    expect(eventDetailPath(9, 'summer-open')).toBe('/event/9/summer-open');
  });

  it('builds level assessment, discovery and student proof paths', () => {
    expect(levelAssessmentPath(9)).toEqual({
      pathname: '/level-assessment',
      params: { eventId: '9' },
    });
    expect(levelAssessmentPath()).toEqual({
      pathname: '/level-assessment',
      params: {},
    });
    expect(discoveryPath('registration', 9)).toEqual({
      pathname: '/discovery',
      params: { target: 'registration', eventId: '9' },
    });
    expect(discoveryPath('assessment')).toEqual({
      pathname: '/discovery',
      params: { target: 'assessment' },
    });
    expect(studentProofPath()).toEqual({ pathname: '/student-proof', params: {} });
  });

  it('resolves the stored Discovery target', () => {
    expect(levelTargetPath('assessment', 9)).toEqual(levelAssessmentPath(9));
    expect(levelTargetPath('registration', 9)).toEqual(eventRegistrationPath(9));
    // Registration without an event cannot open registration.
    expect(levelTargetPath('registration')).toEqual(levelAssessmentPath());
  });

  it('no longer exports an eligibility path', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@/utils/eventPaths') as Record<string, unknown>;
    expect(mod.eventEligibilityPath).toBeUndefined();
  });

  it('builds registration path with and without initialStep', () => {
    expect(eventRegistrationPath(9)).toEqual({
      pathname: '/event/registration',
      params: { eventId: '9' },
    });
    expect(eventRegistrationPath(9, 2)).toEqual({
      pathname: '/event/registration',
      params: { eventId: '9', initialStep: '2' },
    });
    expect(eventRegistrationPath(9, 'payment')).toEqual({
      pathname: '/event/registration',
      params: { eventId: '9', initialStep: 'payment' },
    });
  });

  it('does not export eventSharePath', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@/utils/eventPaths') as Record<string, unknown>;
    expect(mod.eventSharePath).toBeUndefined();
  });
});
