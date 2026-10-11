import React from 'react';
import { renderWithQueryClient } from '@/testing/renderWithQueryClient';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import RegistrationScreen from '@/app/event/registration';
import { openPaymentUrl } from '@/services/openPaymentUrl';
import { confirmAsync } from '@/services/confirm';
import {
  cancelRegistration,
  commitBenefitSelections,
  createRegistrations,
  excludeFromCheckout,
  fetchCheckoutQuote,
  fetchEventCheckouts,
  resetCheckoutPayment,
  startNetopiaPayment,
  uploadBankProof,
} from '@/services/registration';
import type {
  BankTransferSettings,
  EventRegistration,
  EventRegistrationCheckout,
} from '@/types/api';
import {
  DIVISION_ID,
  EDITION_ID,
  makePlayerLevel,
  makeEvent,
  makeRegistration,
} from '@/testing/fixtures';

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () =>
  require('@/testing/expoRouterMock').createExpoRouterMock({
    useLocalSearchParams: () => ({ eventId: '42' }),
    useRouter: () => ({ push: mockPush, replace: mockReplace, back: mockBack }),
  })
);

jest.mock('@/services/openPaymentUrl', () => ({
  openPaymentUrl: jest.fn(async () => ({ platform: 'native', result: { type: 'dismiss' } })),
}));

jest.mock('@/services/confirm', () => ({
  confirmAsync: jest.fn(async () => true),
}));

