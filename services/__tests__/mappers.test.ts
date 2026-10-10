import {
  buildSchedule,
  divisionEntryFee,
  eventDivisionOptions,
  eventPriceLabel,
  eventToCard,
  eventToDetails,
  formatDateShort,
  registrationToEventStatus,
} from '@/services/mappers';

describe('formatDateShort', () => {
  it('formats YYYY-MM-DD as day short-month year', () => {
    expect(formatDateShort('2026-10-24')).toBe('24 Oct 2026');
  });
});
import type { RegistrationPaymentStatus } from '@/types/api';
import {
  DIVISION_ID,
  makeEvent,
  makeRegistration,
  makeRegistrationWithStatus,
} from '@/testing/fixtures';

describe('divisionEntryFee / eventPriceLabel', () => {
  it('reads fees from divisions and formats a range', () => {
    const event = makeEvent();
    expect(divisionEntryFee(event.event_divisions![0])).toBe(45);
    expect(divisionEntryFee(event.event_divisions![1])).toBe(60);
    expect(eventPriceLabel(event)).toBe('RON 45 - 60');
  });

  it('formats a single fee when all divisions match', () => {
    const event = makeEvent({
      event_divisions: [
        {
          id_event_division: 1,
          event_id: 42,
          division_id: 5,
          players_limit: 8,
          entry_fee: 50,
          playing_start_time: null,
          playing_end_time: null,
        },
      ],
    });
    expect(eventPriceLabel(event)).toBe('RON 50');
  });
});

describe('eventDivisionOptions', () => {
  it('maps event divisions to selectable options with per-division fees', () => {
    const [first, second] = eventDivisionOptions(makeEvent());

    expect(first).toEqual({
      id: DIVISION_ID,
      name: 'Students Rookies',
      price: 45,
      description: 'Playing 11:00 - 14:00',
      num_spots: 12,
      isEligible: true,
      isActive: true,
      color: '#2E7D32',
      playingStart: '11:00',
      playingEnd: '14:00',
    });
    expect(second.price).toBe(60);
    expect(second.color).toBe('#1565C0');
  });

  it('uses the server is_eligible verdict instead of hardcoding true', () => {
    const event = makeEvent();
    event.event_divisions![0].is_eligible = true;
    event.event_divisions![1].is_eligible = false;
    const [first, second] = eventDivisionOptions(event);
    expect(first.isEligible).toBe(true);
    expect(second.isEligible).toBe(false);
  });

  it('treats a missing / null is_eligible (guests, no level) as not eligible', () => {
    const event = makeEvent();
    event.event_divisions![0].is_eligible = null;
    delete event.event_divisions![1].is_eligible;
    const [first, second] = eventDivisionOptions(event);
    expect(first.isEligible).toBe(false);
    expect(second.isEligible).toBe(false);
  });

  it('falls back to the division name when no per-event title is set', () => {
    const event = makeEvent({
      event_divisions: [
        {
          id_event_division: 1,
          event_id: 42,
          division_id: 5,
          division_title: null,
          players_limit: 8,
          entry_fee: 55,
          playing_start_time: null,
          playing_end_time: null,
          division: { id_division: 5, name: 'Open' },
        },
      ],
    });

    const [only] = eventDivisionOptions(event);
    expect(only.name).toBe('Open');
    expect(only.price).toBe(55);
    expect(only.description).toBe('Up to 8 players');
  });

  it('returns nothing when the event has no divisions', () => {
    expect(eventDivisionOptions(makeEvent({ event_divisions: [] }))).toEqual(
      []
    );
  });
});

