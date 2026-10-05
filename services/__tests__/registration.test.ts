import {
  activeRegistration,
  activeRegistrations,
  awaitingProofRegistrations,
  cancelRegistration,
  canSelfCancel,
  createRegistration,
  createRegistrations,
  excludeFromCheckout,
  fetchBankTransferSettings,
  fetchMyRegistrations,
  openCheckoutId,
  payableRegistrations,
  registerDeviceToken,
  registrationDivisionLabel,
  resetCheckoutPayment,
  startNetopiaPayment,
  unregisterDeviceToken,
  uploadBankProof,
} from '@/services/registration';
import {
  apiDelete,
  apiGetEnvelope,
  apiPost,
  apiUpload,
} from '@/services/apiClient';
import { ApiError } from '@/services/apiError';
import { formDataFromUri } from '@/services/upload';
import {
  DIVISION_ID,
  EDITION_ID,
  makeEvent,
  makeRegistration,
} from '@/testing/fixtures';

jest.mock('@/services/apiClient', () => ({
  apiDelete: jest.fn(async () => null),
  apiGetEnvelope: jest.fn(async () => null),
  apiPost: jest.fn(async () => null),
  apiUpload: jest.fn(async () => null),
}));

jest.mock('@/services/upload', () => ({
  formDataFromUri: jest.fn(async () => 'form-data'),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('reads', () => {
  it('scopes the registration list to one event', async () => {
    await fetchMyRegistrations(EDITION_ID);

    expect(apiGetEnvelope).toHaveBeenCalledWith('/app/my/event-registrations', {
      query: { event_id: EDITION_ID },
      signal: undefined,
    });
  });

  it('passes checkout_id so the API resolves a payment reference', async () => {
    await fetchBankTransferSettings({ checkoutId: 901 });

    expect(apiGetEnvelope).toHaveBeenCalledWith('/app/bank-transfer-settings', {
      query: { checkout_id: 901, registration_id: undefined },
      signal: undefined,
    });
  });

  it('still accepts a bare registration id for bank settings', async () => {
    await fetchBankTransferSettings(501);

    expect(apiGetEnvelope).toHaveBeenCalledWith('/app/bank-transfer-settings', {
      query: { checkout_id: undefined, registration_id: 501 },
      signal: undefined,
    });
  });

  it('treats unconfigured bank transfer settings (404) as null', async () => {
    (apiGetEnvelope as jest.Mock).mockRejectedValueOnce(
      new ApiError(404, 'Bank transfer settings are not configured.')
    );

    await expect(fetchBankTransferSettings({ checkoutId: 901 })).resolves.toBeNull();
  });

  it('propagates non-404 failures', async () => {
    (apiGetEnvelope as jest.Mock).mockRejectedValueOnce(new ApiError(500, 'boom'));

    await expect(fetchBankTransferSettings({ checkoutId: 901 })).rejects.toThrow('boom');
  });
});

describe('mutations', () => {
  it('creates a multi-division checkout via event_division_ids', async () => {
    await createRegistrations(EDITION_ID, [DIVISION_ID, DIVISION_ID + 1]);

    expect(apiPost).toHaveBeenCalledWith('/app/event-registrations', {
      event_id: EDITION_ID,
      event_division_ids: [DIVISION_ID, DIVISION_ID + 1],
    });
  });

  it('still supports legacy single event_division_id create', async () => {
    await createRegistration({
      event_id: EDITION_ID,
      event_division_id: DIVISION_ID,
    });

    expect(apiPost).toHaveBeenCalledWith('/app/event-registrations', {
      event_id: EDITION_ID,
      event_division_id: DIVISION_ID,
    });
  });

  it('sends cancel_reason in the DELETE body', async () => {
    await cancelRegistration(501, 'injury_or_illness');

    expect(apiDelete).toHaveBeenCalledWith('/app/event-registrations/501', {
      cancel_reason: 'injury_or_illness',
    });
  });

  it('starts Netopia on the checkout when checkoutId is known', async () => {
    await startNetopiaPayment(501, { checkoutId: 901 });

    expect(apiPost).toHaveBeenCalledWith(
      '/app/registration-checkouts/901/payments/netopia/start',
      {}
    );
  });

  it('falls back to the legacy registration Netopia endpoint', async () => {
    await startNetopiaPayment(501);

    expect(apiPost).toHaveBeenCalledWith(
      '/app/event-registrations/501/payments/netopia/start',
      {}
    );
  });

  it('uploads bank proof against the checkout when known', async () => {
    await uploadBankProof(501, 'file:///receipt.png', { checkoutId: 901 });

    expect(formDataFromUri).toHaveBeenCalledWith(
      'proof',
      'file:///receipt.png',
      {}
    );
    expect(apiUpload).toHaveBeenCalledWith(
      '/app/registration-checkouts/901/payments/bank-proofs',
      'form-data'
    );
  });

  it('resets and excludes via checkout-scoped endpoints', async () => {
    await resetCheckoutPayment(901);
    expect(apiPost).toHaveBeenCalledWith(
      '/app/registration-checkouts/901/payments/reset',
      {}
    );

    await excludeFromCheckout(901, [501, 502], 'change_of_plans');
    expect(apiPost).toHaveBeenCalledWith('/app/registration-checkouts/901/exclude', {
      registration_ids: [501, 502],
      cancel_reason: 'change_of_plans',
    });
  });

  it('registers and unregisters device tokens', async () => {
    await registerDeviceToken('ExponentPushToken[abc]', 'ios');
    expect(apiPost).toHaveBeenCalledWith('/app/device-tokens', {
      token: 'ExponentPushToken[abc]',
      platform: 'ios',
    });

    await unregisterDeviceToken('ExponentPushToken[abc]');
    expect(apiDelete).toHaveBeenCalledWith('/app/device-tokens', {
      token: 'ExponentPushToken[abc]',
    });
  });
});

describe('active / payable helpers', () => {
  it('ignores cancelled and declined records', () => {
    const cancelled = makeRegistration({
      id_registration: 1,
      lifecycle_status: 'cancelled',
    });
    const active = makeRegistration({ id_registration: 2 });

    expect(activeRegistration([cancelled, active])).toBe(active);
    expect(activeRegistrations([cancelled, active])).toEqual([active]);
    expect(activeRegistration([cancelled])).toBeNull();
    expect(activeRegistration(null)).toBeNull();
  });

  it('filters payable and awaiting regs', () => {
    const unpaid = makeRegistration({ id_registration: 1, payment_status: 'unpaid' });
    const free = makeRegistration({
      id_registration: 2,
      payment_status: 'unpaid',
      amount_due: 0,
    });
    const awaiting = makeRegistration({
      id_registration: 3,
      payment_status: 'awaiting_proof_review',
    });
    const paid = makeRegistration({ id_registration: 4, payment_status: 'paid' });

    expect(payableRegistrations([unpaid, free, awaiting, paid])).toEqual([unpaid]);
    expect(awaitingProofRegistrations([unpaid, awaiting])).toEqual([awaiting]);
    expect(openCheckoutId([unpaid, awaiting])).toBe(901);
  });

  it('labels null division as Event-wide', () => {
    expect(
      registrationDivisionLabel(
        makeRegistration({ event_division_id: null, event_division: null })
      )
    ).toBe('Event-wide');
  });
});

describe('canSelfCancel', () => {
  const now = 1_800_000_000_000;

  it('allows cancelling before the cancellation deadline', () => {
    const event = makeEvent({
      cancellation_allowed_until: now / 1000 + 3600,
    });

    expect(canSelfCancel(event, makeRegistration(), now)).toBe(true);
    expect(canSelfCancel(event, [makeRegistration()], now)).toBe(true);
  });

  it('blocks cancelling once the deadline passed', () => {
    const event = makeEvent({
      cancellation_allowed_until: now / 1000 - 3600,
    });

    expect(canSelfCancel(event, makeRegistration(), now)).toBe(false);
  });

  it('blocks cancelling a registration that is no longer active', () => {
    const event = makeEvent({
      cancellation_allowed_until: now / 1000 + 3600,
    });
    const cancelled = makeRegistration({ lifecycle_status: 'cancelled' });

    expect(canSelfCancel(event, cancelled, now)).toBe(false);
    expect(canSelfCancel(event, null, now)).toBe(false);
  });
});
