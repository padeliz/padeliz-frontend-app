import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import { toQueryState, useViewer } from "@/services/hooks/queryState";
import {
  activeRegistration,
  activeRegistrations,
  fetchBankTransferSettings,
  fetchMyRegistrations,
  openCheckoutId,
  type BankTransferSettingsQuery,
} from "@/services/registration";
import type { EventRegistration } from "@/types/api";

/**
 * Registration / payment state is mutated by several screens (create, pay, cancel),
 * so it is always re-validated on mount rather than trusted for the default 60s.
 * After a mutation, call `refetch` or invalidate `queryKeys.registrations.all(viewer)`.
 */
const REGISTRATION_STALE_TIME = 0;

/** The player's registrations, optionally scoped to a single event. */
export function useRegistrations(eventId?: number, enabled = true) {
  const { viewer, isAuthed } = useViewer();
  return toQueryState(
    useQuery({
      queryKey: queryKeys.registrations.list(viewer, eventId),
      queryFn: ({ signal }) => fetchMyRegistrations(eventId, signal),
      enabled: enabled && isAuthed,
      staleTime: REGISTRATION_STALE_TIME,
    })
  );
}

export type EventRegistrationState = ReturnType<typeof useRegistrations> & {
  /** All live registrations for the event. */
  registrations: EventRegistration[];
  /** First live registration (legacy single-reg callers). */
  registration: EventRegistration | null;
  /** Open checkout id shared by unpaid/awaiting regs, if any. */
  checkoutId: number | null;
};

/** `useRegistrations` scoped to one event, with active records pre-resolved. */
export function useEventRegistration(
  eventId: number,
  enabled = true
): EventRegistrationState {
  const state = useRegistrations(eventId, enabled);
  const registrations = useMemo(
    () => activeRegistrations(state.data),
    [state.data]
  );
  const registration = useMemo(
    () => activeRegistration(state.data),
    [state.data]
  );
  const checkoutId = useMemo(
    () => openCheckoutId(registrations),
    [registrations]
  );
  return {
    ...state,
    registrations,
    registration,
    checkoutId,
  };
}

/**
 * Bank transfer details for the manual payment step. Pass `enabled=false` (e.g. before
 * a checkout exists) to skip the request; data is null when unconfigured.
 * Prefer `checkoutId` so the payment reference uses `{checkout_id}`.
 */
export function useBankTransferSettings(
  checkoutOrRegistrationId: number | null | BankTransferSettingsQuery,
  enabled = true
) {
  const { viewer, isAuthed } = useViewer();
  const query: BankTransferSettingsQuery =
    typeof checkoutOrRegistrationId === "number" ||
    checkoutOrRegistrationId === null
      ? { checkoutId: checkoutOrRegistrationId }
      : checkoutOrRegistrationId;

  const checkoutId = query.checkoutId ?? null;
  const registrationId = query.registrationId ?? null;
  const hasKey = checkoutId !== null || registrationId !== null;

  return toQueryState(
    useQuery({
      queryKey: queryKeys.bankTransferSettings(viewer, {
        checkoutId,
        registrationId,
      }),
      queryFn: ({ signal }) =>
        fetchBankTransferSettings({ checkoutId, registrationId }, signal),
      enabled: enabled && isAuthed && hasKey,
      staleTime: REGISTRATION_STALE_TIME,
    })
  );
}
