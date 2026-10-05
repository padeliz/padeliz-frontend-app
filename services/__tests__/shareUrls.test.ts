import {
  eventShareUrl,
  referralShareUrl,
} from '@/services/referral';
import { parseReferralDeeplink } from '@/services/referralQueue';

jest.mock('@/utils/constants', () => ({
  BASE_URL: 'https://app.example.test',
  API_URL: 'http://localhost:8000/api/v1',
}));

describe('share URL helpers', () => {
  it('builds BASE_URL event and referral links on /event/', () => {
    expect(eventShareUrl(42)).toBe('https://app.example.test/event/42');
    expect(referralShareUrl(42, 'ABC 1')).toBe(
      'https://app.example.test/event/42?ref=ABC%201'
    );
  });

  it('includes slug segment when provided', () => {
    expect(eventShareUrl(42, 'padel-club-open')).toBe(
      'https://app.example.test/event/42/padel-club-open'
    );
    expect(referralShareUrl(42, 'ABC', 'padel-club-open')).toBe(
      'https://app.example.test/event/42/padel-club-open?ref=ABC'
    );
  });

  it('omits slug segment when null', () => {
    expect(eventShareUrl(42, null)).toBe('https://app.example.test/event/42');
  });
});

describe('parseReferralDeeplink HTTPS', () => {
  it('parses HTTPS /event/ referral links', () => {
    expect(
      parseReferralDeeplink('https://app.example.test/event/42?ref=CODE99')
    ).toEqual({ eventId: 42, ref: 'CODE99' });
  });

  it('parses optional slug segment and returns slug', () => {
    expect(
      parseReferralDeeplink(
        'https://app.example.test/event/42/padel-club-open?ref=CODE99'
      )
    ).toEqual({ eventId: 42, ref: 'CODE99', slug: 'padel-club-open' });
  });

  it('rejects legacy /events/ paths', () => {
    expect(
      parseReferralDeeplink('https://app.example.test/events/42?ref=CODE99')
    ).toBeNull();
  });
});
