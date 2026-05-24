/**
 * Auth against the Laravel API (Sanctum opaque bearer token).
 *
 * Login: dev-login (seeded email) for now — `signIn()` calls it so the existing
 * "Sign in with Google" button works for local dev. The real Google id_token flow
 * (`signInWithGoogle`) is wired but not yet hooked to a Google provider (follow-up).
 *
 * The Sanctum token is opaque (NOT a JWT), so the player comes from the login
 * response and `GET /app/auth/me`, never from decoding the token. The token is
 * persisted via `services/tokenStorage` (SecureStore on native, localStorage on web)
 * and exposed to the API client through `setTokenGetter`.
 */
import * as React from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import {
  AuthRequestConfig,
  DiscoveryDocument,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";
import {
  apiGetEnvelope,
  apiPost,
  setTokenGetter,
  setUnauthorizedHandler,
} from "@/services/apiClient";
import { ApiError } from "@/services/apiError";
import { getToken, saveToken, deleteToken } from "@/services/tokenStorage";
import { BASE_URL } from "@/utils/constants";
import type { AuthData, Player } from "@/types/api";

WebBrowser.maybeCompleteAuthSession();

// Google OAuth runs through the app's own BFF routes (which hold the client secret and
// talk to Google). The BFF returns the Google id_token, which we forward to Laravel.
const googleConfig: AuthRequestConfig = {
  clientId: "google",
  scopes: ["openid", "profile", "email"],
  redirectUri: makeRedirectUri(),
};

const googleDiscovery: DiscoveryDocument = {
  authorizationEndpoint: `${BASE_URL}/api/auth/authorize`,
  tokenEndpoint: `${BASE_URL}/api/auth/token`,
};

/** Normalized user shape consumed by screens (keeps `picture`/`email`/`name`). */
export type AppUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  player: Player;
};

/** Seeded player used by dev-login until the real Google flow lands. */
const DEV_LOGIN_EMAIL =
  process.env.EXPO_PUBLIC_DEV_LOGIN_EMAIL ?? "arsavinwallentyn@gmail.com";

function displayName(p: Player): string {
  if (p.name && p.name.trim()) return p.name.trim();
  const parts = [p.first_name, p.last_name].filter(Boolean) as string[];
  if (parts.length) return parts.join(" ");
  return p.google_name ?? "Player";
}

export function mapPlayerToUser(p: Player): AppUser {
  return {
    id: String(p.id_player),
    email: p.google_email ?? "",
    name: displayName(p),
    picture: p.google_avatar ?? p.uploaded_profile_images?.[0]?.url ?? undefined,
    player: p,
  };
}

type AuthContextValue = {
  user: AppUser | null;
  isLoading: boolean;
  error: Error | null;
  /** Current login entry point. For now performs a dev-login. */
  signIn: () => Promise<void>;
  /** Dev-only: log in as a seeded player by email. */
  devLogin: (email: string) => Promise<void>;
  /** Prod login with a Google OAuth id_token (provider wiring TODO). */
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Re-fetch the authenticated player (GET /app/auth/me). */
  refreshMe: () => Promise<void>;
  /**
   * @deprecated Prefer the `services/` API client. Thin fetch wrapper that injects
   * the bearer token + Accept header against an absolute URL.
   */
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const tokenRef = React.useRef<string | null>(null);
  const isWeb = Platform.OS === "web";
  const [request, response, promptAsync] = useAuthRequest(
    googleConfig,
    googleDiscovery
  );

  const applyToken = React.useCallback(async (token: string | null) => {
    tokenRef.current = token;
    if (token) await saveToken(token);
    else await deleteToken();
  }, []);

  const clearSession = React.useCallback(async () => {
    await applyToken(null);
    setUser(null);
  }, [applyToken]);

  // Expose the token to the API client and register global 401 → sign-out.
  React.useEffect(() => {
    setTokenGetter(() => tokenRef.current);
    setUnauthorizedHandler(() => {
      void clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const refreshMe = React.useCallback(async () => {
    const player = await apiGetEnvelope<Player>("/app/auth/me");
    setUser(mapPlayerToUser(player));
  }, []);

  const finishLogin = React.useCallback(
    async (data: AuthData) => {
      await applyToken(data.token);
      setUser(mapPlayerToUser(data.player));
      setError(null);
    },
    [applyToken]
  );

  const devLogin = React.useCallback(
    async (email: string) => {
      setIsLoading(true);
      try {
        const data = await apiPost<AuthData>(
          "/app/auth/dev-login",
          { email },
          { auth: false }
        );
        await finishLogin(data);
      } catch (e) {
        setError(e as Error);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [finishLogin]
  );

  const signInWithGoogle = React.useCallback(
    async (idToken: string) => {
      setIsLoading(true);
      try {
        const data = await apiPost<AuthData>(
          "/app/auth/google",
          { id_token: idToken },
          { auth: false }
        );
        await finishLogin(data);
      } catch (e) {
        setError(e as Error);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [finishLogin]
  );

  // Process each expo-auth-session result exactly once: exchange the code via the BFF,
  // then forward the Google id_token the BFF returns to Laravel. Depending only on
  // `response` (plus a ref guard) is essential — otherwise unrelated re-renders would
  // re-process the old "success" result and re-trigger login in an infinite loop.
  const processedResponseRef = React.useRef<unknown>(null);

  React.useEffect(() => {
    if (!response || processedResponseRef.current === response) return;
    processedResponseRef.current = response;

    if (response.type === "error") {
      setError(
        (response.error as unknown as Error) ?? new Error("Google sign-in failed")
      );
      return;
    }
    if (response.type !== "success") return; // cancelled / dismissed

    const codeVerifier = request?.codeVerifier;
    void (async () => {
      setIsLoading(true);
      try {
        const { code } = response.params;
        const formData = new FormData();
        formData.append("code", code);
        if (isWeb) formData.append("platform", "web");
        if (codeVerifier) formData.append("code_verifier", codeVerifier);

        const tokenResponse = await fetch(`${BASE_URL}/api/auth/token`, {
          method: "POST",
          body: formData,
          credentials: isWeb ? "include" : "same-origin",
        });
        const payload = await tokenResponse.json();

        const idToken: string | undefined = payload?.googleIdToken;
        if (!idToken) {
          throw new Error("No Google id_token returned from token exchange");
        }
        await signInWithGoogle(idToken);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    })();
    // Only react to a new auth response; request/isWeb/signInWithGoogle are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const signIn = React.useCallback(async () => {
    setError(null);
    await promptAsync();
  }, [promptAsync]);

  const signOut = React.useCallback(async () => {
    try {
      if (tokenRef.current) await apiPost("/app/auth/logout", {});
    } catch {
      // Best-effort: ignore network/401 errors on logout.
    } finally {
      await clearSession();
      setError(null);
    }
  }, [clearSession]);

  const fetchWithAuth = React.useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = new Headers(options.headers as HeadersInit | undefined);
      headers.set("Accept", "application/json");
      if (tokenRef.current) {
        headers.set("Authorization", `Bearer ${tokenRef.current}`);
      }
      return fetch(url, { ...options, headers });
    },
    []
  );

  // Restore a persisted session on startup.
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = await getToken();
        if (!stored) return;
        tokenRef.current = stored;
        await refreshMe();
      } catch (e) {
        if (e instanceof ApiError && e.isUnauthorized) {
          await clearSession();
        } else if (active) {
          setError(e as Error);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [refreshMe, clearSession]);

  const value: AuthContextValue = {
    user,
    isLoading,
    error,
    signIn,
    devLogin,
    signInWithGoogle,
    signOut,
    refreshMe,
    fetchWithAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
