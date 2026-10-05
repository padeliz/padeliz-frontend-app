import { eventDetailPath } from '@/utils/eventPaths';
import {
  captureReferralRef,
  parseReferralDeeplink,
} from '@/services/referralQueue';

/** True when pathname is `/event/{id}` or `/event/{id}/{slug}`. */
export function isOnEventDetailRoute(
  pathname: string | null | undefined,
  eventId: number
): boolean {
  if (!pathname) return false;
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return new RegExp(`^/event/${eventId}(?:/[^/]+)?$`).test(normalized);
}

type HandleReferralArgs = {
  url: string | null | undefined;
  pathname: string | null | undefined;
  isAuthed: boolean;
  navigate: (path: string) => void;
  capture?: typeof captureReferralRef;
};

/**
 * Capture referral from a deep link. Navigates only when not already on that
 * event's detail route (avoids remount / stripping slug).
 */
export async function handleReferralUrl({
  url,
  pathname,
  isAuthed,
  navigate,
  capture = captureReferralRef,
}: HandleReferralArgs): Promise<void> {
  const parsed = parseReferralDeeplink(url);
  if (!parsed) return;

  try {
    await capture(parsed.eventId, parsed.ref, isAuthed);
  } catch {
    // Best-effort capture; navigation still proceeds when needed.
  }

  if (isOnEventDetailRoute(pathname, parsed.eventId)) {
    return;
  }

  navigate(eventDetailPath(parsed.eventId, parsed.slug));
}
