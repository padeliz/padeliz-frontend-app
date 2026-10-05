/**
 * Expo push token registration.
 *
 * The backend fans out registration/payment status notifications through
 * `pm_player_device_tokens`, so the app posts its Expo push token after every
 * successful login (and session restore) and deletes it on sign-out — while the
 * bearer token is still valid, otherwise the DELETE would 401.
 *
 * Push is native-only: on web `getExpoPushTokenAsync` has no credentials to use, so
 * the whole flow is skipped.
 */
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import {
  registerDeviceToken,
  unregisterDeviceToken,
} from "@/services/registration";

/** Last token handed to the backend, so sign-out can delete exactly that row. */
let syncedToken: string | null = null;

function projectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId
  );
}

async function resolveExpoPushToken(): Promise<string | null> {
  const existing = await Notifications.getPermissionsAsync();
  let granted = existing.granted;
  if (!granted) {
    granted = (await Notifications.requestPermissionsAsync()).granted;
  }
  if (!granted) return null;

  const id = projectId();
  const { data } = await Notifications.getExpoPushTokenAsync(
    id ? { projectId: id } : undefined
  );
  return data ?? null;
}

/**
 * Ask for permission (once), read the Expo push token and register it with the API.
 * Resolves to the token, or null when push is unavailable or was declined. Never
 * throws: a failed registration must not block signing in.
 */
export async function syncPushToken(): Promise<string | null> {
  if (Platform.OS === "web") return null;
  try {
    const token = await resolveExpoPushToken();
    if (!token) return null;
    await registerDeviceToken(token, Platform.OS);
    syncedToken = token;
    return token;
  } catch {
    return null;
  }
}

/** Delete the registered token. Must run before the bearer token is cleared. */
export async function clearPushToken(): Promise<void> {
  const token = syncedToken;
  if (!token) return;
  syncedToken = null;
  try {
    await unregisterDeviceToken(token);
  } catch {
    // Best-effort: a stale row is harmless, the backend prunes on send failure.
  }
}
