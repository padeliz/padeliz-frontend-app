/**
 * Sticky CTA for the event detail screen.
 *
 * Evaluation order:
 *   1. now >= event end (date + closing_time, Europe/Bucharest) → no CTA.
 *   2. Map registration/eligibility status to the actionable CTA
 *      (no calendar-timing nulling — an ongoing event can still be joined).
 *   3. Register / Check Eligibility after `registration_allowed_until`
 *      → disabled, non-navigating "Registration closed".
 *      Pay Now / pending CTAs are never replaced.
 */
import type { Event } from "@/types/api";
import type { EventStatus } from "@/types/types";
import { productDateTimeToDate } from "@/services/dateRange";

/** Where the CTA leads. `null` means the button is informational only. */
export type CTATarget =
  | { screen: "eligibility" }
  | { screen: "registration"; initialStep?: string }
  | null;

export type CTAConfig = {
  label: string;
  variant?: "default" | "orange";
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
  isEligibilityApproved: boolean;
  /** Guests always get the eligibility entry point. */
  isAuthed: boolean;
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
  isEligibilityApproved: boolean
): CTAConfig | null {
  if (status === "registered") return null;
  if (status === "pending_payment") {
    return {
      label: "Pay Now",
      target: { screen: "registration", initialStep: "2" },
    };
  }
  if (status === "eligibility_pending") {
    return {
      label: "Eligibility Check in Pending",
      variant: "orange",
      showClockIcon: true,
      target: null,
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
  return isEligibilityApproved
    ? { label: "Register Now", target: { screen: "registration" } }
    : { label: "Check Eligibility", target: { screen: "eligibility" } };
}

/** Register Now / Check Eligibility: entry points that start a new registration. */
function startsRegistration(cta: CTAConfig): boolean {
  const target = cta.target;
  if (!target) return false;
  if (target.screen === "eligibility") return true;
  return target.initialStep == null;
}

export function getEventStickyCta({
  status,
  event,
  isEligibilityApproved,
  isAuthed,
  now = new Date(),
}: EventStickyCtaInput): CTAConfig | null {
  const eventEnd = eventEndDate(event).getTime();
  if (!Number.isNaN(eventEnd) && now.getTime() >= eventEnd) return null;

  const cta = isAuthed
    ? actionableCta(status, isEligibilityApproved)
    : actionableCta("none", false);
  if (!cta) return null;

  const registrationClosed =
    now.getTime() >= event.registration_allowed_until * 1000;
  if (registrationClosed && startsRegistration(cta)) {
    return { label: "Registration closed", disabled: true, target: null };
  }
  return cta;
}
