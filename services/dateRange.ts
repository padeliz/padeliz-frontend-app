/**
 * Date helpers for the editions list.
 *
 * The backend requires `date_from`/`date_to` (YYYY-MM-DD, date_to >= date_from) on
 * the editions endpoints, but an edition has a single `date` while the UI shows
 * upcoming/ongoing/past tabs. Strategy: fetch one wide range, then classify each
 * edition client-side by comparing its `date` string to today (lexicographic
 * comparison is valid for zero-padded YYYY-MM-DD).
 */
import type { EventTiming } from "@/types/types";

export type DateRange = { date_from: string; date_to: string };

/** Format a Date as local YYYY-MM-DD. */
export function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayYmd(): string {
  return ymd(new Date());
}

/** Classify an edition's "YYYY-MM-DD" date relative to today. */
export function classifyTiming(date: string): EventTiming {
  const today = todayYmd();
  if (date > today) return "upcoming";
  if (date < today) return "past";
  return "ongoing";
}

/** Wide range (~today±1y). Used by the single-edition lookup fallback. */
export function defaultListRange(daysBack = 365, daysAhead = 365): DateRange {
  const from = new Date();
  from.setDate(from.getDate() - daysBack);
  const to = new Date();
  to.setDate(to.getDate() + daysAhead);
  return { date_from: ymd(from), date_to: ymd(to) };
}

/**
 * Server-side date range for a timing tab, so each tab fetches exactly its editions.
 * Partitions with no overlap (matches classifyTiming): past = before today,
 * ongoing = today, upcoming = after today.
 */
export function rangeForTab(tab: EventTiming, years = 3): DateRange {
  const today = new Date();
  if (tab === "ongoing") {
    const d = ymd(today);
    return { date_from: d, date_to: d };
  }
  if (tab === "upcoming") {
    const from = new Date(today);
    from.setDate(from.getDate() + 1);
    const to = new Date(today);
    to.setFullYear(to.getFullYear() + years);
    return { date_from: ymd(from), date_to: ymd(to) };
  }
  // past
  const from = new Date(today);
  from.setFullYear(from.getFullYear() - years);
  const to = new Date(today);
  to.setDate(to.getDate() - 1);
  return { date_from: ymd(from), date_to: ymd(to) };
}
