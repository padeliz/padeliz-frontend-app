import {
  PRODUCT_TIMEZONE,
  TIMING_TAB_ORDER,
  addDaysYmd,
  classifyTiming,
  defaultTimingIndex,
  rangeForTab,
  todayYmdBucharest,
} from '@/services/dateRange';

describe('dateRange Bucharest', () => {
  it('uses Europe/Bucharest for todayYmdBucharest via en-CA', () => {
    // 2026-03-15 22:30 UTC → already 2026-03-16 in Bucharest (UTC+2)
    const utcEvening = new Date('2026-03-15T22:30:00.000Z');
    const expected = utcEvening.toLocaleDateString('en-CA', {
      timeZone: PRODUCT_TIMEZONE,
    });
    expect(todayYmdBucharest(utcEvening)).toBe(expected);
    expect(expected).toBe('2026-03-16');
  });

  it('builds Past / Ongoing / Upcoming ranges from Bucharest today', () => {
    const now = new Date('2026-06-10T10:00:00.000Z');
    const today = todayYmdBucharest(now);

    expect(rangeForTab('ongoing', 3, now)).toEqual({
      date_from: today,
      date_to: today,
    });
    expect(rangeForTab('upcoming', 3, now)).toEqual({
      date_from: addDaysYmd(today, 1),
      date_to: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    });
    expect(rangeForTab('past', 3, now).date_to).toBe(addDaysYmd(today, -1));
  });

  it('classifies timing against Bucharest today', () => {
    const now = new Date('2026-06-10T10:00:00.000Z');
    const today = todayYmdBucharest(now);
    expect(classifyTiming(today, now)).toBe('ongoing');
    expect(classifyTiming(addDaysYmd(today, 1), now)).toBe('upcoming');
    expect(classifyTiming(addDaysYmd(today, -1), now)).toBe('past');
  });

  it('orders tabs Past→Ongoing→Upcoming and defaults Ongoing when visible', () => {
    expect(TIMING_TAB_ORDER).toEqual(['past', 'ongoing', 'upcoming']);
    expect(defaultTimingIndex(true)).toBe(1);
    expect(defaultTimingIndex(false)).toBe(2);
  });
});
