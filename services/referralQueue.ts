/**
 * Local queue for referral deeplink refs captured while logged out.
 * Flushed to POST /app/referral-touchpoints once the player authenticates.
 *
 * Storage mirrors tokenStorage: SecureStore on native, localStorage on web.
 */
import { Platform } from "react-native";
import { tokenCache } from "@/utils/cache";
import { recordReferralTouchpoint } from "@/services/referral";

const QUEUE_KEY = "referralTouchpointQueue";

export type QueuedReferral = {
  event_id: number;
  ref: string;
  queued_at: number;
};

function isWebPlatform(): boolean {
  return Platform.OS === "web";
}

async function readRaw(): Promise<string | null> {
  if (isWebPlatform()) {
    try {
      return typeof localStorage !== "undefined"
        ? localStorage.getItem(QUEUE_KEY)
        : null;
    } catch {
      return null;
    }
  }
  return (await tokenCache?.getToken(QUEUE_KEY)) ?? null;
}

async function writeRaw(value: string | null): Promise<void> {
  if (isWebPlatform()) {
    try {
      if (value == null) localStorage.removeItem(QUEUE_KEY);
      else localStorage.setItem(QUEUE_KEY, value);
    } catch {
      // ignore
    }
    return;
  }
  if (value == null) await tokenCache?.deleteToken(QUEUE_KEY);
  else await tokenCache?.saveToken(QUEUE_KEY, value);
}

export async function getReferralQueue(): Promise<QueuedReferral[]> {
  const raw = await readRaw();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QueuedReferral[]) : [];
  } catch {
    return [];
  }
}

async function saveQueue(items: QueuedReferral[]): Promise<void> {
  if (items.length === 0) {
    await writeRaw(null);
    return;
  }
  await writeRaw(JSON.stringify(items));
}

/**
 * Append a referral ref for an event. Dedupes by event_id (latest ref wins).
 */
export async function enqueueReferral(
  eventId: number,
  ref: string
): Promise<QueuedReferral[]> {
  const code = ref.trim();
  if (!eventId || !code) return getReferralQueue();
  const existing = await getReferralQueue();
  const next = [
    ...existing.filter((item) => item.event_id !== eventId),
    { event_id: eventId, ref: code, queued_at: Math.floor(Date.now() / 1000) },
  ];
  await saveQueue(next);
  return next;
}

/**
 * Record a touchpoint immediately when logged in, otherwise queue it.
 * Returns whether the touchpoint was posted (`posted`) or queued (`queued`).
 */
export async function captureReferralRef(
  eventId: number,
  ref: string,
  isAuthenticated: boolean
): Promise<"posted" | "queued" | "ignored"> {
  const code = ref.trim();
  if (!eventId || !code) return "ignored";

  if (isAuthenticated) {
    await recordReferralTouchpoint(eventId, code);
    return "posted";
  }

  await enqueueReferral(eventId, code);
  return "queued";
}

/**
 * Flush the local queue to the touchpoint API. Successful items are removed;
 * failures are kept for a later retry.
 */
export async function flushReferralQueue(): Promise<{
  posted: number;
  failed: number;
}> {
  const queue = await getReferralQueue();
  if (queue.length === 0) return { posted: 0, failed: 0 };

  const remaining: QueuedReferral[] = [];
  let posted = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      await recordReferralTouchpoint(item.event_id, item.ref);
      posted += 1;
    } catch {
      remaining.push(item);
      failed += 1;
    }
  }

  await saveQueue(remaining);
  return { posted, failed };
}

/**
 * Parse referral links:
 * - `{BASE_URL}/event/{id}/{slug?}?ref=CODE` (HTTPS)
 * - `padeliz://event/{id}/{slug?}?ref=CODE`
 * - path-only `/event/{id}/{slug?}?ref=CODE`
 */
export function parseReferralDeeplink(
  url: string | null | undefined
): { eventId: number; ref: string; slug?: string } | null {
  if (!url) return null;
  try {
    const normalized = url.includes("://")
      ? url.replace(/^padeliz:\/\//i, "https://padeliz.local/")
      : `https://padeliz.local/${url.replace(/^\//, "")}`;
    const parsed = new URL(normalized);
    const path = parsed.pathname.replace(/\/+$/, "");
    const match = path.match(/^\/event\/(\d+)(?:\/([^/]+))?$/i);
    if (!match) return null;
    const ref = parsed.searchParams.get("ref")?.trim();
    if (!ref) return null;
    const slug = match[2] ? decodeURIComponent(match[2]) : undefined;
    return {
      eventId: Number(match[1]),
      ref,
      ...(slug ? { slug } : {}),
    };
  } catch {
    return null;
  }
}
