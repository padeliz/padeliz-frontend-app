/**
 * Translate backend resources (types/api.ts) into the UI types (types/types.ts).
 */
import type { ImageSourcePropType } from "react-native";
import type { Event, EventDivision, EventRegistration } from "@/types/api";
import type { ReviewStatus } from "@/types/api";
import type {
  DivisionDetails,
  EventCardData,
  EventDetails,
  EventStatus,
  ScheduleItem,
} from "@/types/types";
import { classifyTiming } from "@/services/dateRange";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function uriSource(url: string | null | undefined): ImageSourcePropType | null {
  if (!url) return null;
  return { uri: url };
}

/** "2025-04-27" -> "27 April 2025". Falls back to the raw string if unparseable. */
export function formatDateHuman(date: string): string {
  const [y, m, d] = date.split("-").map((n) => Number(n));
  if (!y || !m || !d || m < 1 || m > 12) return date;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "2026-10-24" -> "24 Oct 2026". Falls back to the raw string if unparseable. */
export function formatDateShort(date: string): string {
  const [y, m, d] = date.split("-").map((n) => Number(n));
  if (!y || !m || !d || m < 1 || m > 12) return date;
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Weekday for "YYYY-MM-DD" in local calendar interpretation. */
export function formatWeekday(date: string): string {
  const [y, m, d] = date.split("-").map((n) => Number(n));
  if (!y || !m || !d || m < 1 || m > 12) return "";
  const dt = new Date(y, m - 1, d);
  return WEEKDAYS[dt.getDay()] ?? "";
}

/** "11:30:00" -> "11:30". */
export function hhmm(time: string | null | undefined): string {
  if (!time) return "";
  return time.slice(0, 5);
}

function num(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
}

/** "RON 45" or "RON 45 - 75" from a list of division fees. */
export function formatPriceRange(fees: number[]): string {
  if (fees.length === 0) return "RON 0";
  const values = fees.map((f) => Number(f) || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? `RON ${num(min)}` : `RON ${num(min)} - ${num(max)}`;
}

/** Price label for an event from its division entry fees. */
export function eventPriceLabel(e: Event): string {
  return formatPriceRange(
    (e.event_divisions ?? []).map((d) => Number(d.entry_fee) || 0)
  );
}

/**
 * Check-in + unique Playing windows (start then end). Closing is omitted in the app.
 */
export function buildSchedule(e: Event): ScheduleItem[] {
  const items: ScheduleItem[] = [];
  if (e.arriving_time) {
    items.push({ label: "Check-in", time: hhmm(e.arriving_time) });
  }

  const windows = (e.event_divisions ?? [])
    .map((d) => {
      const start = hhmm(d.playing_start_time);
      const end = hhmm(d.playing_end_time);
      const time = start && end ? `${start} - ${end}` : start || end;
      return { start, end, time };
    })
    .filter((w) => Boolean(w.time))
    .sort((a, b) => {
      if (a.start !== b.start) return a.start.localeCompare(b.start);
      return a.end.localeCompare(b.end);
    });

  const seen = new Set<string>();
  let playingLabelUsed = false;
  for (const w of windows) {
    if (seen.has(w.time)) continue;
    seen.add(w.time);
    items.push({
      label: playingLabelUsed ? "" : "Playing",
      time: w.time,
    });
    playingLabelUsed = true;
  }

  return items;
}

function eventBadges(e: Event) {
  return (e.badges ?? []).map((b) => ({ key: b.key, label: b.label }));
}

export function eventToCard(
  e: Event,
  statusOverride: EventStatus = "none"
): EventCardData {
  return {
    id: String(e.id_event),
    title: e.name,
    location: e.location?.name ?? "—",
    date: formatDateHuman(e.date),
    coverImage: uriSource(e.cover_url),
    status: statusOverride,
    timing: classifyTiming(e.date),
    badges: eventBadges(e),
    slug: e.slug ?? null,
  };
}

export function eventToDetails(
  e: Event,
  status: EventStatus = "none"
): EventDetails {
  const address = (e.location?.address ?? "").trim();
  return {
    eventImage: uriSource(e.cover_url),
    eventName: e.name,
    date: formatDateHuman(e.date),
    dateShort: formatDateShort(e.date),
    weekday: formatWeekday(e.date),
    location: e.location?.name ?? "—",
    locationAddress: address !== "" ? address : "—",
    price: eventPriceLabel(e),
    schedule: buildSchedule(e),
    eventDescription: e.description ?? "",
    organizerImage: uriSource(e.organizer?.url),
    organizerName: e.organizer?.name ?? null,
    status,
    timing: classifyTiming(e.date),
    badges: eventBadges(e),
    slug: e.slug ?? null,
  };
}

/** Entry fee charged for a division (fees live on the division). */
export function divisionEntryFee(d: EventDivision | null | undefined): number {
  return Number(d?.entry_fee) || 0;
}

/**
 * The event's divisions as registration options. The app API exposes `players_limit`
 * but not the live headcount, so `num_spots` is the limit and the backend is the
 * authority on capacity (it 422s with `event_division_id` when a division is full).
 */
export function eventDivisionOptions(e: Event): DivisionDetails[] {
  return (e.event_divisions ?? []).map((d) => ({
    id: d.id_event_division,
    name: d.division_title || d.division?.name || `Division ${d.division_id}`,
    price: divisionEntryFee(d),
    description: divisionDescription(d),
    num_spots: Number(d.players_limit) || 0,
    isEligible: true,
    isActive: true,
    color:
      typeof d.division?.color === "string" ? d.division.color : null,
    playingStart: hhmm(d.playing_start_time) || undefined,
    playingEnd: hhmm(d.playing_end_time) || undefined,
  }));
}

function divisionDescription(d: EventDivision): string {
  const start = hhmm(d.playing_start_time);
  const end = hhmm(d.playing_end_time);
  if (start && end) return `Playing ${start} - ${end}`;
  if (start) return `Playing from ${start}`;
  return `Up to ${Number(d.players_limit) || 0} players`;
}

/** Map the player's latest eligibility review status to a UI event status. */
export function reviewStatusToEventStatus(
  latest: ReviewStatus | null
): EventStatus {
  // pending → show "Eligibility Check in Pending"; everything else → can register.
  return latest === "pending" ? "eligibility_pending" : "none";
}

/**
 * Aggregate UI status for list/home cards and event CTAs over active registrations:
 * any unpaid with amount due → pending_payment; else any awaiting → registration_pending;
 * else any paid → registered; cancelled/non-active ignored; eligibility fallback.
 */
export function registrationToEventStatus(
  registration:
    | EventRegistration
    | EventRegistration[]
    | null
    | undefined,
  gate?: { isPending: boolean }
): EventStatus {
  const regs = (
    Array.isArray(registration)
      ? registration
      : registration
        ? [registration]
        : []
  ).filter((r) => r.lifecycle_status === "active");

  if (regs.some((r) => r.payment_status === "unpaid" && Number(r.amount_due) > 0)) {
    return "pending_payment";
  }
  if (regs.some((r) => r.payment_status === "awaiting_proof_review")) {
    return "registration_pending";
  }
  if (regs.some((r) => r.payment_status === "paid")) {
    return "registered";
  }
  return gate?.isPending ? "eligibility_pending" : "none";
}

/** Format a unix-epoch payment deadline for unpaid registrations. */
export function formatPaymentDueAt(
  paymentDueAt: number | null | undefined
): string | null {
  if (paymentDueAt == null || paymentDueAt <= 0) return null;
  const d = new Date(paymentDueAt * 1000);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
