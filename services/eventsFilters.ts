/**
 * Pure helpers for Events list filter defaults / membership chips.
 * Kept free of React so Jest can cover defaults without mounting the screen.
 */
import type { EventTiming } from "@/types/types";
import type { EventListFilters } from "@/services/events";

export type TabFilterState = {
  membership: boolean;
  unpaid: boolean;
  lottery: boolean;
  clubIds: number[];
  /** True once the user toggled membership on this tab this session. */
  membershipTouched: boolean;
};

export function emptyTabFilters(membershipDefault: boolean): TabFilterState {
  return {
    membership: membershipDefault,
    unpaid: false,
    lottery: false,
    clubIds: [],
    membershipTouched: false,
  };
}

/** No filter selected by default (guest and authenticated). */
export function defaultMembership(_isAuthenticated: boolean): boolean {
  return false;
}

/** Past → I've Participated; Ongoing/Upcoming → I'm Registered. */
export function membershipChipLabel(tab: EventTiming): string {
  return tab === "past" ? "I've Participated" : "I'm Registered";
}

export function anyChipFilterActive(filters: TabFilterState): boolean {
  return (
    filters.membership ||
    filters.unpaid ||
    filters.lottery ||
    filters.clubIds.length > 0
  );
}

/** Map UI filter state to GET /app/events query flags (AND). */
export function initialFiltersByTab(
  isAuthed: boolean
): Record<EventTiming, TabFilterState> {
  const membership = defaultMembership(isAuthed);
  return {
    past: emptyTabFilters(membership),
    ongoing: emptyTabFilters(membership),
    upcoming: emptyTabFilters(membership),
  };
}

export function toEventListFilters(
  tab: EventTiming,
  filters: TabFilterState
): EventListFilters {
  const out: EventListFilters = {};
  if (filters.membership) {
    if (tab === "past") out.participated = true;
    else out.registered = true;
  }
  if (filters.unpaid) out.unpaid = true;
  if (filters.lottery) out.lottery_winner = true;
  if (filters.clubIds.length > 0) out.club_ids = filters.clubIds;
  return out;
}

/**
 * Auth hydrate must not auto-enable membership chips.
 * Kept for call-site compatibility; returns the same map unchanged.
 */
export function applyAuthMembershipDefaults(
  byTab: Record<EventTiming, TabFilterState>,
  _isAuthenticated: boolean
): Record<EventTiming, TabFilterState> {
  return byTab;
}
