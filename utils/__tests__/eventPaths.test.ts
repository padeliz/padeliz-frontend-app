import {
  eventDetailPath,
  eventEligibilityPath,
  eventRegistrationPath,
} from '@/utils/eventPaths';

describe('eventPaths', () => {
  it('builds detail paths with and without slug', () => {
    expect(eventDetailPath(9)).toBe('/event/9');
    expect(eventDetailPath(9, null)).toBe('/event/9');
    expect(eventDetailPath(9, '')).toBe('/event/9');
    expect(eventDetailPath(9, 'summer-open')).toBe('/event/9/summer-open');
  });

  it('builds eligibility path', () => {
    expect(eventEligibilityPath(9)).toEqual({
      pathname: '/event/eligibility-check',
      params: { eventId: '9' },
    });
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
