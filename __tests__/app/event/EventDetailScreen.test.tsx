import React from 'react';
import { renderWithQueryClient } from '@/testing/renderWithQueryClient';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import EventDetailScreen from '@/app/event/[id]/index';
import { cancelRegistration, excludeFromCheckout } from '@/services/registration';
import type { EventRegistration } from '@/types/api';
import {
  DIVISION_ID,
  EDITION_ID,
  makeEvent,
  makeRegistration,
  makePlayerLevel,
  makeRegistrationWithStatus,
} from '@/testing/fixtures';

const mockPush = jest.fn();

jest.mock('@/context/auth', () => ({
  useAuth: () => ({ user: { id: '1', email: 'a@b.com', name: 'Test', player: {} }, isLoading: false }),
}));


jest.mock('expo-router', () =>
  require('@/testing/expoRouterMock').createExpoRouterMock({
    useLocalSearchParams: () => ({ id: String(42) }),
    useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
    useNavigation: () => ({ canGoBack: () => true }),
  })
);

jest.mock('@/services/hooks/useEvents', () => ({
  useEvent: () => ({
    ...require('@/testing/fixtures').asyncState(mockEvent),
    refetch: jest.fn(),
  }),
}));

let mockCurrentLevel: unknown = null;
jest.mock('@/services/hooks/useLevelAssessment', () => ({
  useCurrentLevel: () => ({
    data: mockCurrentLevel,
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

const mockStartLevelFlow = jest.fn();
let mockLevelStarting = false;
jest.mock('@/services/hooks/useLevelFlow', () => ({
  useLevelFlow: () => ({
    start: mockStartLevelFlow,
    get starting() {
      return mockLevelStarting;
    },
    error: null,
  }),
}));

let mockRegistrations: EventRegistration[] = [];
let mockRegistrationsLoading = false;
let mockEventRegistrationState: Record<string, unknown> = {};
const mockRefetch = jest.fn();
jest.mock('@/services/hooks/useRegistrations', () => ({
  useEventRegistration: () => mockEventRegistrationState,
}));

jest.mock('@/services/registration', () => {
  const actual = jest.requireActual('@/services/registration');
  return {
    ...actual,
    cancelRegistration: jest.fn(async () => null),
    excludeFromCheckout: jest.fn(async () => ({ checkout: { id_checkout: 901 } })),
  };
});

let mockEvent = makeEvent();

function setRegistrations(regs: EventRegistration[], loading = false) {
  mockRegistrations = regs;
  mockRegistrationsLoading = loading;
  const active = regs.filter((r) => r.lifecycle_status === 'active');
  mockEventRegistrationState = {
    data: regs,
    registrations: active,
    registration: active[0] ?? null,
    checkoutId: active.find((r) => r.checkout_id != null)?.checkout_id ?? null,
    loading,
    error: null,
    refetch: mockRefetch,
  };
}

function renderScreen() {
  return renderWithQueryClient(<EventDetailScreen />);
}

type TabLabel = 'Info' | 'Divisions' | 'Description' | 'Deadlines';

type JsonNode = {
  props?: { testID?: string };
  children?: Array<JsonNode | string> | null;
};

/** testIDs of the children of the node that directly contains `childTestId`. */
function siblingTestIds(childTestId: string): Array<string | undefined> {
  const walk = (node: JsonNode | string | null): Array<string | undefined> | null => {
    if (!node || typeof node === 'string') return null;
    const kids = (node.children ?? []).filter((c): c is JsonNode => typeof c !== 'string');
    if (kids.some((k) => k.props?.testID === childTestId)) {
      return kids.map((k) => k.props?.testID);
    }
    for (const k of kids) {
      const found = walk(k);
      if (found) return found;
    }
    return null;
  };
  const root = screen.toJSON() as JsonNode | JsonNode[] | null;
  const roots = Array.isArray(root) ? root : [root];
  for (const r of roots) {
    const found = walk(r);
    if (found) return found;
  }
  return [];
}

function openTab(label: TabLabel) {
  fireEvent.press(screen.getByText(label));
}

function setLevel(hasLevel: boolean) {
  mockCurrentLevel = hasLevel ? makePlayerLevel() : null;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockEvent = makeEvent();
  mockLevelStarting = false;
  setRegistrations([]);
  setLevel(false);
});

describe('cover, description, organizer, schedule, badges', () => {
  it('renders cover, badges, title above tabs, and Info schedule', () => {
    mockEvent = makeEvent({
      badges: [{ key: 'new', label: 'New' }],
      closing_time: '20:00:00',
    });
    renderScreen();

    expect(screen.getByTestId('event-cover')).toBeTruthy();
    expect(screen.getByTestId('event-detail-badges')).toBeTruthy();
    expect(screen.getByTestId('event-badge-new')).toBeTruthy();
    expect(screen.getByTestId('event-title-above-tabs')).toBeTruthy();
    expect(screen.getByText('Tour Org • Minitour 21')).toBeTruthy();
    expect(screen.queryByTestId('event-organizer')).toBeNull();
    expect(screen.queryByText('Tournament Director')).toBeNull();
    expect(screen.getByText('Check-in')).toBeTruthy();
    expect(screen.getAllByText('Playing').length).toBeGreaterThan(0);
    expect(screen.queryByText('Closing')).toBeNull();
  });

  it('renders the HTML description on the Description tab only', () => {
    mockEvent = makeEvent({
      description: '<p>Friendly <strong>padel</strong> day.</p>',
    });
    renderScreen();

    expect(screen.queryByTestId('event-description')).toBeNull();
    openTab('Description');

    expect(screen.getByTestId('event-description')).toBeTruthy();
    expect(screen.getByText('Friendly')).toBeTruthy();
    expect(screen.getByText('padel')).toBeTruthy();
    expect(screen.queryByTestId('event-organizer')).toBeNull();
  });

  it('shows event-only title when organizer is missing', () => {
    mockEvent = makeEvent({
      cover_url: null,
      organizer: null,
      organizer_id: null,
    });
    renderScreen();

    expect(screen.getByTestId('event-cover-empty')).toBeTruthy();
    expect(screen.queryByTestId('event-cover')).toBeNull();
    expect(screen.getByText('Minitour 21')).toBeTruthy();
    expect(screen.queryByText(/Tour Org/)).toBeNull();
  });
});

describe('hero meta and tabs', () => {
  it('shows date under the title and no location above tabs', () => {
    renderScreen();

    expect(screen.getByTestId('event-hero-date')).toBeTruthy();
    expect(within(screen.getByTestId('event-hero-date')).getByText('15 June 2099')).toBeTruthy();
    expect(screen.queryByTestId('event-hero-location')).toBeNull();
    expect(screen.queryByTestId('event-hero-meta')).toBeNull();
    expect(screen.queryByText('Price per player')).toBeNull();
  });

  it('keeps title, hero date, and tabs in an opaque sticky chrome block', () => {
    renderScreen();

    const scroll = screen.UNSAFE_getByType(require('react-native').ScrollView);
    expect(scroll.props.stickyHeaderIndices).toEqual([1]);

    const chrome = screen.getByTestId('event-sticky-chrome');
    expect(within(chrome).getByTestId('event-title-above-tabs')).toBeTruthy();
    expect(within(chrome).getByTestId('event-hero-date')).toBeTruthy();
    expect(within(chrome).getByTestId('event-tabs')).toBeTruthy();
    expect(chrome.props.style).toEqual(
      expect.objectContaining({ backgroundColor: expect.any(String) })
    );
  });

  it('renders Info | Divisions | Description | Deadlines and defaults to Info', () => {
    renderScreen();

    for (const label of ['Info', 'Divisions', 'Description', 'Deadlines']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    const info = screen.getByTestId('event-tab-info');
    expect(within(info).queryByText('Date')).toBeNull();
    expect(within(info).queryByText('Location')).toBeNull();
    expect(within(info).queryByText('Price per player')).toBeNull();
    expect(screen.getByTestId('info-date-card')).toBeTruthy();
    expect(screen.getByTestId('info-location-card')).toBeTruthy();
    expect(within(screen.getByTestId('info-date-card')).getByText('15 Jun 2099')).toBeTruthy();
    expect(within(screen.getByTestId('info-date-card')).queryByText(/June/)).toBeNull();
    expect(within(screen.getByTestId('info-location-card')).getByText('Padel Arena')).toBeTruthy();
    expect(within(screen.getByTestId('info-location-card')).getByText('Str. Exemplu 1')).toBeTruthy();
    expect(
      within(screen.getByTestId('info-location-card')).getByText('Str. Exemplu 1').props
        .numberOfLines
    ).toBe(1);
  });

  it('opens centered modals for Info date and location cards', () => {
    renderScreen();

    fireEvent.press(screen.getByTestId('info-date-card'));
    expect(screen.getByTestId('info-detail-modal')).toBeTruthy();
    expect(screen.getByTestId('info-modal-date')).toHaveTextContent(
      '15 June 2099 · Monday'
    );
    fireEvent.press(screen.getByTestId('info-modal-close'));

    fireEvent.press(screen.getByTestId('info-location-card'));
    expect(screen.getByTestId('info-modal-location-name')).toHaveTextContent(
      'Padel Arena'
    );
    expect(screen.getByTestId('info-modal-location-address')).toHaveTextContent(
      'Str. Exemplu 1'
    );
  });

  it('shows em dash when location address is empty', () => {
    mockEvent = makeEvent({
      location: {
        id_location: 3,
        club_id: 1,
        name: 'Padel Arena',
        address: '',
        total_indoors_courts: 4,
        total_outdoor_courts: 2,
      },
    });
    renderScreen();
    expect(within(screen.getByTestId('info-location-card')).getByText('—')).toBeTruthy();
    fireEvent.press(screen.getByTestId('info-location-card'));
    expect(screen.getByTestId('info-modal-location-address')).toHaveTextContent('—');
  });

  it('switches tab bodies', () => {
    renderScreen();

    openTab('Divisions');
    expect(screen.getByTestId('event-tab-divisions')).toBeTruthy();
    expect(screen.queryByTestId('event-tab-info')).toBeNull();
    expect(screen.getByText('Students Rookies')).toBeTruthy();
    expect(screen.getByText('Intermediate')).toBeTruthy();
    expect(screen.queryByTestId('division-toggle-7')).toBeNull();

    openTab('Deadlines');
    expect(screen.getByTestId('event-tab-deadlines')).toBeTruthy();
    expect(screen.queryByTestId('event-tab-divisions')).toBeNull();
  });

  it('hides the Deadlines tab when the event is past', () => {
    mockEvent = makeEvent({ date: '2000-01-01' });
    renderScreen();

    for (const label of ['Info', 'Divisions', 'Description']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    expect(screen.queryByText('Deadlines')).toBeNull();
  });

  it('spaces Deadlines cards with column gap and no nested sectionFirst', () => {
    renderScreen();
    openTab('Deadlines');

    const column = screen.getByTestId('deadlines-column');
    expect(column.props.style).toEqual(
      expect.objectContaining({ gap: 12 })
    );
    const cancellation = screen.getByTestId('deadline-cancellation-card');
    const flat = Array.isArray(cancellation.props.style)
      ? cancellation.props.style
      : [cancellation.props.style];
    expect(flat.some((s: { marginTop?: number } | undefined) => s?.marginTop === 24)).toBe(
      false
    );
  });

  it('shows Important timestamps with cancellation and registration copy', () => {
    renderScreen();
    openTab('Deadlines');

    expect(screen.getByText('Important timestamps')).toBeTruthy();
    expect(screen.getByTestId('deadline-cancellation-card')).toBeTruthy();
    expect(screen.getByTestId('deadline-registration-card')).toBeTruthy();
    expect(screen.getByText('Cancellation until')).toBeTruthy();
    expect(screen.getByText('Registration until')).toBeTruthy();
    expect(screen.queryByText('Cancellation until:')).toBeNull();
    expect(screen.queryByText('Registration until:')).toBeNull();
    expect(
      screen.getByText(
        "You can receive a refund only if you cancel your registration before this time. Don't register if you're not sure you can attend. You can't be replaced by another player, the playing slot will just be lost. Thank you for understanding."
      )
    ).toBeTruthy();
    expect(
      screen.getByText(
        'You can only register to the event before this time. Please get your place as fast as possible.'
      )
    ).toBeTruthy();
  });

  it('shows payment due and overdue on the Deadlines tab', () => {
    setLevel(true);
    setRegistrations([
      makeRegistration({ id_registration: 501, payment_status: 'unpaid' }),
      makeRegistration({
        id_registration: 502,
        event_division_id: DIVISION_ID + 1,
        payment_status: 'unpaid',
        is_overdue: true,
      }),
    ]);
    renderScreen();
    openTab('Deadlines');

    expect(screen.getByTestId('deadline-payments')).toBeTruthy();
    expect(
      within(screen.getByTestId('deadline-payment-501')).getByText('Payment due')
    ).toBeTruthy();
    expect(
      within(screen.getByTestId('deadline-payment-502')).getByText('Overdue')
    ).toBeTruthy();
  });

  it('shows a single Playing label for the schedule group', () => {
    renderScreen();
    expect(screen.getAllByText('Playing')).toHaveLength(1);
  });

  it('shows division color badges on the Divisions tab', () => {
    setLevel(true);
    setRegistrations([makeRegistration({ payment_status: 'paid' })]);
    renderScreen();
    openTab('Divisions');
    expect(screen.getByTestId('active-division-badge-501')).toBeTruthy();
  });

  it('omits payment rows on Deadlines when nothing is unpaid', () => {
    setRegistrations([makeRegistration({ payment_status: 'paid' })]);
    renderScreen();
    openTab('Deadlines');

    expect(screen.queryByTestId('deadline-payments')).toBeNull();
  });

  it('renders Cancel Registration as a sibling below the tab body', () => {
    setLevel(true);
    setRegistrations([makeRegistration({ payment_status: 'paid' })]);
    renderScreen();

    for (const tab of ['Info', 'Divisions', 'Description', 'Deadlines'] as TabLabel[]) {
      openTab(tab);
      const body = screen.getByTestId(`event-tab-${tab.toLowerCase()}`);
      expect(within(body).queryByTestId('open-cancel-registration')).toBeNull();
      const ids = siblingTestIds(`event-tab-${tab.toLowerCase()}`);
      expect(ids.indexOf('open-cancel-registration')).toBe(ids.indexOf(`event-tab-${tab.toLowerCase()}`) + 1);
      expect(screen.getByText('Cancel Registration')).toBeTruthy();
    }
  });

  it('keeps Cancel out of the sticky CTA bar', () => {
    setLevel(true);
    setRegistrations([makeRegistration({ payment_status: 'paid' })]);
    renderScreen();

    // Paid-only → no sticky CTA bar at all, yet Cancel is still available.
    expect(screen.queryByTestId('cta-bar')).toBeNull();
    expect(screen.getByTestId('open-cancel-registration')).toBeTruthy();
  });
});

describe('level CTA', () => {
  it('sends a player without a level to Assess my level (Discovery intercept first)', () => {
    setLevel(false);
    renderScreen();

    fireEvent.press(screen.getByText('Assess my level'));

    expect(mockStartLevelFlow).toHaveBeenCalledWith('assessment', EDITION_ID);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows CTA loading while the level flow is starting', () => {
    setLevel(false);
    mockLevelStarting = true;
    renderScreen();

    expect(screen.getByTestId('event-cta-loading')).toBeTruthy();
  });

  it('shows Register for a player with a level and starts the registration flow', () => {
    setLevel(true);
    renderScreen();

    expect(screen.queryByText('Assess my level')).toBeNull();
    fireEvent.press(screen.getByText('Register'));

    expect(mockStartLevelFlow).toHaveBeenCalledWith('registration', EDITION_ID);
  });

  it('still shows Register when a re-assessment is pending but a level exists', () => {
    // A pending assessment never reaches the CTA: only `player_levels` decides.
    setLevel(true);
    renderScreen();

    expect(screen.getByText('Register')).toBeTruthy();
    expect(screen.queryByText('Assess my level')).toBeNull();
  });

  it('opens an existing payment step directly without the Discovery intercept', () => {
    setLevel(true);
    setRegistrations([makeRegistration({ payment_status: 'unpaid' })]);
    renderScreen();

    fireEvent.press(screen.getByText('Pay Now'));

    expect(mockStartLevelFlow).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/event/registration',
      params: { eventId: String(EDITION_ID), initialStep: '2' },
    });
  });

  it('has no eligibility wording left', () => {
    renderScreen();
    expect(screen.queryByText(/eligib/i)).toBeNull();
  });
});

describe('Your divisions on the Divisions tab', () => {
  beforeEach(() => setLevel(true));

  it('lists every active division and labels null as Event-wide', () => {
    setRegistrations([
      makeRegistration({ payment_status: 'paid' }),
      makeRegistration({
        id_registration: 502,
        event_division_id: null,
        payment_status: 'unpaid',
      }),
    ]);
    renderScreen();
    openTab('Divisions');

    const mine = within(screen.getByTestId('active-divisions'));
    expect(mine.getByText('Students Rookies')).toBeTruthy();
    expect(mine.getByText('Event-wide')).toBeTruthy();
  });

  it('shows status and payment due for unpaid registrations', () => {
    setRegistrations([makeRegistration({ payment_status: 'unpaid', amount_due: 45 })]);
    renderScreen();
    openTab('Divisions');

    expect(screen.getByText('Unpaid · RON 45')).toBeTruthy();
    expect(screen.getByTestId('payment-due-501')).toBeTruthy();
    expect(screen.getByTestId('division-7')).toBeTruthy();
  });

  it('omits Your divisions without registrations', () => {
    renderScreen();
    openTab('Divisions');

    expect(screen.queryByTestId('active-divisions')).toBeNull();
    expect(screen.getByTestId('event-divisions-catalog')).toBeTruthy();
  });
});

describe('CTA from the live registrations', () => {
  beforeEach(() => setLevel(true));

  it('shows a loader until registrations settle', () => {
    setRegistrations([], true);
    renderScreen();

    expect(screen.getByTestId('cta-loading')).toBeTruthy();
    expect(screen.queryByText('Register')).toBeNull();
    expect(screen.queryByText('Pay Now')).toBeNull();
  });

  it('offers Pay Now for any unpaid payable registration', () => {
    setRegistrations([
      makeRegistration({
        id_registration: 501,
        payment_status: 'paid',
        amount_due: 0,
      }),
      makeRegistration({
        id_registration: 502,
        event_division_id: DIVISION_ID + 1,
        payment_status: 'unpaid',
        amount_due: 45,
      }),
    ]);
    renderScreen();

    fireEvent.press(screen.getByText('Pay Now'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/event/registration',
      params: { eventId: String(EDITION_ID), initialStep: '2' },
    });
  });

  it('shows a pending review badge while a payment proof is under review', () => {
    setRegistrations([makeRegistrationWithStatus('awaiting_proof_review')]);
    renderScreen();

    expect(screen.getByText('Registration Review in Pending')).toBeTruthy();
    expect(screen.queryByText('Pay Now')).toBeNull();
    expect(screen.queryByText('Register')).toBeNull();

    fireEvent.press(screen.getByText('Registration Review in Pending'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/event/registration',
      params: { eventId: String(EDITION_ID), initialStep: '3' },
    });
  });

  it('drops the CTA entirely once all active registrations are paid', () => {
    setRegistrations([makeRegistrationWithStatus('paid')]);
    renderScreen();

    expect(screen.queryByText('Pay Now')).toBeNull();
    expect(screen.queryByText('Register')).toBeNull();
    expect(screen.queryByText('Registration Review in Pending')).toBeNull();
  });

  it('hides the CTA once the event has ended without participation', () => {
    mockEvent = makeEvent({ date: '2000-01-01', has_participated: false });
    renderScreen();

    expect(screen.queryByText('Register')).toBeNull();
    expect(screen.queryByText('Participated')).toBeNull();
    expect(screen.queryByTestId('cta-bar')).toBeNull();
  });

  it('shows grey disabled Participated when past and has_participated', () => {
    mockEvent = makeEvent({ date: '2000-01-01', has_participated: true });
    renderScreen();

    const button = screen.getByRole('button', { name: 'Participated' });
    expect(button.props.accessibilityState).toMatchObject({ disabled: true });
    expect(button.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: expect.any(String) })])
    );
    fireEvent.press(screen.getByText('Participated'));
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockStartLevelFlow).not.toHaveBeenCalled();
  });

  it('shows a disabled, non-navigating Registration closed after the deadline', () => {
    mockEvent = makeEvent({
      registration_allowed_until: Math.floor(Date.now() / 1000) - 60,
    });
    renderScreen();

    expect(screen.queryByText('Register')).toBeNull();
    const button = screen.getByRole('button', { name: 'Registration closed' });
    expect(button.props.accessibilityState).toMatchObject({ disabled: true });
    fireEvent.press(screen.getByText('Registration closed'));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('keeps Pay Now after the registration deadline', () => {
    mockEvent = makeEvent({
      registration_allowed_until: Math.floor(Date.now() / 1000) - 60,
    });
    setRegistrations([makeRegistration({ payment_status: 'unpaid' })]);
    renderScreen();

    expect(screen.queryByText('Registration closed')).toBeNull();
    fireEvent.press(screen.getByText('Pay Now'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/event/registration',
      params: { eventId: String(EDITION_ID), initialStep: '2' },
    });
  });
});

describe('self-cancel', () => {
  beforeEach(() => setLevel(true));

  it('sends the chosen cancel_reason and refreshes the registration', async () => {
    setRegistrations([makeRegistration({ payment_status: 'paid' })]);
    renderScreen();

    fireEvent.press(screen.getByTestId('open-cancel-registration'));

    fireEvent.press(screen.getByTestId('cancel-registration-confirm'));
    expect(cancelRegistration).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('cancel-reason-injury_or_illness'));
    fireEvent.press(screen.getByTestId('cancel-registration-confirm'));

    await waitFor(() =>
      expect(cancelRegistration).toHaveBeenCalledWith(
        mockRegistrations[0].id_registration,
        'injury_or_illness'
      )
    );
    await waitFor(() => expect(mockRefetch).toHaveBeenCalled());
  });

  it('multi-selects which divisions to cancel', async () => {
    setRegistrations([
      makeRegistration({ payment_status: 'paid' }),
      makeRegistration({
        id_registration: 502,
        event_division_id: DIVISION_ID + 1,
        payment_status: 'paid',
      }),
    ]);
    renderScreen();

    fireEvent.press(screen.getByTestId('open-cancel-registration'));
    // Uncheck the first reg, keep the second.
    fireEvent.press(screen.getByTestId(`cancel-reg-${mockRegistrations[0].id_registration}`));
    fireEvent.press(screen.getByTestId('cancel-reason-change_of_plans'));
    fireEvent.press(screen.getByTestId('cancel-registration-confirm'));

    await waitFor(() =>
      expect(cancelRegistration).toHaveBeenCalledWith(502, 'change_of_plans')
    );
    expect(cancelRegistration).toHaveBeenCalledTimes(1);
  });

  it('excludes awaiting ids and cancels the rest', async () => {
    setRegistrations([
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
    renderScreen();

    fireEvent.press(screen.getByTestId('open-cancel-registration'));
    fireEvent.press(screen.getByTestId('cancel-reason-change_of_plans'));
    fireEvent.press(screen.getByTestId('cancel-registration-confirm'));

    await waitFor(() =>
      expect(excludeFromCheckout).toHaveBeenCalledWith(901, [501], 'change_of_plans')
    );
    await waitFor(() =>
      expect(cancelRegistration).toHaveBeenCalledWith(502, 'change_of_plans')
    );
  });

  it('hides the cancel action after the event cancel deadline', () => {
    mockEvent = makeEvent({
      cancellation_allowed_until: Math.floor(Date.now() / 1000) - 60,
    });
    setRegistrations([makeRegistration({ payment_status: 'paid' })]);
    renderScreen();

    expect(screen.queryByTestId('open-cancel-registration')).toBeNull();
  });
});
