/**
 * Translate backend resources (types/api.ts) into the UI types (types/types.ts).
 *
 * The backend has no cover image, organizer, or description fields, so those use
 * deterministic placeholders from existing assets until the API provides them.
 */
import type { ImageSourcePropType } from "react-native";
import type { Edition } from "@/types/api";
import type { ReviewStatus } from "@/types/api";
import type {
  EventCardData,
  EventDetails,
  EventStatus,
  ScheduleItem,
} from "@/types/types";
import { classifyTiming } from "@/services/dateRange";

const FALLBACK_COVERS: ImageSourcePropType[] = [
  require("@/assets/images/events/minitour-20.png"),
  require("@/assets/images/events/minitour-21.png"),
];
const FALLBACK_ORGANIZER = require("@/assets/images/events/organizer-arshavin.jpg");

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

const DEFAULT_DESCRIPTION =
  "Join us for a day of padel. Check in at the arriving time, then enjoy the matches in a friendly, competitive atmosphere.";

/** Stable cover per edition id so the same event always shows the same image. */
function pickCover(id: number): ImageSourcePropType {
  return FALLBACK_COVERS[id % FALLBACK_COVERS.length];
}

/** "2025-04-27" -> "27 April 2025". Falls back to the raw string if unparseable. */
export function formatDateHuman(date: string): string {
  const [y, m, d] = date.split("-").map((n) => Number(n));
  if (!y || !m || !d || m < 1 || m > 12) return date;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "11:30:00" -> "11:30". */
export function hhmm(time: string | null | undefined): string {
  if (!time) return "";
  return time.slice(0, 5);
}

function num(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
}

/** "RON 45 - 75" (or "RON 45" when both fees are equal). */
export function formatPrice(entryFee: number, studentsFee: number): string {
  const a = Number(entryFee) || 0;
  const b = Number(studentsFee) || 0;
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return min === max ? `RON ${num(min)}` : `RON ${num(min)} - ${num(max)}`;
}

function buildSchedule(e: Edition): ScheduleItem[] {
  const items: ScheduleItem[] = [];
  if (e.arriving_time) items.push({ label: "Arriving", time: hhmm(e.arriving_time) });

  const div = e.edition_divisions?.find(
    (d) => d.playing_start_time || d.playing_end_time
  );
  if (div) {
    const start = hhmm(div.playing_start_time);
    const end = hhmm(div.playing_end_time);
    const time = start && end ? `${start} - ${end}` : start || end;
    if (time) items.push({ label: "Playing", time });
  }

  if (e.closing_time) items.push({ label: "Closing", time: hhmm(e.closing_time) });
  return items;
}

export function editionToCard(
  e: Edition,
  statusOverride: EventStatus = "none"
): EventCardData {
  return {
    id: String(e.id_edition),
    title: e.name,
    location: e.location?.name ?? "—",
    date: formatDateHuman(e.date),
    coverImage: pickCover(e.id_edition),
    status: statusOverride,
    timing: classifyTiming(e.date),
  };
}

export function editionToDetails(
  e: Edition,
  status: EventStatus = "none"
): EventDetails {
  return {
    eventImage: pickCover(e.id_edition),
    eventName: e.name,
    date: formatDateHuman(e.date),
    location: e.location?.name ?? "—",
    price: formatPrice(e.entry_fee, e.students_entry_fee),
    schedule: buildSchedule(e),
    eventDescription: DEFAULT_DESCRIPTION,
    organizerImage: FALLBACK_ORGANIZER,
    organizerName: "Arshavin",
    organizerTitle: "Tournament Director",
    status,
    timing: classifyTiming(e.date),
  };
}

/** Map the player's latest eligibility review status to a UI event status. */
export function reviewStatusToEventStatus(
  latest: ReviewStatus | null
): EventStatus {
  // pending → show "Eligibility Check in Pending"; everything else → can register.
  // (registered/pending_payment require a registration endpoint that doesn't exist yet)
  return latest === "pending" ? "eligibility_pending" : "none";
}
