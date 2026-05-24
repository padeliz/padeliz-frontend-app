/**
 * Persistent storage for the Laravel Sanctum bearer token.
 *
 * Native (iOS/Android): expo-secure-store via the existing `tokenCache`.
 * Web: localStorage — the backend is bearer-token/cookie-less (supports_credentials=false),
 * so there's no httpOnly cookie option here. This accepts the usual XSS trade-off for a
 * web bearer token; acceptable for this internal/dev app.
 */
import { Platform } from "react-native";
import { tokenCache } from "@/utils/cache";

const TOKEN_KEY = "accessToken"; // reuse the existing SecureStore key

const isWeb = Platform.OS === "web";

export async function getToken(): Promise<string | null> {
  if (isWeb) {
    try {
      return typeof localStorage !== "undefined"
        ? localStorage.getItem(TOKEN_KEY)
        : null;
    } catch {
      return null;
    }
  }
  return (await tokenCache?.getToken(TOKEN_KEY)) ?? null;
}

export async function saveToken(token: string): Promise<void> {
  if (isWeb) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore storage failures (private mode, etc.)
    }
    return;
  }
  await tokenCache?.saveToken(TOKEN_KEY, token);
}

export async function deleteToken(): Promise<void> {
  if (isWeb) {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
    return;
  }
  await tokenCache?.deleteToken(TOKEN_KEY);
}