describe('eventToCard / eventToDetails', () => {
  it('maps cover as { uri }, description passthrough, organizer, and badges', () => {
    const event = makeEvent({
      badges: [
        { key: 'new', label: 'New' },
        { key: 'lottery_winner', label: 'Lottery Winner' },
      ],
    });

    const card = eventToCard(event);
    expect(card.coverImage).toEqual({ uri: 'https://example.com/cover.png' });
    expect(card.badges).toEqual([
      { key: 'new', label: 'New' },
      { key: 'lottery_winner', label: 'Lottery Winner' },
    ]);

    const details = eventToDetails(event);
    expect(details.eventImage).toEqual({ uri: 'https://example.com/cover.png' });
    expect(details.eventDescription).toBe('<p>Join us for a day of padel.</p>');
    expect(details.organizerName).toBe('Tour Org');
    expect(details.organizerImage).toEqual({ uri: 'https://example.com/org.png' });
    expect(details.badges).toEqual(card.badges);
    expect((details as { organizerTitle?: string }).organizerTitle).toBeUndefined();
  });

  it('maps null cover and null organizer without fallbacks', () => {
    const event = makeEvent({
      cover_url: null,
      organizer: null,
      organizer_id: null,
      description: undefined,
    });

    const card = eventToCard(event);
    const details = eventToDetails(event);

    expect(card.coverImage).toBeNull();
    expect(details.eventImage).toBeNull();
    expect(details.organizerName).toBeNull();
    expect(details.organizerImage).toBeNull();
    expect(details.eventDescription).toBe('');
  });
});

describe('buildSchedule', () => {
  it('includes Check-in and stacked unique Playing windows, never Closing', () => {
    const event = makeEvent({
      arriving_time: '10:30:00',
      closing_time: '20:00:00',
      event_divisions: [
        {
          id_event_division: 1,
          event_id: 42,
          division_id: 2,
          players_limit: 8,
          entry_fee: 45,
          playing_start_time: '14:30:00',
          playing_end_time: '18:00:00',
        },
        {
          id_event_division: 2,
          event_id: 42,
          division_id: 3,
          players_limit: 8,
          entry_fee: 50,
          playing_start_time: '11:00:00',
          playing_end_time: '14:00:00',
        },
        {
          id_event_division: 3,
          event_id: 42,
          division_id: 4,
          players_limit: 8,
          entry_fee: 55,
          playing_start_time: '11:00:00',
          playing_end_time: '14:00:00',
        },
      ],
    });

    expect(buildSchedule(event)).toEqual([
      { label: 'Check-in', time: '10:30' },
      { label: 'Playing', time: '11:00 - 14:00' },
      { label: '', time: '14:30 - 18:00' },
    ]);
    expect(buildSchedule(event).filter((i) => i.label === 'Playing')).toHaveLength(1);
    expect(buildSchedule(event).some((i) => i.label === 'Closing')).toBe(false);
  });
});

describe('registrationToEventStatus', () => {
  const cases: [RegistrationPaymentStatus, string][] = [
    ['unpaid', 'pending_payment'],
    ['awaiting_proof_review', 'registration_pending'],
    ['paid', 'registered'],
  ];

  it.each(cases)('maps %s to %s', (paymentStatus, expected) => {
    expect(registrationToEventStatus(makeRegistrationWithStatus(paymentStatus))).toBe(
      expected
    );
  });

  it('ignores unpaid free lines when aggregating', () => {
    const freeUnpaid = makeRegistration({
      payment_status: 'unpaid',
      amount_due: 0,
    });
    const paid = makeRegistration({
      id_registration: 502,
      payment_status: 'paid',
      amount_due: 0,
    });

    expect(registrationToEventStatus([freeUnpaid, paid])).toBe('registered');
  });

  it('prefers unpaid payable over awaiting and paid siblings', () => {
    const unpaid = makeRegistrationWithStatus('unpaid');
    const awaiting = makeRegistration({
      id_registration: 502,
      payment_status: 'awaiting_proof_review',
      event_division_id: DIVISION_ID + 1,
    });
    const paid = makeRegistration({
      id_registration: 503,
      payment_status: 'paid',
      event_division_id: DIVISION_ID + 2,
    });

    expect(registrationToEventStatus([paid, awaiting, unpaid])).toBe('pending_payment');
    expect(registrationToEventStatus([paid, awaiting])).toBe('registration_pending');
  });

  it('ignores cancelled registrations', () => {
    const cancelled = makeRegistration({
      lifecycle_status: 'cancelled',
      payment_status: 'unpaid',
    });

    expect(registrationToEventStatus(cancelled)).toBe('none');
  });

  it('does not treat refund_* as registered', () => {
    expect(registrationToEventStatus(makeRegistrationWithStatus('refund_pending'))).toBe(
      'none'
    );
    expect(registrationToEventStatus(makeRegistrationWithStatus('refunded'))).toBe('none');
  });

  it('defaults to none without a registration', () => {
    expect(registrationToEventStatus(null)).toBe('none');
  });
});
