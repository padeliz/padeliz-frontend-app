import { Platform } from 'react-native';
import {
  enqueueReferral,
  getReferralQueue,
  parseReferralDeeplink,
} from '@/services/referralQueue';

jest.mock('@/utils/cache', () => ({
  tokenCache: undefined,
}));

describe('parseReferralDeeplink', () => {
  it('parses padeliz-app://event/{id}?ref=CODE', () => {
    expect(parseReferralDeeplink('padeliz-app://event/42?ref=ABC123')).toEqual({
      eventId: 42,
      ref: 'ABC123',
    });
  });

  it('parses padeliz-app://event/{id}/{slug}?ref=CODE', () => {
    expect(
      parseReferralDeeplink('padeliz-app://event/42/summer-open?ref=ABC123')
    ).toEqual({
      eventId: 42,
      ref: 'ABC123',
      slug: 'summer-open',
    });
  });

  it('parses HTTPS /event/ referral links with optional slug', () => {
    expect(
      parseReferralDeeplink('https://app.padeliz.ro/event/42?ref=HTTPS1')
    ).toEqual({ eventId: 42, ref: 'HTTPS1' });
    expect(
      parseReferralDeeplink(
        'https://app.padeliz.ro/event/42/club-open?ref=HTTPS1'
      )
    ).toEqual({ eventId: 42, ref: 'HTTPS1', slug: 'club-open' });
  });

  it('parses path-only /event/ referral links', () => {
    expect(parseReferralDeeplink('/event/42?ref=PATH1')).toEqual({
      eventId: 42,
      ref: 'PATH1',
    });
  });

  it('returns null for legacy padeliz:// scheme', () => {
    expect(parseReferralDeeplink('padeliz://event/42?ref=ABC123')).toBeNull();
  });

  it('returns null without a ref', () => {
    expect(parseReferralDeeplink('padeliz-app://event/42')).toBeNull();
  });

  it('returns null for legacy /events/ paths', () => {
    expect(parseReferralDeeplink('padeliz-app://events/42?ref=ABC')).toBeNull();
    expect(
      parseReferralDeeplink('https://app.padeliz.ro/events/42?ref=ABC')
    ).toBeNull();
  });
});

describe('referral queue', () => {
  const store: Record<string, string> = {};
  const originalOS = Platform.OS;

  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'web' });
    Object.defineProperty(global, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS });
  });

  it('queues and dedupes by event_id', async () => {
    await enqueueReferral(42, 'OLD');
    await enqueueReferral(42, 'NEW');
    await enqueueReferral(7, 'OTHER');

    const queue = await getReferralQueue();
    expect(queue).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ event_id: 42, ref: 'NEW' }),
        expect.objectContaining({ event_id: 7, ref: 'OTHER' }),
      ])
    );
    expect(queue).toHaveLength(2);
  });
});
