import {
  PRODUCT_TIMEZONE,
  TIMING_TAB_ORDER,
  addDaysYmd,
  classifyTiming,
  dayYmdFromUnix,
  defaultTimingIndex,
  formatHiFromUnix,
  productDateTimeToDate,
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

  it('classifies timing from unix starts/ends against Bucharest today', () => {
    const now = new Date('2026-06-10T10:00:00.000Z');
    const today = todayYmdBucharest(now);
    const startsToday = Math.floor(
      productDateTimeToDate(today, '10:00:00').getTime() / 1000
    );
    const endsToday = Math.floor(
      productDateTimeToDate(today, '18:00:00').getTime() / 1000
    );
    const startsTomorrow = Math.floor(
      productDateTimeToDate(addDaysYmd(today, 1), '10:00:00').getTime() / 1000
    );
    const endsTomorrow = Math.floor(
      productDateTimeToDate(addDaysYmd(today, 1), '18:00:00').getTime() / 1000
    );
    const startsYesterday = Math.floor(
      productDateTimeToDate(addDaysYmd(today, -1), '10:00:00').getTime() / 1000
    );
    const endsYesterday = Math.floor(
      productDateTimeToDate(addDaysYmd(today, -1), '18:00:00').getTime() / 1000
    );

    expect(classifyTiming(startsToday, endsToday, now)).toBe('ongoing');
    expect(classifyTiming(startsTomorrow, endsTomorrow, now)).toBe('upcoming');
    expect(classifyTiming(startsYesterday, endsYesterday, now)).toBe('past');
  });

  it('classifies multi-day overlap as ongoing when today is inside the span', () => {
    const now = new Date('2026-06-10T10:00:00.000Z');
    const today = todayYmdBucharest(now);
    const starts = Math.floor(
      productDateTimeToDate(addDaysYmd(today, -1), '22:00:00').getTime() / 1000
    );
    const ends = Math.floor(
      productDateTimeToDate(addDaysYmd(today, 1), '02:00:00').getTime() / 1000
    );
    expect(classifyTiming(starts, ends, now)).toBe('ongoing');
  });

  it('accepts Ymd day strings for starts/ends', () => {
    const now = new Date('2026-06-10T10:00:00.000Z');
    const today = todayYmdBucharest(now);
    expect(classifyTiming(today, today, now)).toBe('ongoing');
    expect(classifyTiming(addDaysYmd(today, 1), addDaysYmd(today, 2), now)).toBe(
      'upcoming'
    );
    expect(classifyTiming(addDaysYmd(today, -2), addDaysYmd(today, -1), now)).toBe(
      'past'
    );
  });

  it('formats Bucharest day and H:i from unix', () => {
    const unix = Math.floor(
      productDateTimeToDate('2026-06-15', '18:00:00').getTime() / 1000
    );
    expect(dayYmdFromUnix(unix)).toBe('2026-06-15');
    expect(formatHiFromUnix(unix)).toBe('18:00');
  });

  it('orders tabs Past→Ongoing→Upcoming and defaults Ongoing when visible', () => {
    expect(TIMING_TAB_ORDER).toEqual(['past', 'ongoing', 'upcoming']);
    expect(defaultTimingIndex(true)).toBe(1);
    expect(defaultTimingIndex(false)).toBe(2);
  });
});
