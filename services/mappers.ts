/**
 * Translate backend resources (types/api.ts) into the UI types (types/types.ts).
 */
import type { ImageSourcePropType } from "react-native";
import type { Event, EventCoverImage, EventDivision, EventRegistration } from "@/types/api";
import type {
  DivisionDetails,
  EventCardData,
  EventDetails,
  EventStatus,
  ScheduleGroup,
  ScheduleItem,
} from "@/types/types";
import {
  classifyTiming,
  dayYmdFromUnix,
  formatHiFromUnix,
} from "@/services/dateRange";

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

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function uriSource(url: string | null | undefined): ImageSourcePropType | null {
  if (!url) return null;
  return { uri: url };
}

function partsFromYmd(ymd: string): { y: number; m: number; d: number } | null {
  const [y, m, d] = ymd.split("-").map((n) => Number(n));
  if (!y || !m || !d || m < 1 || m > 12) return null;
  return { y, m, d };
}

/** "2025-04-27" -> "27 April 2025". */
export function formatDateHuman(date: string): string {
  const p = partsFromYmd(date);
  if (!p) return date;
  return `${p.d} ${MONTHS[p.m - 1]} ${p.y}`;
}

/** "2026-10-24" -> "24 Oct 2026". */
export function formatDateShort(date: string): string {
  const p = partsFromYmd(date);
  if (!p) return date;
  return `${p.d} ${MONTHS_SHORT[p.m - 1]} ${p.y}`;
}

export function formatWeekday(date: string): string {
  const p = partsFromYmd(date);
  if (!p) return "";
  const dt = new Date(p.y, p.m - 1, p.d);
  return WEEKDAYS[dt.getDay()] ?? "";
}

/** Compact multi-day range (Bucharest Ymd strings). */
export function formatCompactDateRange(startYmd: string, endYmd: string): string {
  const a = partsFromYmd(startYmd);
  const b = partsFromYmd(endYmd);
  if (!a || !b) return `${startYmd} - ${endYmd}`;
  if (a.y === b.y && a.m === b.m) {
    return `${a.d}-${b.d} ${MONTHS_SHORT[a.m - 1]} ${a.y}`;
  }
  if (a.y === b.y) {
    return `${a.d} ${MONTHS_SHORT[a.m - 1]} - ${b.d} ${MONTHS_SHORT[b.m - 1]}`;
  }
  return `${a.d} ${MONTHS_SHORT[a.m - 1]} ${a.y} - ${b.d} ${MONTHS_SHORT[b.m - 1]} ${b.y}`;
}

export function formatLongDateRange(startYmd: string, endYmd: string): string {
  return `${formatDateHuman(startYmd)} - ${formatDateHuman(endYmd)}`;
}

