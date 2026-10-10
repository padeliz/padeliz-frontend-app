import { eventEndDate, getEventStickyCta } from '@/services/eventCta';
import { productDateTimeToDate } from '@/services/dateRange';
import type { EventStatus } from '@/types/types';

// 2026-06-15 18:00 Bucharest (EEST, UTC+3) === 15:00Z
const event = {
  date: '2026-06-15',
  closing_time: '18:00:00',
  registration_allowed_until: Date.parse('2026-06-10T12:00:00Z') / 1000,
};

const BEFORE_REG_CLOSE = new Date('2026-06-09T09:00:00Z');
const AFTER_REG_CLOSE = new Date('2026-06-12T09:00:00Z'); // event still running later
const JUST_BEFORE_END = new Date('2026-06-15T14:59:59Z');
const AT_END = new Date('2026-06-15T15:00:00Z');

function cta(
  status: EventStatus,
  now: Date,
  opts: { isAuthed?: boolean; hasLevel?: boolean; hasParticipated?: boolean } = {}
) {
  return getEventStickyCta({
    status,
    event,
    hasPlayerLevel: opts.hasLevel ?? false,
    isAuthed: opts.isAuthed ?? true,
    hasParticipated: opts.hasParticipated ?? false,
    now,
  });
}

describe('eventEndDate', () => {
  it('resolves date + closing_time in Europe/Bucharest (summer, UTC+3)', () => {
    expect(eventEndDate(event).toISOString()).toBe('2026-06-15T15:00:00.000Z');
  });

  it('uses UTC+2 in winter', () => {
    expect(
      productDateTimeToDate('2026-01-20', '18:00:00').toISOString()
    ).toBe('2026-01-20T16:00:00.000Z');
  });
});

describe('getEventStickyCta', () => {
  describe('event end', () => {
    it('hides the CTA at and after eventEnd when the player did not participate', () => {
      const statuses: EventStatus[] = [
        'none',
        'pending_payment',
        'registration_pending',
      ];
      for (const status of statuses) {
        expect(cta(status, AT_END, { hasLevel: true })).toBeNull();
        expect(cta(status, new Date('2026-06-16T00:00:00Z'))).toBeNull();
      }
      expect(cta('none', AT_END, { isAuthed: false })).toBeNull();
    });

    it('shows grey disabled Participated when past and hasParticipated', () => {
      expect(cta('none', AT_END, { hasParticipated: true })).toEqual({
        label: 'Participated',
        variant: 'grey',
        disabled: true,
        target: null,
      });
      expect(
        cta('pending_payment', new Date('2026-06-16T00:00:00Z'), {
          hasParticipated: true,
        })
      ).toMatchObject({ label: 'Participated', disabled: true, variant: 'grey' });
    });

    it('still shows Pay Now one second before eventEnd (no calendar-day nulling)', () => {
      expect(cta('pending_payment', JUST_BEFORE_END)?.label).toBe('Pay Now');
    });

    it('does not null an ongoing event day before closing', () => {
      const ongoing = new Date('2026-06-15T09:00:00Z');
      const open = getEventStickyCta({
        status: 'none',
        event: { ...event, registration_allowed_until: Date.parse('2026-06-16T00:00:00Z') / 1000 },
        hasPlayerLevel: true,
        isAuthed: true,
        now: ongoing,
      });
      expect(open?.label).toBe('Register');
    });
  });

  describe('actionable mapping', () => {
    it('maps Register / Assess my level / Pay Now / pending', () => {
      expect(cta('none', BEFORE_REG_CLOSE, { hasLevel: true })).toMatchObject({
        label: 'Register',
        target: { screen: 'registration' },
      });
      expect(cta('none', BEFORE_REG_CLOSE)).toMatchObject({
        label: 'Assess my level',
        target: { screen: 'assessment' },
      });
      expect(cta('pending_payment', BEFORE_REG_CLOSE)).toMatchObject({
        label: 'Pay Now',
        target: { screen: 'registration', initialStep: '2' },
      });
      expect(cta('registration_pending', BEFORE_REG_CLOSE)).toMatchObject({
        label: 'Registration Review in Pending',
        target: { screen: 'registration', initialStep: '3' },
      });
    });

    it('keeps Register for a player with a level (a pending re-assessment never forces Assess)', () => {
      // The CTA only depends on whether a level exists, never on assessment status.
      expect(cta('none', BEFORE_REG_CLOSE, { hasLevel: true })?.label).toBe('Register');
      expect(cta('none', BEFORE_REG_CLOSE, { hasLevel: false })?.label).toBe(
        'Assess my level'
      );
    });

    it('returns null once registered', () => {
      expect(cta('registered', BEFORE_REG_CLOSE)).toBeNull();
    });

    it('gives guests Assess my level', () => {
      expect(
        cta('none', BEFORE_REG_CLOSE, { isAuthed: false, hasLevel: true })
      ).toMatchObject({ label: 'Assess my level' });
    });
  });

  describe('Registration closed', () => {
    it('disables Register for an authed player', () => {
      expect(cta('none', AFTER_REG_CLOSE, { hasLevel: true })).toEqual({
        label: 'Registration closed',
        disabled: true,
        target: null,
      });
    });

    it('disables Assess my level for an authed player', () => {
      expect(cta('none', AFTER_REG_CLOSE)).toMatchObject({
        label: 'Registration closed',
        disabled: true,
        target: null,
      });
    });

    it('disables Assess my level for a guest', () => {
      expect(cta('none', AFTER_REG_CLOSE, { isAuthed: false })).toMatchObject({
        label: 'Registration closed',
        disabled: true,
        target: null,
      });
    });

    it('closes exactly at registration_allowed_until', () => {
      const at = new Date(event.registration_allowed_until * 1000);
      expect(cta('none', at, { hasLevel: true })?.disabled).toBe(true);
      expect(
        cta('none', new Date(at.getTime() - 1000), { hasLevel: true })?.label
      ).toBe('Register');
    });

    it('keeps Pay Now after registration closed', () => {
      expect(cta('pending_payment', AFTER_REG_CLOSE)).toMatchObject({
        label: 'Pay Now',
        target: { screen: 'registration', initialStep: '2' },
      });
      expect(cta('pending_payment', AFTER_REG_CLOSE)?.disabled).toBeUndefined();
    });

    it('does not replace pending CTAs', () => {
      expect(cta('registration_pending', AFTER_REG_CLOSE)).toMatchObject({
        label: 'Registration Review in Pending',
      });
    });
  });
});
