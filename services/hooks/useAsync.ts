/**
 * Minimal data-fetching primitive: runs an async fn, tracks loading/error, cancels
 * in-flight requests on dependency change/unmount, and exposes `refetch`.
 *
 * Kept deliberately small (no extra deps). If the app later adopts @tanstack/react-query,
 * the `services/*.ts` fetch fns become queryFns and these hooks become useQuery wrappers.
 */
import { useCallback, useEffect, useState } from "react";
import type { ApiError } from "@/services/apiError";

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: ApiError | Error | null;
};

export function useAsync<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  deps: unknown[]
): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));

    fn(controller.signal)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (controller.signal.aborted || !active) return;
        setState((s) => ({ data: s.data, loading: false, error: err as Error }));
      });

    return () => {
      active = false;
      controller.abort();
    };
    // fn is intentionally excluded; callers express identity via `deps`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { ...state, refetch };
}
