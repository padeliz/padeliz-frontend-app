/**
 * Push is native-only. Web has no Expo push credentials, so these stay no-ops
 * and never import `expo-notifications` (which would warn on load).
 */

export async function syncPushToken(): Promise<string | null> {
  return null;
}

export async function clearPushToken(): Promise<void> {}