export function primaryCover(e: Event): EventCoverImage | null {
  const images = [...(e.cover_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order || a.id - b.id
  );
  if (images[0]?.url) return images[0];
  if (e.cover_url) {
    return { id: 0, url: e.cover_url, aspect_ratio: Number.NaN, sort_order: 0 };
  }
  return null;
}

function num(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
}

export function formatPriceRange(fees: number[]): string {
  if (fees.length === 0) return "RON 0";
  const values = fees.map((f) => Number(f) || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? `RON ${num(min)}` : `RON ${num(min)} - ${num(max)}`;
}

export function eventPriceLabel(e: Event): string {
  return formatPriceRange(
    (e.event_divisions ?? []).map((d) => Number(d.entry_fee) || 0)
  );
}

function formatScheduleInstant(unix: number, multiDay: boolean): string {
  const hi = formatHiFromUnix(unix);
  if (!multiDay) return hi;
  const ymd = dayYmdFromUnix(unix);
  const p = partsFromYmd(ymd);
  if (!p) return hi;
  return `${p.d} ${MONTHS_SHORT[p.m - 1]}, ${hi}`;
}

function formatPlayingWindow(
  startsAt: number,
  endsAt: number,
  multiDay: boolean
): string {
  const startDay = dayYmdFromUnix(startsAt);
  const endDay = dayYmdFromUnix(endsAt);
  if (!multiDay) {
    return `${formatHiFromUnix(startsAt)} - ${formatHiFromUnix(endsAt)}`;
  }
  if (startDay === endDay) {
    return `${formatScheduleInstant(startsAt, true)} - ${formatHiFromUnix(endsAt)}`;
  }
  return `${formatScheduleInstant(startsAt, true)} - ${formatScheduleInstant(endsAt, true)}`;
}

/**
 * One schedule box per unique (check_in_at, playing_starts_at, playing_ends_at).
 */
export function buildSchedule(e: Event): ScheduleGroup[] {
  const multiDay = (e.event_nr_of_days ?? 1) > 1;
  type Entry = { playStart: number; playEnd: number; group: ScheduleGroup };
  const groups = new Map<string, Entry>();

  for (const d of e.event_divisions ?? []) {
    const key = `${d.check_in_at ?? "null"}|${d.playing_starts_at}|${d.playing_ends_at}`;
    if (groups.has(key)) continue;
    const items: ScheduleItem[] = [];
    if (d.check_in_at != null) {
      items.push({
        label: "Check-in",
        time: formatScheduleInstant(d.check_in_at, multiDay),
      });
    }
    items.push({
      label: "Playing",
      time: formatPlayingWindow(d.playing_starts_at, d.playing_ends_at, multiDay),
    });
    groups.set(key, {
      playStart: d.playing_starts_at,
      playEnd: d.playing_ends_at,
      group: { items },
    });
  }

  return [...groups.values()]
    .sort((a, b) => {
      if (a.playStart !== b.playStart) return a.playStart - b.playStart;
      return a.playEnd - b.playEnd;
    })
    .map((e) => e.group);
}

function eventBadges(e: Event) {
  return (e.badges ?? []).map((b) => ({ key: b.key, label: b.label }));
}

function eventDateFields(e: Event): {
  date: string;
  dateShort: string;
  weekday: string;
  dateModalLines: string[];
} {
  const startYmd = dayYmdFromUnix(e.event_starts_at);
  const endYmd = dayYmdFromUnix(e.event_ends_at);
  const multi = (e.event_nr_of_days ?? 1) > 1;

  if (!multi) {
    return {
      date: formatDateHuman(startYmd),
      dateShort: formatDateShort(startYmd),
      weekday: formatWeekday(startYmd),
      dateModalLines: [
        `${formatDateHuman(startYmd)}${formatWeekday(startYmd) ? ` · ${formatWeekday(startYmd)}` : ""}`,
      ],
    };
  }

  return {
    date: formatLongDateRange(startYmd, endYmd),
    dateShort: formatCompactDateRange(startYmd, endYmd),
    weekday: "",
    dateModalLines: [
      `${formatDateHuman(startYmd)} · ${formatWeekday(startYmd)}`,
      `${formatDateHuman(endYmd)} · ${formatWeekday(endYmd)}`,
    ],
  };
}

export function eventToCard(
  e: Event,
  statusOverride: EventStatus = "none"
): EventCardData {
  const dates = eventDateFields(e);
  const cover = primaryCover(e);
  const multi = (e.event_nr_of_days ?? 1) > 1;
  return {
    id: String(e.id_event),
    title: e.name,
    location: e.location?.name ?? "—",
    // Multi-day: compact; single-day: long form (existing card pattern).
    date: multi ? dates.dateShort : dates.date,
    coverImage: uriSource(cover?.url),
    coverAspectRatio:
      cover && Number.isFinite(cover.aspect_ratio) ? cover.aspect_ratio : null,
    status: statusOverride,
    timing: classifyTiming(e.event_starts_at, e.event_ends_at),
    badges: eventBadges(e),
    slug: e.slug ?? null,
  };
}

export function eventToDetails(
  e: Event,
  status: EventStatus = "none"
): EventDetails {
  const address = (e.location?.address ?? "").trim();
  const dates = eventDateFields(e);
  const cover = primaryCover(e);
  return {
    eventImage: uriSource(cover?.url),
    coverAspectRatio:
      cover && Number.isFinite(cover.aspect_ratio) ? cover.aspect_ratio : null,
    eventName: e.name,
    date: dates.date,
    dateShort: dates.dateShort,
    weekday: dates.weekday,
    dateModalLines: dates.dateModalLines,
    location: e.location?.name ?? "—",
    locationAddress: address !== "" ? address : "—",
    price: eventPriceLabel(e),
    schedule: buildSchedule(e),
    eventDescription: e.description ?? "",
    organizerImage: uriSource(e.organizer?.url),
    organizerName: e.organizer?.name ?? null,
    status,
    timing: classifyTiming(e.event_starts_at, e.event_ends_at),
    badges: eventBadges(e),
    slug: e.slug ?? null,
  };
}

export function divisionEntryFee(d: EventDivision | null | undefined): number {
  return Number(d?.entry_fee) || 0;
}

export function eventDivisionOptions(e: Event): DivisionDetails[] {
  return (e.event_divisions ?? []).map((d) => ({
    id: d.id_event_division,
    name: d.division_title || d.division?.name || `Division ${d.division_id}`,
    price: divisionEntryFee(d),
    description: divisionDescription(d, (e.event_nr_of_days ?? 1) > 1),
    num_spots: Number(d.players_limit) || 0,
    isEligible: d.is_eligible === true,
    isActive: true,
    color: typeof d.division?.color === "string" ? d.division.color : null,
    playingStart: formatHiFromUnix(d.playing_starts_at) || undefined,
    playingEnd: formatHiFromUnix(d.playing_ends_at) || undefined,
  }));
}

function divisionDescription(d: EventDivision, multiDay: boolean): string {
  const window = formatPlayingWindow(d.playing_starts_at, d.playing_ends_at, multiDay);
  if (window) return `Playing ${window}`;
  return `Up to ${Number(d.players_limit) || 0} players`;
}

export function registrationToEventStatus(
  registration:
    | EventRegistration
    | EventRegistration[]
    | null
    | undefined
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
  return "none";
}

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
