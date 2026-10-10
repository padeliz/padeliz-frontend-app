import {
  anyChipFilterActive,
  applyAuthMembershipDefaults,
  defaultMembership,
  emptyTabFilters,
  eventSortForTab,
  initialFiltersByTab,
  membershipChipLabel,
  toEventListFilters,
} from '@/services/eventsFilters';
import type { EventTiming } from '@/types/types';

describe('events filter defaults', () => {
  it('initialFiltersByTab seeds each timing tab with default membership off', () => {
    const guest = initialFiltersByTab(false);
    expect(guest.past).toEqual(emptyTabFilters(false));
    expect(guest.ongoing).toEqual(emptyTabFilters(false));
    expect(guest.upcoming).toEqual(emptyTabFilters(false));

    const authed = initialFiltersByTab(true);
    expect(authed.past.membership).toBe(false);
    expect(authed.upcoming.membership).toBe(false);
  });

  it('defaults membership off for guest and authed', () => {
    expect(defaultMembership(false)).toBe(false);
    expect(defaultMembership(true)).toBe(false);
  });

  it('uses tab-exclusive membership chip labels', () => {
    expect(membershipChipLabel('past')).toBe("I've Participated");
    expect(membershipChipLabel('ongoing')).toBe("I'm Registered");
    expect(membershipChipLabel('upcoming')).toBe("I'm Registered");
  });

  it('maps Past → desc and Ongoing/Upcoming → asc', () => {
    expect(eventSortForTab('past')).toBe('desc');
    expect(eventSortForTab('ongoing')).toBe('asc');
    expect(eventSortForTab('upcoming')).toBe('asc');
  });

  it('maps membership to participated vs registered by tab and always sends sort', () => {
    const on = emptyTabFilters(true);
    expect(toEventListFilters('past', on)).toEqual({
      sort: 'desc',
      participated: true,
    });
    expect(toEventListFilters('upcoming', on)).toEqual({
      sort: 'asc',
      registered: true,
    });
    expect(toEventListFilters('ongoing', emptyTabFilters(false))).toEqual({
      sort: 'asc',
    });
  });

  it('combines chip filters with AND', () => {
    const filters = {
      ...emptyTabFilters(true),
      unpaid: true,
      lottery: true,
      clubIds: [2],
    };
    expect(toEventListFilters('upcoming', filters)).toEqual({
      sort: 'asc',
      registered: true,
      unpaid: true,
      lottery_winner: true,
      club_ids: [2],
    });
    expect(anyChipFilterActive(filters)).toBe(true);
    expect(anyChipFilterActive(emptyTabFilters(false))).toBe(false);
  });

  it('does not turn membership on for untouched tabs after guest signs in', () => {
    const byTab = {
      past: emptyTabFilters(false),
      ongoing: { ...emptyTabFilters(false), membershipTouched: true },
      upcoming: emptyTabFilters(false),
    } as Record<EventTiming, ReturnType<typeof emptyTabFilters>>;

    const next = applyAuthMembershipDefaults(byTab, true);
    expect(next.past.membership).toBe(false);
    expect(next.upcoming.membership).toBe(false);
    expect(next.ongoing.membership).toBe(false);
  });
});