jest.mock('@/services/hooks/useEvents', () => ({
  useEvent: () => ({
    data: mockEvent,
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/services/hooks/useLevelAssessment', () => ({
  useCurrentLevel: () => ({
    data: mockCurrentLevel,
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

const mockStartLevelFlow = jest.fn();
jest.mock('@/services/hooks/useLevelFlow', () => ({
  useLevelFlow: () => ({ start: mockStartLevelFlow, starting: false, error: null }),
}));

jest.mock('@/services/hooks/useRegistrations', () => ({
  useEventRegistration: () => mockEventRegistrationState,
  useBankTransferSettings: () => ({
    data: mockBankSettings,
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/services/registration', () => {
  const actual = jest.requireActual('@/services/registration');
  return {
    ...actual,
    createRegistrations: jest.fn(),
    startNetopiaPayment: jest.fn(),
    uploadBankProof: jest.fn(),
    resetCheckoutPayment: jest.fn(),
    excludeFromCheckout: jest.fn(),
    cancelRegistration: jest.fn(),
    fetchCheckoutQuote: jest.fn(async () => ({
      checkout_id: 901,
      total_amount: 45,
      referrer_candidates: [],
      lines: [
        {
          checkout_item_id: 1,
          registration_id: 501,
          event_division_id: 7,
          base_amount_ron: 45,
          amount: 45,
          quote: {
            base_fee: 45,
            amount_due: 45,
            eligible: [],
            applied: [],
          },
        },
      ],
    })),
    fetchEventCheckouts: jest.fn(async () => ({
      checkouts: [mockOpenCheckout],
    })),
    commitBenefitSelections: jest.fn(async (checkoutId: number) => ({
      id_checkout: checkoutId,
      event_id: 42,
      player_user_id: 9,
      status: 'open',
      total_amount: 45,
      payment_method: null,
      paid_at: null,
      inserted_at: 1,
      updated_at: null,
      items: [],
    })),
  };
});

let mockEvent = makeEvent();
let mockCurrentLevel: unknown = null;
let mockEventRegistrationState: Record<string, unknown> = {};
let mockBankSettings: BankTransferSettings | null = null;
const mockRefetch = jest.fn();

const BANK_SETTINGS: BankTransferSettings = {
  iban: 'RO49AAAA1B31007593840000',
  beneficiary_name: 'Padeliz SRL',
  bank_name: 'Banca Exemplu',
  payment_reference_template: 'PAD-{checkout_id}',
  payment_reference: 'PAD-901',
  extra_instructions: 'Send the receipt within 24 hours.',
};

const mockOpenCheckout: EventRegistrationCheckout = {
  id_checkout: 901,
  event_id: EDITION_ID,
  player_user_id: 9,
  status: 'open',
  total_amount: 45,
  payment_method: null,
  paid_at: null,
  inserted_at: 1_700_000_000,
  updated_at: 1_700_000_000,
  items: [
    {
      id_checkout_item: 1,
      registration_id: 501,
      amount: 45,
      item_status: 'active',
      registration: makeRegistration({ payment_status: 'unpaid' }),
    },
  ],
  payment_attempts: [],
  payment_proofs: [],
};

function setExistingRegistrations(regs: EventRegistration[]) {
  const active = regs.filter((r) => r.lifecycle_status === 'active');
  mockEventRegistrationState = {
    data: regs,
    registrations: active,
    registration: active[0] ?? null,
    checkoutId: active.find((r) => r.checkout_id != null)?.checkout_id ?? null,
    loading: false,
    error: null,
    refetch: mockRefetch,
  };
}

function renderScreen() {
  return renderWithQueryClient(<RegistrationScreen />);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockEvent = makeEvent();
  mockCurrentLevel = makePlayerLevel();
  mockBankSettings = null;
  setExistingRegistrations([]);
  (confirmAsync as jest.Mock).mockResolvedValue(true);
  (fetchEventCheckouts as jest.Mock).mockResolvedValue({
    checkouts: [mockOpenCheckout],
  });
  (fetchCheckoutQuote as jest.Mock).mockResolvedValue({
    checkout_id: 901,
    total_amount: 45,
    referrer_candidates: [],
    lines: [
      {
        checkout_item_id: 1,
        registration_id: 501,
        event_division_id: DIVISION_ID,
        base_amount_ron: 45,
        amount: 45,
        quote: { base_fee: 45, amount_due: 45, eligible: [], applied: [] },
      },
    ],
  });
});

describe('level gate', () => {
  it('blocks the flow when the player has no level and sends them to Assess my level', () => {
    mockCurrentLevel = null;
    renderScreen();

    expect(screen.getByTestId('level-gate')).toBeTruthy();
    expect(screen.queryByText('Choose Division')).toBeNull();

    fireEvent.press(screen.getByText('Assess my level'));
    expect(mockStartLevelFlow).toHaveBeenCalledWith('assessment', EDITION_ID);
  });

  it('does not block a player who already has registrations', () => {
    mockCurrentLevel = null;
    setExistingRegistrations([makeRegistration({ payment_status: 'paid' })]);
    renderScreen();

    expect(screen.queryByTestId('level-gate')).toBeNull();
  });

  it('uses the server is_eligible verdict for each division', () => {
    mockEvent = makeEvent();
    mockEvent.event_divisions![0].is_eligible = true;
    mockEvent.event_divisions![1].is_eligible = false;
    renderScreen();

    expect(screen.getAllByText('Not Eligible')).toHaveLength(1);
  });
});

describe('wizard shell', () => {
  it('shows Division / Payment / Status step labels only', () => {
    renderScreen();

    expect(screen.getByText('Division')).toBeTruthy();
    expect(screen.getByText('Payment')).toBeTruthy();
    expect(screen.getByText('Status')).toBeTruthy();
    expect(screen.queryByText('Proof')).toBeNull();
  });

  it('keeps Payment and Status steps disabled until active regs exist', () => {
    renderScreen();

    expect(screen.getByTestId('wizard-step-1')).toBeTruthy();
    expect(screen.queryByTestId('wizard-step-2')).toBeNull();
    expect(screen.queryByTestId('wizard-step-3')).toBeNull();
    expect(screen.getByText('Choose Division')).toBeTruthy();
    expect(screen.queryByText('Order summary')).toBeNull();
  });
});

describe('division / reserve', () => {
  it('lists the event divisions with per-division entry fees', () => {
    renderScreen();

    expect(screen.getByText('Students Rookies')).toBeTruthy();
    expect(screen.getByText('Intermediate')).toBeTruthy();
    expect(screen.getByText('RON 45/player')).toBeTruthy();
    expect(screen.getByText('RON 60/player')).toBeTruthy();
  });

  it('does not create until Reserve and then goes to Payment', async () => {
    (createRegistrations as jest.Mock).mockResolvedValue({
      registrations: [
        makeRegistration(),
        makeRegistration({
          id_registration: 502,
          event_division_id: DIVISION_ID + 1,
        }),
      ],
      checkout: {
        id_checkout: 901,
        event_id: EDITION_ID,
        player_user_id: 9,
        status: 'open',
        total_amount: 90,
        payment_method: null,
        paid_at: null,
        inserted_at: 1,
        updated_at: 1,
      },
    });
    renderScreen();

    fireEvent.press(screen.getByTestId(`division-toggle-${DIVISION_ID}`));
    fireEvent.press(screen.getByTestId(`division-toggle-${DIVISION_ID + 1}`));
    expect(createRegistrations).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('step-forward'));

    await waitFor(() =>
      expect(createRegistrations).toHaveBeenCalledWith(EDITION_ID, [
        DIVISION_ID,
        DIVISION_ID + 1,
      ])
    );
    await waitFor(() => expect(screen.getByText('Order summary')).toBeTruthy());
    await waitFor(() => expect(screen.getByText('Go to Status')).toBeTruthy());
  });

  it('cannot advance before a division is chosen', () => {
    renderScreen();

    expect(screen.queryByTestId('step-forward')).toBeNull();
    expect(createRegistrations).not.toHaveBeenCalled();
  });

  it('navigates to Payment without create when regs already exist and no drafts', async () => {
    setExistingRegistrations([makeRegistration({ payment_status: 'unpaid' })]);
    renderScreen();

    // Unpaid resumes at payment; go back to division.
    await waitFor(() => expect(screen.getByText('Order summary')).toBeTruthy());
    await waitFor(() => expect(screen.queryByTestId('registration-busy')).toBeNull());
    fireEvent.press(screen.getByTestId('step-back'));
    await waitFor(() => expect(screen.getByText('Choose Division')).toBeTruthy());

    fireEvent.press(screen.getByTestId('step-forward'));
    await waitFor(() => expect(screen.getByText('Order summary')).toBeTruthy());
    expect(createRegistrations).not.toHaveBeenCalled();
  });

  it('locks division edits while awaiting proof and forwards as Payment', async () => {
    setExistingRegistrations([
      makeRegistration({
        payment_status: 'awaiting_proof_review',
        payment_method: 'bank_transfer',
      }),
    ]);
    renderScreen();

    await waitFor(() =>
      expect(screen.getByTestId('registration-status-summary')).toBeTruthy()
    );
    expect(screen.getByTestId('step-back')).toHaveTextContent(/Payment/);
    fireEvent.press(screen.getByTestId('step-back'));
    await waitFor(() => expect(screen.getByText('Order summary')).toBeTruthy());
    await waitFor(() => expect(screen.queryByTestId('registration-busy')).toBeNull());
    fireEvent.press(screen.getByTestId('step-back'));
    await waitFor(() => expect(screen.getByText('Choose Division')).toBeTruthy());

    expect(screen.getByTestId('division-edit-locked')).toBeTruthy();
    expect(screen.queryByTestId(`division-locked-${DIVISION_ID}`)).toBeNull();
    expect(screen.queryByTestId(`division-toggle-${DIVISION_ID}`)).toBeNull();
    expect(screen.getByTestId('step-forward')).toHaveTextContent(/Payment/);
  });

  it('opens cancel modal for unpaid reserved remove and never leaves the wizard', async () => {
    setExistingRegistrations([makeRegistration({ payment_status: 'unpaid' })]);
    (cancelRegistration as jest.Mock).mockResolvedValue(
      makeRegistration({ lifecycle_status: 'cancelled', payment_status: 'unpaid' })
    );
    renderScreen();

    await waitFor(() => expect(screen.getByText('Order summary')).toBeTruthy());
    fireEvent.press(screen.getByTestId('step-back'));
    await waitFor(() => expect(screen.getByText('Choose Division')).toBeTruthy());

    fireEvent.press(screen.getByTestId(`division-toggle-${DIVISION_ID}`));
    await waitFor(() =>
      expect(screen.getByTestId('cancel-registration-modal')).toBeTruthy()
    );

    fireEvent.press(screen.getByTestId('cancel-reason-change_of_plans'));
    fireEvent.press(screen.getByTestId('cancel-registration-confirm'));

    await waitFor(() =>
      expect(cancelRegistration).toHaveBeenCalledWith(501, 'change_of_plans')
    );
    expect(mockReplace).not.toHaveBeenCalled();
    expect(excludeFromCheckout).not.toHaveBeenCalled();
  });
});

describe('payment step', () => {
  beforeEach(() => {
    setExistingRegistrations([
      makeRegistration({ payment_status: 'unpaid' }),
      makeRegistration({
        id_registration: 502,
        event_division_id: DIVISION_ID + 1,
        payment_status: 'unpaid',
        amount_due: 45,
        payment: 45,
      }),
    ]);
    (fetchCheckoutQuote as jest.Mock).mockResolvedValue({
      checkout_id: 901,
      total_amount: 90,
      referrer_candidates: [],
      lines: [
        {
          checkout_item_id: 1,
          registration_id: 501,
          event_division_id: DIVISION_ID,
          base_amount_ron: 45,
          amount: 45,
          quote: { base_fee: 45, amount_due: 45, eligible: [], applied: [] },
        },
        {
          checkout_item_id: 2,
          registration_id: 502,
          event_division_id: DIVISION_ID + 1,
          base_amount_ron: 45,
          amount: 45,
          quote: { base_fee: 45, amount_due: 45, eligible: [], applied: [] },
        },
      ],
    });
    (fetchEventCheckouts as jest.Mock).mockResolvedValue({
      checkouts: [
        {
          ...mockOpenCheckout,
          total_amount: 90,
          items: [
            {
              id_checkout_item: 1,
              registration_id: 501,
              amount: 45,
              item_status: 'active',
              registration: makeRegistration({ payment_status: 'unpaid' }),
            },
            {
              id_checkout_item: 2,
              registration_id: 502,
              amount: 45,
              item_status: 'active',
              registration: makeRegistration({
                id_registration: 502,
                event_division_id: DIVISION_ID + 1,
                payment_status: 'unpaid',
              }),
            },
          ],
        },
      ],
    });
  });

  it('resumes unpaid at payment and loads quote + checkout list', async () => {
    renderScreen();

    await waitFor(() => expect(screen.getByText('Order summary')).toBeTruthy());
    await waitFor(() => expect(fetchCheckoutQuote).toHaveBeenCalledWith(901));
    await waitFor(() => expect(fetchEventCheckouts).toHaveBeenCalledWith(EDITION_ID));
    expect(screen.getByTestId('pay-for-it')).toBeTruthy();
  });

  it('opens PaymentMethodModal from Pay for it and stays on Payment after Netopia', async () => {
    (startNetopiaPayment as jest.Mock).mockResolvedValue({
      attempt: {
        id_payment_attempt: 1,
        checkout_id: 901,
        order_id: 'ORD-901',
        redirect_url: 'https://sandbox.netopia-payments.com/pay/abc',
        status: 'initiated',
      },
      checkout: {
        id_checkout: 901,
        event_id: EDITION_ID,
        player_user_id: 9,
        status: 'open',
        total_amount: 90,
        payment_method: 'netopia',
        paid_at: null,
        inserted_at: 1,
        updated_at: 1,
        items: [],
      },
    });
    renderScreen();

    await waitFor(() => expect(screen.getByTestId('pay-for-it')).toBeTruthy());
    fireEvent.press(screen.getByTestId('pay-for-it'));
    await waitFor(() => expect(screen.getByTestId('payment-method-modal')).toBeTruthy());

    fireEvent.press(screen.getByTestId('pay-method-netopia'));

    await waitFor(() =>
      expect(startNetopiaPayment).toHaveBeenCalledWith(901, { checkoutId: 901 })
    );
    await waitFor(() =>
      expect(openPaymentUrl).toHaveBeenCalledWith(
        'https://sandbox.netopia-payments.com/pay/abc'
      )
    );
    await waitFor(() => expect(screen.getByText('Order summary')).toBeTruthy());
    expect(screen.queryByTestId('registration-status-summary')).toBeNull();
  });

  it('bank path uploads proof inside the modal and stays on Payment', async () => {
    mockBankSettings = BANK_SETTINGS;
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///receipt.png' }],
    });
    (uploadBankProof as jest.Mock).mockResolvedValue({
      proof: { id_payment_proof: 9, url: null, review_status: 'pending' },
      checkout: {
        id_checkout: 901,
        event_id: EDITION_ID,
        player_user_id: 9,
        status: 'awaiting_proof',
        total_amount: 90,
        payment_method: 'bank_transfer',
        paid_at: null,
        inserted_at: 1,
        updated_at: 1,
        items: [],
      },
    });
    renderScreen();

    await waitFor(() => expect(screen.getByTestId('pay-for-it')).toBeTruthy());
    fireEvent.press(screen.getByTestId('pay-for-it'));
    fireEvent.press(screen.getByTestId('pay-method-bank_transfer'));

    await waitFor(() => expect(screen.getByTestId('bank-transfer-details')).toBeTruthy());
    fireEvent.press(screen.getByTestId('payment-proof-upload'));
    // PhotoUploadSlot sets proofUri asynchronously after ImagePicker resolves.
    await waitFor(() => {
      const submit = screen.getByTestId('submit-bank-proof');
      expect(submit.props.accessibilityState?.disabled).not.toBe(true);
    });
    fireEvent.press(screen.getByTestId('submit-bank-proof'));

    await waitFor(() =>
      expect(uploadBankProof).toHaveBeenCalledWith(901, 'file:///receipt.png', {
        checkoutId: 901,
      })
    );
    await waitFor(() => expect(screen.getByText('Order summary')).toBeTruthy());
  });

  it('Go to Status does not start payment', async () => {
    renderScreen();

    await waitFor(() => expect(screen.getByText('Go to Status')).toBeTruthy());
    fireEvent.press(screen.getByTestId('step-forward'));

    await waitFor(() =>
      expect(screen.getByTestId('registration-status-summary')).toBeTruthy()
    );
    expect(startNetopiaPayment).not.toHaveBeenCalled();
    expect(uploadBankProof).not.toHaveBeenCalled();
  });

  it('disables benefits until a referrer is selected when 2+ candidates exist', async () => {
    (fetchCheckoutQuote as jest.Mock).mockResolvedValue({
      checkout_id: 901,
      total_amount: 90,
      referrer_candidates: [
        { referrer_player_user_id: 11, latest_touched_at: 1_700_000_000 },
        { referrer_player_user_id: 12, latest_touched_at: 1_700_000_100 },
      ],
      lines: [
        {
          checkout_item_id: 1,
          registration_id: 501,
          event_division_id: DIVISION_ID,
          base_amount_ron: 45,
          amount: 40,
          quote: {
            base_fee: 45,
            amount_due: 40,
            eligible: [
              {
                benefit_id: 3,
                slug: 'student',
                name: 'Student',
                auto: false,
                player_optional: true,
                amount_ron: 5,
              },
            ],
            applied: [],
          },
        },
      ],
    });
    renderScreen();

    await waitFor(() => expect(screen.getByTestId('referrer-picker')).toBeTruthy());
    expect(screen.getByTestId('benefit-toggle-3')).toBeDisabled();

    fireEvent.press(screen.getByTestId('referrer-11'));
    await waitFor(() =>
      expect(commitBenefitSelections).toHaveBeenCalledWith(901, {
        selected_benefit_ids: [],
        referrer_player_user_id: 11,
      })
    );

    fireEvent.press(screen.getByTestId('benefit-toggle-3'));
    await waitFor(() =>
      expect(commitBenefitSelections).toHaveBeenCalledWith(901, {
        selected_benefit_ids: [3],
        referrer_player_user_id: 11,
      })
    );
  });
});

describe('status step', () => {
  it('shows paid divisions with playing time and total paid', async () => {
    setExistingRegistrations([
      makeRegistration({
        payment_status: 'paid',
        payment_method: 'netopia',
        paid_at: 1_700_000_300,
        amount_due: 0,
      }),
    ]);
    (fetchEventCheckouts as jest.Mock).mockResolvedValue({
      checkouts: [
        {
          ...mockOpenCheckout,
          status: 'completed',
          paid_at: 1_700_000_300,
          items: [
            {
              id_checkout_item: 1,
              registration_id: 501,
              amount: 45,
              item_status: 'active',
              registration: makeRegistration({
                payment_status: 'paid',
                amount_due: 0,
              }),
            },
          ],
        },
      ],
    });
    renderScreen();

    await waitFor(() =>
      expect(screen.getByTestId('registration-status-summary')).toBeTruthy()
    );
    expect(screen.getByText('Students Rookies')).toBeTruthy();
    expect(screen.getByText('11:00 - 14:00')).toBeTruthy();
    expect(screen.getByTestId('status-total-paid')).toHaveTextContent('RON 45');
  });

  it('shows pending lines without a reject message and goes Back to Payment', async () => {
    setExistingRegistrations([
      makeRegistration({
        payment_status: 'awaiting_proof_review',
        payment_method: 'bank_transfer',
        payment_proofs: [
          {
            id_payment_proof: 1,
            url: null,
            review_status: 'rejected',
            review_message: 'Receipt unreadable',
            reviewed_at: 1_700_000_400,
            inserted_at: 1_700_000_350,
          },
        ],
      }),
    ]);
    renderScreen();

    await waitFor(() => expect(screen.getByTestId('status-pending-block')).toBeTruthy());
    expect(screen.queryByText('Receipt unreadable')).toBeNull();
    expect(screen.queryByTestId('status-reject-message')).toBeNull();

    expect(screen.getByTestId('step-back')).toHaveTextContent(/Payment/);
    fireEvent.press(screen.getByTestId('step-back'));
    await waitFor(() => expect(screen.getByText('Order summary')).toBeTruthy());
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('confirms before Cancel proof from the detail modal resets the payment path', async () => {
    setExistingRegistrations([
      makeRegistration({
        payment_status: 'awaiting_proof_review',
        payment_method: 'bank_transfer',
      }),
    ]);
    (fetchEventCheckouts as jest.Mock).mockResolvedValue({
      checkouts: [
        {
          ...mockOpenCheckout,
          status: 'awaiting_proof',
          payment_method: 'bank_transfer',
          payment_proofs: [
            {
              id_payment_proof: 11,
              url: 'https://example.com/proof.png',
              review_status: 'pending',
              review_message: null,
              reviewed_at: null,
              inserted_at: 1_700_000_400,
              coverage: [
                {
                  registration_id: 501,
                  event_division_id: DIVISION_ID,
                  division_title: 'Students Rookies',
                  division_color: '#123',
                  amount_ron: 45,
                },
              ],
            },
          ],
        },
      ],
    });
    (resetCheckoutPayment as jest.Mock).mockResolvedValue({
      checkout: {
        id_checkout: 901,
        event_id: EDITION_ID,
        player_user_id: 9,
        status: 'open',
        total_amount: 45,
        payment_method: null,
        paid_at: null,
        inserted_at: 1,
        updated_at: 1,
        items: [
          {
            id_checkout_item: 1,
            registration_id: 501,
            amount: 45,
            item_status: 'active',
            registration: makeRegistration({
              payment_status: 'unpaid',
              payment_method: null,
            }),
          },
        ],
      },
    });
    renderScreen();

    await waitFor(() =>
      expect(screen.getByTestId('registration-status-summary')).toBeTruthy()
    );
    fireEvent.press(screen.getByTestId('step-back'));
    await waitFor(() => expect(screen.getByText('Order summary')).toBeTruthy());
    await waitFor(() => expect(screen.getByTestId('proof-11')).toBeTruthy());
    expect(screen.queryByTestId('proof-11-cancel-proof')).toBeNull();
    fireEvent.press(screen.getByTestId('proof-11'));
    fireEvent.press(await screen.findByTestId('payment-record-cancel-proof'));

    await waitFor(() => expect(confirmAsync).toHaveBeenCalled());
    await waitFor(() => expect(resetCheckoutPayment).toHaveBeenCalledWith(901));
  });

  it('splits awaiting ids to exclude and others to cancelRegistration', async () => {
    setExistingRegistrations([
      makeRegistration({
        payment_status: 'awaiting_proof_review',
        payment_method: 'bank_transfer',
      }),
      makeRegistration({
        id_registration: 502,
        event_division_id: DIVISION_ID + 1,
        payment_status: 'unpaid',
      }),
    ]);
    (excludeFromCheckout as jest.Mock).mockResolvedValue({
      checkout: {
        id_checkout: 901,
        event_id: EDITION_ID,
        player_user_id: 9,
        status: 'open',
        total_amount: 45,
        payment_method: null,
        paid_at: null,
        inserted_at: 1,
        updated_at: 1,
        items: [
          {
            id_checkout_item: 2,
            registration_id: 502,
            amount: 45,
            item_status: 'active',
            registration: makeRegistration({
              id_registration: 502,
              event_division_id: DIVISION_ID + 1,
              payment_status: 'unpaid',
            }),
          },
        ],
      },
    });
    (cancelRegistration as jest.Mock).mockResolvedValue(
      makeRegistration({ id_registration: 502, lifecycle_status: 'cancelled' })
    );
    renderScreen();

    // Mixed unpaid+awaiting resumes at payment; go to status.
    await waitFor(() => expect(screen.getByText('Go to Status')).toBeTruthy());
    fireEvent.press(screen.getByTestId('step-forward'));
    await waitFor(() =>
      expect(screen.getByTestId('open-cancel-registrations')).toBeTruthy()
    );

    fireEvent.press(screen.getByTestId('open-cancel-registrations'));
    fireEvent.press(screen.getByTestId('cancel-reason-change_of_plans'));
    fireEvent.press(screen.getByTestId('cancel-registration-confirm'));

    await waitFor(() =>
      expect(excludeFromCheckout).toHaveBeenCalledWith(901, [501], 'change_of_plans')
    );
    await waitFor(() =>
      expect(cancelRegistration).toHaveBeenCalledWith(502, 'change_of_plans')
    );
  });
});
