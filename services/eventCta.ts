/**
 * Sticky CTA for the event detail screen.
 *
 * Evaluation order:
 *   1. now >= event end (date + closing_time, Europe/Bucharest):
 *      has_participated → grey disabled "Participated"; else → no CTA.
 *   2. Map registration status + player level to the actionable CTA
 *      (no calendar-timing nulling — an ongoing event can still be joined):
 *      no player level → "Assess my level"; has a level → "Register". A pending
 *      re-assessment never forces Assess when a level already exists.
 *   3. Register / Assess my level after `registration_allowed_until`
 *      → disabled, non-navigating "Registration closed".
 *      Pay Now / pending CTAs are never replaced.
 */
import type { Event } from "@/types/api";
import type { EventStatus } from "@/types/types";
import { productDateTimeToDate } from "@/services/dateRange";

/** Where the CTA leads. `null` means the button is informational only. */
export type CTATarget =
  | { screen: "assessment" }
  | { screen: "registration"; initialStep?: string }
  | null;

export type CTAConfig = {
  label: string;
  variant?: "default" | "orange" | "grey";
  showClockIcon?: boolean;
  /** Visually disabled and not pressable (e.g. "Registration closed"). */
  disabled?: boolean;
  target: CTATarget;
};

export type EventStickyCtaInput = {
  status: EventStatus;
  event: Pick<
    Event,
    "date" | "closing_time" | "registration_allowed_until"
  >;
  /** The player holds a level (a `player_levels` row). */
  hasPlayerLevel: boolean;
  /** Guests always get the "Assess my level" entry point. */
  isAuthed: boolean;
  /**
   * True when the authenticated player has an EventParticipation row
   * (event show `has_participated` — not the paid-registration badge).
   */
  hasParticipated?: boolean;
  now?: Date;
};

/** End of the event: event date + closing_time in the product timezone. */
export function eventEndDate(
  event: Pick<Event, "date" | "closing_time">
): Date {
  return productDateTimeToDate(event.date, event.closing_time);
}

function actionableCta(
  status: EventStatus,
  hasPlayerLevel: boolean
): CTAConfig | null {
  if (status === "registered") return null;
  if (status === "pending_payment") {
    return {
      label: "Pay Now",
      target: { screen: "registration", initialStep: "2" },
    };
  }
  if (status === "registration_pending") {
    return {
      label: "Registration Review in Pending",
      variant: "orange",
      showClockIcon: true,
      target: { screen: "registration", initialStep: "3" },
    };
  }
  return hasPlayerLevel
    ? { label: "Register", target: { screen: "registration" } }
    : { label: "Assess my level", target: { screen: "assessment" } };
}

/** Register / Assess my level: entry points that start a new registration. */
function startsRegistration(cta: CTAConfig): boolean {
  const target = cta.target;
  if (!target) return false;
  if (target.screen === "assessment") return true;
  return target.initialStep == null;
}

export function getEventStickyCta({
  status,
  event,
  hasPlayerLevel,
  isAuthed,
  hasParticipated = false,
  now = new Date(),
}: EventStickyCtaInput): CTAConfig | null {
  const eventEnd = eventEndDate(event).getTime();
  if (!Number.isNaN(eventEnd) && now.getTime() >= eventEnd) {
    if (hasParticipated) {
      return {
        label: "Participated",
        variant: "grey",
        disabled: true,
        target: null,
      };
    }
    return null;
  }

  const cta = isAuthed
    ? actionableCta(status, hasPlayerLevel)
    : actionableCta("none", false);
  if (!cta) return null;

  const registrationClosed =
    now.getTime() >= event.registration_allowed_until * 1000;
  if (registrationClosed && startsRegistration(cta)) {
    return { label: "Registration closed", disabled: true, target: null };
  }
  return cta;
}
