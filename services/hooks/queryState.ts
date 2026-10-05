import type { UseQueryResult } from "@tanstack/react-query";
import type { ApiError } from "@/services/apiError";
import { GUEST_VIEWER, type Viewer } from "@/lib/queryClient";
import { useAuth } from "@/context/auth";

/**
 * Thin, screen-friendly view over a React Query result. Screens only care about
 * `data` (null until loaded), the initial `loading` flag, `error` and a no-arg `refetch`.
 */
export type QueryState<T> = {
  data: T | null;
  /** True only while the first load is in flight (not on background refetches). */
  loading: boolean;
  error: ApiError | Error | null;
  refetch: () => void;
};

export function toQueryState<T>(query: UseQueryResult<T, Error>): QueryState<T> {
  const { data, isLoading, error, refetch } = query;
  return {
    data: data ?? null,
    loading: isLoading,
    error,
    // Wrapped so it is safe to hand to `onPress` (no event arg leaks in as options).
    refetch: () => {
      void refetch();
    },
  };
}

/** Cache scope for the current session plus whether an authed request may run. */
export function useViewer(): { viewer: Viewer; isAuthed: boolean } {
  const { user } = useAuth();
  return {
    viewer: user ? String(user.id) : GUEST_VIEWER,
    isAuthed: Boolean(user),
  };
}
