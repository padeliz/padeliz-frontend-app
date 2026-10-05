/**
 * Date helpers for the events list.
 *
 * Calendar timing (today / Past / Ongoing / Upcoming) uses product TZ
 * Europe/Bucharest — not the device-local zone.
 */
import type { EventTiming } from "@/types/types";

export type DateRange = { date_from: string; date_to: string };

export const PRODUCT_TIMEZONE = "Europe/Bucharest";

/** Today's calendar date in Europe/Bucharest as YYYY-MM-DD (en-CA). */
export function todayYmdBucharest(now: Date = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: PRODUCT_TIMEZONE });
}

/** Format a Date as local YYYY-MM-DD (device-local; prefer todayYmdBucharest for tabs). */
export function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayYmd(): string {
  return todayYmdBucharest();
}

/** Add calendar days to a YYYY-MM-DD string (UTC noon to avoid DST edge cases). */
export function addDaysYmd(ymdStr: string, days: number): string {
  const [y, m, d] = ymdStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** Add calendar years to a YYYY-MM-DD string. */
export function addYearsYmd(ymdStr: string, years: number): string {
  const [y, m, d] = ymdStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y + years, m - 1, d, 12, 0, 0));
  return dt.toISOString().slice(0, 10);
}

/** Classify an event's "YYYY-MM-DD" date relative to Bucharest today. */
export function classifyTiming(date: string, now: Date = new Date()): EventTiming {
  const today = todayYmdBucharest(now);
  if (date > today) return "upcoming";
  if (date < today) return "past";
  return "ongoing";
}

/** Wide range (~today±1y) in Bucharest calendar dates. */
export function defaultListRange(
  daysBack = 365,
  daysAhead = 365,
  now: Date = new Date()
): DateRange {
  const today = todayYmdBucharest(now);
  return {
    date_from: addDaysYmd(today, -daysBack),
    date_to: addDaysYmd(today, daysAhead),
  };
}

/**
 * Server-side date range for a timing tab (Bucharest).
 * past = before today, ongoing = today, upcoming = after today.
 */
export function rangeForTab(
  tab: EventTiming,
  years = 3,
  now: Date = new Date()
): DateRange {
  const today = todayYmdBucharest(now);
  if (tab === "ongoing") {
    return { date_from: today, date_to: today };
  }
  if (tab === "upcoming") {
    return {
      date_from: addDaysYmd(today, 1),
      date_to: addYearsYmd(today, years),
    };
  }
  return {
    date_from: addYearsYmd(today, -years),
    date_to: addDaysYmd(today, -1),
  };
}

/** Timing tab order in the Events UI. */
export const TIMING_TAB_ORDER: EventTiming[] = ["past", "ongoing", "upcoming"];

/**
 * Default selected timing index: Ongoing when visible, otherwise Upcoming.
 * `ongoingVisible` is true when unfiltered today event count > 0.
 */
export function defaultTimingIndex(ongoingVisible: boolean): number {
  if (ongoingVisible) return TIMING_TAB_ORDER.indexOf("ongoing");
  return TIMING_TAB_ORDER.indexOf("upcoming");
}

/** Offset (ms) of PRODUCT_TIMEZONE from UTC at the given instant. */
function productTzOffsetMs(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PRODUCT_TIMEZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const part = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  const wallAsUtc = Date.UTC(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour") % 24,
    part("minute"),
    part("second")
  );
  return wallAsUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/**
 * Instant for a Bucharest wall-clock date ("YYYY-MM-DD") and time ("HH:MM[:SS]").
 * Returns an Invalid Date when the inputs cannot be parsed.
 */
export function productDateTimeToDate(ymdStr: string, time: string): Date {
  const [y, m, d] = ymdStr.split("-").map(Number);
  const [hh, mm = 0, ss = 0] = time.split(":").map(Number);
  const naive = Date.UTC(y, m - 1, d, hh, mm, ss);
  if (Number.isNaN(naive)) return new Date(NaN);
  // Two passes so DST-boundary offsets settle.
  const first = naive - productTzOffsetMs(new Date(naive));
  return new Date(naive - productTzOffsetMs(new Date(first)));
}
