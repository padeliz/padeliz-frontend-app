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
import { clearPushToken, syncPushToken } from "@/services/push";
import { flushReferralQueue } from "@/services/referralQueue";
import { BASE_URL } from "@/utils/constants";
import { linkGoogleIdentity as apiLinkGoogleIdentity } from "@/services/identities";
import {
  mapPlayerToUser,
  type AppUser,
} from "@/services/authUser";
import type { AuthData, Player } from "@/types/api";

export { mapPlayerToUser, type AppUser } from "@/services/authUser";

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

/** Seeded player used by dev-login until the real Google flow lands. */
const DEV_LOGIN_EMAIL =
  process.env.EXPO_PUBLIC_DEV_LOGIN_EMAIL ?? "arsavinwallentyn@gmail.com";

type GoogleOAuthPurpose = "login" | "link";

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
  /** Run Google OAuth and return an id_token (does not log in). */
  obtainGoogleIdToken: () => Promise<string>;
  /** Link a Google account to the current session (never uses login endpoints). */
  linkGoogleIdentity: (idToken: string) => Promise<void>;
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
  const googleOAuthPurposeRef = React.useRef<GoogleOAuthPurpose>("login");
  const pendingGoogleTokenRef = React.useRef<{
    resolve: (token: string) => void;
    reject: (err: Error) => void;
  } | null>(null);

  const settlePendingGoogleToken = React.useCallback(
    (err: Error | null, token?: string) => {
      const pending = pendingGoogleTokenRef.current;
      if (!pending) return false;
      pendingGoogleTokenRef.current = null;
      if (err) pending.reject(err);
      else if (token) pending.resolve(token);
      else pending.reject(new Error("Google sign-in failed"));
      return true;
    },
    []
  );

  const exchangeCodeForGoogleIdToken = React.useCallback(
    async (code: string, codeVerifier?: string) => {
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
      return idToken;
    },
    [isWeb]
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
      setUser(mapPlayerToUser(data.user));
      setError(null);
      // Fire-and-forget: push registration must never block the login flow.
      void syncPushToken();
      // Flush any referral deeplink refs captured while logged out.
      void flushReferralQueue();
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

  const linkGoogleIdentity = React.useCallback(
    async (idToken: string) => {
      await apiLinkGoogleIdentity(idToken);
      await refreshMe();
    },
    [refreshMe]
  );

  const obtainGoogleIdToken = React.useCallback(async () => {
    if (pendingGoogleTokenRef.current) {
      throw new Error("Google sign-in already in progress");
    }
    return new Promise<string>((resolve, reject) => {
      pendingGoogleTokenRef.current = { resolve, reject };
      googleOAuthPurposeRef.current = "link";
      setError(null);
      void promptAsync();
    });
  }, [promptAsync]);

  // Process each expo-auth-session result exactly once: exchange the code via the BFF,
  // then forward the Google id_token the BFF returns to Laravel. Depending only on
  // `response` (plus a ref guard) is essential — otherwise unrelated re-renders would
  // re-process the old "success" result and re-trigger login in an infinite loop.
  const processedResponseRef = React.useRef<unknown>(null);

  React.useEffect(() => {
    if (!response || processedResponseRef.current === response) return;
    processedResponseRef.current = response;

    if (response.type === "error") {
      const err =
        (response.error as unknown as Error) ?? new Error("Google sign-in failed");
      if (settlePendingGoogleToken(err)) return;
      setError(err);
      return;
    }
    if (response.type === "cancel" || response.type === "dismiss") {
      const err = new Error("Google sign-in was cancelled");
      if (settlePendingGoogleToken(err)) return;
      return;
    }
    if (response.type !== "success") return;

    const purpose = googleOAuthPurposeRef.current;
    const codeVerifier = request?.codeVerifier;
    void (async () => {
      const forLink = purpose === "link";
      if (!forLink) setIsLoading(true);
      try {
        const { code } = response.params;
        const idToken = await exchangeCodeForGoogleIdToken(code, codeVerifier);

        if (forLink) {
          settlePendingGoogleToken(null, idToken);
          return;
        }

        await signInWithGoogle(idToken);
      } catch (e) {
        const err = e as Error;
        if (settlePendingGoogleToken(err)) return;
        setError(err);
      } finally {
        if (!forLink) setIsLoading(false);
      }
    })();
    // Only react to a new auth response; request/isWeb/signInWithGoogle are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const signIn = React.useCallback(async () => {
    googleOAuthPurposeRef.current = "login";
    setError(null);
    const result = await promptAsync();
    if (!result) return;
    if (result.type === "cancel" || result.type === "dismiss") {
      const err = new Error("Google sign-in was cancelled");
      setError(err);
      throw err;
    }
    if (result.type === "error") {
      const err =
        (result.error as unknown as Error) ?? new Error("Google sign-in failed");
      setError(err);
      throw err;
    }
  }, [promptAsync]);

  const signOut = React.useCallback(async () => {
    try {
      // Drop the device token first — the DELETE needs the bearer token to still work.
      await clearPushToken();
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
        void syncPushToken();
        void flushReferralQueue();
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
    obtainGoogleIdToken,
    linkGoogleIdentity,
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
