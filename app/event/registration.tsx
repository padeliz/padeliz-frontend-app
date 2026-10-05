/**
 * Registration + payment flow for one event (multi-division checkout).
 *
 * Step 1 drafts divisions locally, then Reserve creates unpaid regs + open checkout.
 * Step 2 shows multi-checkout payment boxes (Pay for it → method modal). Step 3 is status.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import Steps from '@/components/Visuals/Steps';
import Button from '@/components/Buttons/Button';
import ScreenHeader from '@/components/Navigation/ScreenHeader';
import StepNavButtons from '@/components/Eligibility/StepNavButtons';
import StepDivision, {
  type DivisionCardState,
} from '@/components/Registration/StepDivision';
import StepPayment, {
  type CheckoutBoxView,
} from '@/components/Registration/StepPayment';
import StepPending, {
  type StatusDivisionLine,
} from '@/components/Registration/StepPending';
import PaymentMethodModal from '@/components/Registration/PaymentMethodModal';
import CancelRegistrationModal, {
  type CancelableRegistration,
} from '@/components/Registration/CancelRegistrationModal';
import type { PaymentLine } from '@/components/Registration/PaymentDetailsCard';
import { useEvent } from '@/services/hooks/useEvents';
import { useEligibilityGate } from '@/services/hooks/useEligibility';
import {
  eventDetailPath,
  eventEligibilityPath,
} from '@/utils/eventPaths';
import {
  useBankTransferSettings,
  useEventRegistration,
} from '@/services/hooks/useRegistrations';
import { openPaymentUrl } from '@/services/openPaymentUrl';
import {
  activeRegistrations,
  awaitingProofRegistrations,
  cancelRegistration,
  commitBenefitSelections,
  createRegistrations,
  excludeFromCheckout,
  fetchCheckoutQuote,
  fetchEventCheckouts,
  openCheckoutId,
  payableRegistrations,
  registrationDivisionLabel,
  resetCheckoutPayment,
  sharedPaymentMethod,
  startNetopiaPayment,
  uploadBankProof,
} from '@/services/registration';
import { confirmAsync } from '@/services/confirm';
import {
  eventDivisionOptions,
  eventToDetails,
  formatPaymentDueAt,
  hhmm,
  registrationToEventStatus,
} from '@/services/mappers';
import type {
  CheckoutQuoteData,
  CheckoutQuoteEligibleBenefit,
  Event,
  EventRegistration,
  EventRegistrationCheckout,
  RegistrationCancelReason,
  RegistrationPaymentMethod,
} from '@/types/api';
import type { DivisionDetails } from '@/types/types';

const STEP_LABELS = ['Division', 'Payment', 'Status'];

const STEP_NAV: Record<number, { back?: string; forward?: string }> = {
  1: { forward: 'Reserve' },
  2: { back: 'Division', forward: 'Go to Status' },
  3: { back: 'Payment', forward: 'See Event' },
};

function stepForRegistrations(regs: EventRegistration[]): number {
  if (regs.some((r) => r.payment_status === 'unpaid' && Number(r.amount_due) > 0)) {
    return 2;
  }
  if (regs.length > 0) return 3;
  return 1;
}

function optionalBenefitsFromQuote(
  quote: CheckoutQuoteData | null
): CheckoutQuoteEligibleBenefit[] {
  if (!quote) return [];
  const byId = new Map<number, CheckoutQuoteEligibleBenefit>();
  for (const line of quote.lines) {
    for (const eligible of line.quote.eligible) {
      if (!eligible.player_optional) continue;
      if (!byId.has(eligible.benefit_id)) byId.set(eligible.benefit_id, eligible);
    }
  }
  return [...byId.values()];
}

function applyQuoteToRegistrations(
  regs: EventRegistration[],
  quote: CheckoutQuoteData
): EventRegistration[] {
  return regs.map((reg) => {
    const line = quote.lines.find((l) => l.registration_id === reg.id_registration);
    if (!line) return reg;
    return {
      ...reg,
      payment: Number(line.quote.base_fee) || reg.payment,
      amount_due: Number(line.quote.amount_due) || Number(line.amount) || reg.amount_due,
      redemptions: line.quote.applied.map((a) => ({
        benefit_definition_id: a.benefit_id,
        benefit_name: a.name,
        amount_ron: a.amount_ron,
        selection_source: a.selection_source,
      })),
    };
  });
}

function checkoutStatusLabel(status: string): string {
  switch (status) {
    case 'open':
      return 'Open';
    case 'awaiting_proof':
      return 'Awaiting proof';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
}

function formatCheckoutDate(ts: number | null | undefined): string {
  if (ts == null || ts <= 0) return '';
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function playingTimeFor(
  reg: EventRegistration,
  event: Event | null | undefined
): string {
  const div =
    reg.event_division ??
    event?.event_divisions?.find(
      (d) => d.id_event_division === reg.event_division_id
    );
  if (!div) return '—';
  const start = hhmm(div.playing_start_time);
  const end = hhmm(div.playing_end_time);
  if (start && end) return `${start} - ${end}`;
  if (start) return `from ${start}`;
  return '—';
}

function divisionColorFor(
  reg: EventRegistration,
  event: Event | null | undefined
): string | null {
  const embedded = reg.event_division?.division?.color;
  if (typeof embedded === 'string') return embedded;
  const fromEvent = event?.event_divisions?.find(
    (d) => d.id_event_division === reg.event_division_id
  );
  const color = fromEvent?.division?.color;
  return typeof color === 'string' ? color : null;
}

function activeItemsOf(checkout: EventRegistrationCheckout) {
  return (checkout.items ?? []).filter((i) => i.item_status === 'active');
}

function quoteLinesToPaymentLines(
  quote: CheckoutQuoteData,
  regs: EventRegistration[],
  event: Event | null | undefined,
  selectedBenefitIds: number[]
): PaymentLine[] {
  return quote.lines.map((line) => {
    const reg = regs.find((r) => r.id_registration === line.registration_id);
    const appliedIds = new Set(line.quote.applied.map((a) => a.benefit_id));
    const redemptions = [
      ...line.quote.applied.map((a) => ({
        name: a.name,
        amount_ron: a.amount_ron,
      })),
      ...line.quote.eligible
        .filter(
          (e) =>
            e.player_optional &&
            selectedBenefitIds.includes(e.benefit_id) &&
            !appliedIds.has(e.benefit_id)
        )
        .map((e) => ({ name: e.name, amount_ron: e.amount_ron })),
    ];
    return {
      label: reg
        ? registrationDivisionLabel(reg, event)
        : `Division ${line.event_division_id ?? ''}`,
      fee: Number(line.quote.base_fee) || Number(line.base_amount_ron) || 0,
      redemptions,
    };
  });
}

function buildCheckoutBoxes(
  checkouts: EventRegistrationCheckout[],
  quote: CheckoutQuoteData | null,
  openId: number | null,
  regs: EventRegistration[],
  event: Event | null | undefined,
  selectedBenefitIds: number[]
): CheckoutBoxView[] {
  return checkouts.map((checkout) => {
    const items = activeItemsOf(checkout);
    const isOpen = checkout.status === 'open';
    const isCompleted = checkout.status === 'completed';
    const isAwaiting = checkout.status === 'awaiting_proof';

    let lines: PaymentLine[];
    if (isOpen && openId === checkout.id_checkout && quote && quote.lines.length > 0) {
      lines = quoteLinesToPaymentLines(quote, regs, event, selectedBenefitIds);
    } else {
      lines = items.map((item) => {
        const reg =
          item.registration ??
          regs.find((r) => r.id_registration === item.registration_id);
        return {
          label: reg
            ? registrationDivisionLabel(reg, event)
            : `Registration ${item.registration_id}`,
          fee: isCompleted
            ? Number(item.amount) || 0
            : Number(reg?.payment) || Number(item.amount) || 0,
          redemptions: (reg?.redemptions ?? []).map((r) => ({
            name: r.benefit_name,
            amount_ron: r.amount_ron,
          })),
        };
      });
    }

    const payableTotal =
      isOpen && openId === checkout.id_checkout && quote
        ? Number(quote.total_amount) || 0
        : items.reduce((sum, item) => {
            const reg =
              item.registration ??
              regs.find((r) => r.id_registration === item.registration_id);
            return sum + (Number(reg?.amount_due) || Number(item.amount) || 0);
          }, 0);

    const overdue =
      isOpen &&
      items.some((item) => {
        const reg =
          item.registration ??
          regs.find((r) => r.id_registration === item.registration_id);
        return Boolean(reg?.is_overdue);
      });

    const dueHint = items
      .map((item) => {
        const reg =
          item.registration ??
          regs.find((r) => r.id_registration === item.registration_id);
        return formatPaymentDueAt(reg?.payment_due_at);
      })
      .find(Boolean);

    const showPay = isOpen && payableTotal > 0 && !isAwaiting;

    return {
      key: String(checkout.id_checkout),
      statusLabel: checkoutStatusLabel(String(checkout.status)),
      dateLabel: formatCheckoutDate(
        isCompleted ? checkout.paid_at : checkout.inserted_at
      ),
      lines,
      totalLabel: isCompleted ? 'Total paid' : 'Total',
      showPay,
      payDisabled: overdue,
      overdueMessage: overdue
        ? dueHint
          ? `Overdue · was due ${dueHint}`
          : 'Payment deadline has passed. Reset or cancel from Status to continue.'
        : null,
    };
  });
}

function regsFromCheckout(
  checkout: EventRegistrationCheckout | null | undefined,
  fallback: EventRegistration[]
): EventRegistration[] {
  const next =
    checkout?.items
      ?.filter((i) => i.item_status === 'active' && i.registration)
      .map((i) => i.registration!) ?? [];
  return next.length > 0 ? next : fallback;
}

export default function RegistrationScreen() {
  const { eventId: eventIdParam, initialStep } = useLocalSearchParams<{
    eventId: string;
    initialStep?: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const eventId = Number(eventIdParam);
  const { data: event, loading: eventLoading } = useEvent(eventId);
  const gate = useEligibilityGate();
  const {
    registrations: existingRegistrations,
    loading: registrationLoading,
    refetch: refetchRegistration,
  } = useEventRegistration(eventId);

  const syncRegistrationQueries = () => {
    refetchRegistration();
    void queryClient.invalidateQueries({ queryKey: ['registrations'] });
    void queryClient.invalidateQueries({ queryKey: ['events'] });
    void queryClient.invalidateQueries({ queryKey: ['bankTransferSettings'] });
  };

  const [currentStep, setCurrentStep] = useState(
    initialStep ? parseInt(initialStep, 10) : 1
  );
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [selectedDivisionIds, setSelectedDivisionIds] = useState<number[]>([]);
  const [checkouts, setCheckouts] = useState<EventRegistrationCheckout[]>([]);
  const [quote, setQuote] = useState<CheckoutQuoteData | null>(null);
  const [selectedBenefitIds, setSelectedBenefitIds] = useState<number[]>([]);
  const [selectedReferrerId, setSelectedReferrerId] = useState<number | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payModalError, setPayModalError] = useState<string | null>(null);
  const [cancelTargets, setCancelTargets] = useState<CancelableRegistration[] | null>(
    null
  );
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adoptedRef = useRef(false);
  const existingKey = existingRegistrations
    .map((r) => `${r.id_registration}:${r.payment_status}:${r.checkout_id ?? ''}`)
    .join('|');

  useEffect(() => {
    if (!existingRegistrations.length) return;
    setRegistrations(existingRegistrations);
    if (adoptedRef.current) return;
    adoptedRef.current = true;
    // Drafts stay local until Reserve — existing regs are reserved/paid via divisionStates.
    setSelectedDivisionIds([]);
    if (!initialStep) setCurrentStep(stepForRegistrations(existingRegistrations));
    // existingRegistrations is mirrored via existingKey to avoid identity churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingKey, initialStep]);

  const checkoutId = openCheckoutId(registrations);
  const activeRegs = activeRegistrations(registrations);
  const isAwaiting = awaitingProofRegistrations(registrations).length > 0;
  const editLocked = isAwaiting;

  const { data: bankSettings } = useBankTransferSettings(
    { checkoutId, registrationId: registrations[0]?.id_registration ?? null },
    payModalOpen
  );

  useEffect(() => {
    if (currentStep !== 2) return;
    let cancelled = false;
    (async () => {
      setBusy(true);
      setError(null);
      try {
        const openId = openCheckoutId(registrations);
        const [quoteData, listData] = await Promise.all([
          openId != null ? fetchCheckoutQuote(openId) : Promise.resolve(null),
          fetchEventCheckouts(eventId),
        ]);
        if (cancelled) return;
        setCheckouts(listData.checkouts ?? []);
        if (quoteData) {
          setQuote(quoteData);
          if (quoteData.lines.length > 0) {
            setRegistrations((prev) => applyQuoteToRegistrations(prev, quoteData));
          }
          const appliedOptional = new Set<number>();
          for (const line of quoteData.lines) {
            for (const a of line.quote.applied) {
              const eligible = line.quote.eligible.find(
                (e) => e.benefit_id === a.benefit_id && e.player_optional
              );
              if (eligible) appliedOptional.add(a.benefit_id);
            }
          }
          setSelectedBenefitIds([...appliedOptional]);
          const candidates = quoteData.referrer_candidates ?? [];
          if (candidates.length === 1) {
            setSelectedReferrerId(candidates[0].referrer_player_id);
          }
        } else {
          setQuote(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message || 'Could not load payment details.');
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Re-load when entering payment or when the open checkout id changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, eventId, checkoutId]);

  const catalog = event ? eventDivisionOptions(event) : [];
  const existingDivisionIds = useMemo(() => {
    const ids = new Set<number>();
    for (const r of activeRegs) {
      if (r.event_division_id != null) ids.add(r.event_division_id);
    }
    return ids;
  }, [activeRegs]);

  const divisionStates = useMemo(() => {
    const states: Record<number, DivisionCardState> = {};
    for (const r of activeRegs) {
      if (r.event_division_id == null) continue;
      if (r.payment_status === 'paid') {
        states[r.event_division_id] = 'paid';
      } else if (
        r.payment_status === 'unpaid' ||
        r.payment_status === 'awaiting_proof_review'
      ) {
        states[r.event_division_id] = 'reserved';
      }
    }
    for (const id of selectedDivisionIds) {
      if (!states[id]) states[id] = 'selected';
    }
    return states;
  }, [activeRegs, selectedDivisionIds]);

  const draftIds = selectedDivisionIds.filter((id) => !existingDivisionIds.has(id));
  const hasNewDrafts = draftIds.length > 0;

  const boxes = buildCheckoutBoxes(
    checkouts,
    quote,
    checkoutId,
    registrations,
    event,
    selectedBenefitIds
  );
  const optionalBenefits = optionalBenefitsFromQuote(quote);
  const referrerCandidates = quote?.referrer_candidates ?? [];
  const benefitsDisabled =
    referrerCandidates.length >= 2 && selectedReferrerId == null;

  const registeredLines: StatusDivisionLine[] = activeRegs
    .filter((r) => r.payment_status === 'paid')
    .map((r) => {
      let amount = Number(r.payment) || 0;
      for (const checkout of checkouts) {
        const item = activeItemsOf(checkout).find(
          (i) => i.registration_id === r.id_registration
        );
        if (item) {
          amount = Number(item.amount) || amount;
          break;
        }
      }
      return {
        id: r.id_registration,
        name: registrationDivisionLabel(r, event),
        playingTime: playingTimeFor(r, event),
        amount,
        color: divisionColorFor(r, event),
      };
    });
  const totalPaid = registeredLines.reduce((sum, line) => sum + line.amount, 0);

  const pendingLines: StatusDivisionLine[] = activeRegs
    .filter(
      (r) =>
        r.payment_status === 'unpaid' || r.payment_status === 'awaiting_proof_review'
    )
    .map((r) => ({
      id: r.id_registration,
      name: registrationDivisionLabel(r, event),
      playingTime: playingTimeFor(r, event),
      amount: Number(r.amount_due) || 0,
      color: divisionColorFor(r, event),
    }));
  const pendingDue = pendingLines.reduce((sum, line) => sum + line.amount, 0);

  const enabledSteps = activeRegs.length > 0 ? [1, 2, 3] : [1];

  const goBackToEvent = () => {
    if (eventId) {
      router.replace(eventDetailPath(eventId, event?.slug) as any);
    } else {
      router.replace('/' as any);
    }
  };

  const refreshPaymentData = async () => {
    const openId = openCheckoutId(registrations) ?? checkoutId;
    const [listData, quoteData] = await Promise.all([
      fetchEventCheckouts(eventId),
      openId != null ? fetchCheckoutQuote(openId).catch(() => null) : Promise.resolve(null),
    ]);
    setCheckouts(listData.checkouts ?? []);
    if (quoteData) {
      setQuote(quoteData);
      setRegistrations((prev) => applyQuoteToRegistrations(prev, quoteData));
    }
    syncRegistrationQueries();
  };

  const Header = (
    <ScreenHeader
      title="Registration Process"
      variant="stack"
      onBack={() => router.back()}
    />
  );

  if (eventLoading || registrationLoading || gate.loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {Header}
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.BLUE} />
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {Header}
        <View style={styles.centered}>
          <Text style={styles.notFoundText}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!gate.isApproved && registrations.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {Header}
        <View style={styles.gate} testID="eligibility-gate">
          <Text style={styles.gateTitle}>
            {gate.isPending ? 'Eligibility Check in Pending' : 'Eligibility Required'}
          </Text>
          <Text style={styles.gateBody}>
            {gate.isPending
              ? 'We are still reviewing your eligibility request. You can register as soon as it is approved.'
              : 'Registration opens once your eligibility request has been approved.'}
          </Text>
          {gate.isPending ? (
            <Button label="Back to Event" variant="secondary" onPress={goBackToEvent} />
          ) : (
            <Button
              label="Check Eligibility"
              onPress={() =>
                router.replace(eventEligibilityPath(eventId) as any)
              }
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const details = eventToDetails(
    event,
    registrationToEventStatus(registrations, gate)
  );

  const toggleDivision = (division: DivisionDetails) => {
    if (editLocked) return;

    const existing = activeRegs.find((r) => r.event_division_id === division.id);
    if (existing?.payment_status === 'paid') return;

    if (existing && existing.payment_status === 'unpaid') {
      setCancelError(null);
      setCancelTargets([
        {
          id: existing.id_registration,
          label: registrationDivisionLabel(existing, event),
        },
      ]);
      return;
    }

    setSelectedDivisionIds((prev) =>
      prev.includes(division.id)
        ? prev.filter((id) => id !== division.id)
        : [...prev, division.id]
    );
  };

  const submitDivision = async () => {
    if (hasNewDrafts && !editLocked) {
      setBusy(true);
      setError(null);
      try {
        const created = await createRegistrations(eventId, draftIds);
        adoptedRef.current = true;
        const next = [
          ...registrations.filter(
            (r) =>
              !created.registrations.some(
                (c) => c.id_registration === r.id_registration
              )
          ),
          ...created.registrations,
        ];
        setRegistrations(next);
        setSelectedDivisionIds([]);
        setCurrentStep(2);
        syncRegistrationQueries();
      } catch (e) {
        setError((e as Error).message || 'Could not reserve the divisions.');
      } finally {
        setBusy(false);
      }
      return;
    }

    if (activeRegs.length > 0) {
      setCurrentStep(2);
    }
  };

  const resolveReferrerId = (override?: number | null) => {
    if (referrerCandidates.length === 1) {
      return referrerCandidates[0].referrer_player_id;
    }
    if (override !== undefined) return override;
    return selectedReferrerId;
  };

  const commitSelections = async (
    benefitIds: number[],
    referrerOverride?: number | null
  ) => {
    if (checkoutId == null) return;
    const referrerId = resolveReferrerId(referrerOverride);
    if (referrerCandidates.length >= 2 && referrerId == null) return;

    setBusy(true);
    setError(null);
    try {
      const checkout = await commitBenefitSelections(checkoutId, {
        selected_benefit_ids: benefitIds,
        referrer_player_id: referrerId ?? undefined,
      });
      if (checkout.items) {
        const next = regsFromCheckout(checkout, registrations);
        if (next.length) setRegistrations(next);
      }
      const refreshed = await fetchCheckoutQuote(checkoutId);
      setQuote(refreshed);
      setRegistrations((prev) => applyQuoteToRegistrations(prev, refreshed));
    } catch (e) {
      setError((e as Error).message || 'Could not update benefit selections.');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleBenefit = (benefitId: number) => {
    if (benefitsDisabled) return;
    const next = selectedBenefitIds.includes(benefitId)
      ? selectedBenefitIds.filter((id) => id !== benefitId)
      : [...selectedBenefitIds, benefitId];
    setSelectedBenefitIds(next);
    void commitSelections(next);
  };

  const handleSelectReferrer = (playerId: number) => {
    setSelectedReferrerId(playerId);
    void commitSelections(selectedBenefitIds, playerId);
  };

  const ensurePaymentPathReady = async (
    nextMethod: RegistrationPaymentMethod
  ): Promise<boolean> => {
    const current = sharedPaymentMethod(registrations);
    const needsReset =
      isAwaiting || (current != null && current !== nextMethod);

    if (!needsReset || checkoutId == null) return true;

    const confirmed = await confirmAsync(
      'Reset payment path',
      'This clears the current payment method and rejects any pending proof so you can pay again. Continue?'
    );
    if (!confirmed) return false;

    const { checkout } = await resetCheckoutPayment(checkoutId);
    setRegistrations(regsFromCheckout(checkout, registrations.map((r) => ({
      ...r,
      payment_status: 'unpaid' as const,
      payment_method: null,
    }))));
    return true;
  };

  const handleStartNetopia = async () => {
    setPayModalError(null);
    setBusy(true);
    try {
      const ok = await ensurePaymentPathReady('netopia');
      if (!ok) return;

      const anchorId =
        checkoutId ??
        payableRegistrations(registrations)[0]?.id_registration ??
        registrations[0]?.id_registration;
      if (anchorId == null) {
        setPayModalError('No payable registration found.');
        return;
      }

      const { attempt, checkout, registration } = await startNetopiaPayment(anchorId, {
        checkoutId,
      });
      if (checkout?.items) {
        const next = regsFromCheckout(checkout, registrations);
        if (next.length) setRegistrations(next);
      } else if (registration) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id_registration === registration.id_registration ? registration : r
          )
        );
      }

      const redirectUrl = attempt.redirect_url;
      if (!redirectUrl) {
        setPayModalError(
          'Netopia did not return a payment page URL. Check backend Netopia config.'
        );
        return;
      }

      const opened = await openPaymentUrl(redirectUrl);
      if (opened.platform === 'web') return;
      await refreshPaymentData();
      setPayModalOpen(false);
    } catch (e) {
      setPayModalError((e as Error).message || 'Could not start the payment.');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitBankProof = async (uri: string) => {
    setPayModalError(null);
    setBusy(true);
    try {
      const ok = await ensurePaymentPathReady('bank_transfer');
      if (!ok) return;

      const anchorId =
        checkoutId ??
        payableRegistrations(registrations)[0]?.id_registration ??
        registrations[0]?.id_registration;
      if (anchorId == null) {
        setPayModalError('No payable registration found.');
        return;
      }

      const { checkout, registration } = await uploadBankProof(anchorId, uri, {
        checkoutId,
      });
      if (checkout?.items) {
        const next = regsFromCheckout(checkout, registrations);
        if (next.length) setRegistrations(next);
      } else if (registration) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id_registration === registration.id_registration ? registration : r
          )
        );
      }
      await refreshPaymentData();
      setPayModalOpen(false);
    } catch (e) {
      setPayModalError((e as Error).message || 'Could not upload the payment proof.');
    } finally {
      setBusy(false);
    }
  };

  const handleResetPaymentPath = async () => {
    if (checkoutId == null) {
      setError('No active checkout to reset.');
      return;
    }
    const confirmed = await confirmAsync(
      'Reset payment path',
      'This clears the payment method and rejects any pending proof. Continue?'
    );
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    try {
      const { checkout } = await resetCheckoutPayment(checkoutId);
      setRegistrations(
        regsFromCheckout(
          checkout,
          registrations.map((r) => ({
            ...r,
            payment_status: 'unpaid' as const,
            payment_method: null,
          }))
        )
      );
      setCurrentStep(2);
      syncRegistrationQueries();
    } catch (e) {
      setError((e as Error).message || 'Could not reset the payment path.');
    } finally {
      setBusy(false);
    }
  };

  const handleCancelConfirm = async (
    reason: RegistrationCancelReason,
    registrationIds: number[]
  ) => {
    if (registrationIds.length === 0) return;
    setBusy(true);
    setCancelError(null);
    setError(null);
    try {
      const awaitingIds = registrationIds.filter((id) =>
        registrations.some(
          (r) =>
            r.id_registration === id && r.payment_status === 'awaiting_proof_review'
        )
      );
      const otherIds = registrationIds.filter((id) => !awaitingIds.includes(id));

      if (awaitingIds.length > 0) {
        const openId = openCheckoutId(registrations) ?? checkoutId;
        if (openId == null) {
          throw new Error('No open checkout to exclude from.');
        }
        const { checkout } = await excludeFromCheckout(openId, awaitingIds, reason);
        setRegistrations((prev) => {
          const remaining = regsFromCheckout(
            checkout,
            prev.filter((r) => !awaitingIds.includes(r.id_registration))
          );
          // Drop cancelled awaiting that disappeared from checkout actives.
          const activeIds = new Set(remaining.map((r) => r.id_registration));
          if (remaining.length > 0) return remaining;
          return prev.filter(
            (r) =>
              !awaitingIds.includes(r.id_registration) &&
              (activeIds.size === 0 || activeIds.has(r.id_registration))
          );
        });
      }

      for (const id of otherIds) {
        await cancelRegistration(id, reason);
      }
      if (otherIds.length > 0) {
        setRegistrations((prev) =>
          prev.filter((r) => !otherIds.includes(r.id_registration))
        );
      }

      setSelectedDivisionIds((prev) =>
        prev.filter((divId) => {
          const still = registrations.find(
            (r) =>
              r.event_division_id === divId &&
              !registrationIds.includes(r.id_registration)
          );
          return still != null || !existingDivisionIds.has(divId);
        })
      );
      setCancelTargets(null);
      syncRegistrationQueries();
    } catch (e) {
      setCancelError((e as Error).message || 'Could not cancel the registration.');
    } finally {
      setBusy(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
      return;
    }
    if (currentStep === 2) {
      setCurrentStep(1);
      return;
    }
    router.back();
  };

  const handleForward = () => {
    if (busy) return;
    if (currentStep === 1) void submitDivision();
    else if (currentStep === 2) setCurrentStep(3);
    else goBackToEvent();
  };

  const nav = STEP_NAV[currentStep] ?? {};
  const forwardLabel =
    currentStep === 1
      ? hasNewDrafts && !editLocked
        ? 'Reserve'
        : activeRegs.length > 0
          ? 'Payment'
          : undefined
      : nav.forward;

  const canAdvance =
    (currentStep === 1 &&
      ((hasNewDrafts && !editLocked) || activeRegs.length > 0)) ||
    currentStep === 2 ||
    currentStep === 3;

  const showReset =
    activeRegs.some(
      (r) =>
        r.payment_status === 'unpaid' || r.payment_status === 'awaiting_proof_review'
    ) && checkoutId != null;

  const showStatusCancel = activeRegs.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {Header}

      <View style={styles.stepper}>
        <Steps
          labels={STEP_LABELS}
          currentStep={currentStep}
          color={Colors.BLUE}
          enabledSteps={enabledSteps}
          onStepPress={setCurrentStep}
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {error ? (
          <Text style={styles.error} testID="registration-error">
            {error}
          </Text>
        ) : null}

        {currentStep === 1 && (
          <StepDivision
            event={details}
            divisions={catalog}
            selectedDivisionIds={selectedDivisionIds}
            divisionStates={divisionStates}
            onToggle={toggleDivision}
            editLocked={editLocked}
            lockMessage={
              editLocked
                ? 'Divisions can’t be edited while payment proof is under review. Use Cancel proof on the Payment step first.'
                : undefined
            }
          />
        )}
        {currentStep === 2 && (
          <StepPayment
            event={details}
            boxes={boxes}
            checkouts={checkouts}
            onPayForIt={() => {
              setPayModalError(null);
              setPayModalOpen(true);
            }}
            onResetPaymentPath={
              showReset ? () => void handleResetPaymentPath() : undefined
            }
            resetting={busy}
            optionalBenefits={optionalBenefits}
            selectedBenefitIds={selectedBenefitIds}
            benefitsDisabled={benefitsDisabled}
            onToggleBenefit={handleToggleBenefit}
            referrerCandidates={referrerCandidates}
            selectedReferrerId={selectedReferrerId}
            onSelectReferrer={handleSelectReferrer}
          />
        )}
        {currentStep === 3 && (
          <StepPending
            event={details}
            registered={registeredLines}
            totalPaid={totalPaid}
            pending={pendingLines}
            pendingDue={pendingDue}
            onCancelRegistrations={
              showStatusCancel
                ? () => {
                    setCancelError(null);
                    setCancelTargets(
                      activeRegs.map((r) => ({
                        id: r.id_registration,
                        label: registrationDivisionLabel(r, event),
                      }))
                    );
                  }
                : undefined
            }
          />
        )}
      </ScrollView>

      {busy ? (
        <View style={styles.busy} testID="registration-busy">
          <ActivityIndicator color={Colors.BLUE} />
        </View>
      ) : (
        <StepNavButtons
          onBack={nav.back ? handleBack : undefined}
          backLabel={nav.back}
          onForward={
            canAdvance && forwardLabel ? handleForward : undefined
          }
          forwardLabel={forwardLabel}
          forwardDisabled={!canAdvance && currentStep !== 3}
          isFinalForward={currentStep === 3}
        />
      )}

      <PaymentMethodModal
        visible={payModalOpen}
        bankSettings={bankSettings}
        busy={busy}
        error={payModalError}
        onClose={() => setPayModalOpen(false)}
        onStartNetopia={() => void handleStartNetopia()}
        onSubmitBankProof={(uri) => void handleSubmitBankProof(uri)}
      />

      <CancelRegistrationModal
        visible={cancelTargets != null}
        submitting={busy}
        error={cancelError}
        registrations={cancelTargets ?? undefined}
        onClose={() => setCancelTargets(null)}
        onConfirm={(reason, ids) => void handleCancelConfirm(reason, ids)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.DARK_GRAY,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_3,
    color: Colors.WHITE,
  },
  gate: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  gateTitle: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.SCREEN_TITLE,
    color: Colors.WHITE,
  },
  gateBody: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    lineHeight: 22,
    color: Colors.CREAM_60,
  },
  stepper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  error: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.RED,
    marginBottom: 12,
  },
  busy: {
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
