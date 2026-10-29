import {
  handleReferralUrl,
  isOnEventDetailRoute,
} from '@/services/referralRouting';

jest.mock('@/services/referralQueue', () => ({
  parseReferralDeeplink: jest.fn((url: string | null | undefined) => {
    if (!url) return null;
    if (url.includes('/events/')) return null;
    const match = url.match(/\/event\/(\d+)(?:\/([^/?#]+))?/);
    if (!match) return null;
    if (!url.includes('ref=')) return null;
    const ref = url.split('ref=')[1]?.split('&')[0];
    if (!ref) return null;
    return {
      eventId: Number(match[1]),
      ref,
      ...(match[2] ? { slug: decodeURIComponent(match[2]) } : {}),
    };
  }),
  captureReferralRef: jest.fn(async () => undefined),
}));

const { captureReferralRef } = jest.requireMock('@/services/referralQueue') as {
  captureReferralRef: jest.Mock;
};

describe('isOnEventDetailRoute', () => {
  it('matches /event/{id} and /event/{id}/{slug}', () => {
    expect(isOnEventDetailRoute('/event/42', 42)).toBe(true);
    expect(isOnEventDetailRoute('/event/42/summer-open', 42)).toBe(true);
    expect(isOnEventDetailRoute('/event/42/', 42)).toBe(true);
    expect(isOnEventDetailRoute('/event/7', 42)).toBe(false);
    expect(isOnEventDetailRoute('/events/42', 42)).toBe(false);
    expect(isOnEventDetailRoute(null, 42)).toBe(false);
  });
});

describe('handleReferralUrl', () => {
  beforeEach(() => {
    captureReferralRef.mockClear();
  });

  it('captures only when already on matching event detail', async () => {
    const navigate = jest.fn();
    await handleReferralUrl({
      url: 'https://app.example.test/event/42/summer-open?ref=ABC',
      pathname: '/event/42/summer-open',
      isAuthed: true,
      navigate,
    });
    expect(captureReferralRef).toHaveBeenCalledWith(42, 'ABC', true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('navigates to eventDetailPath when not on that event', async () => {
    const navigate = jest.fn();
    await handleReferralUrl({
      url: 'https://app.example.test/event/42/summer-open?ref=ABC',
      pathname: '/(tabs)',
      isAuthed: false,
      navigate,
    });
    expect(captureReferralRef).toHaveBeenCalledWith(42, 'ABC', false);
    expect(navigate).toHaveBeenCalledWith('/event/42/summer-open');
  });

  it('navigates without slug when link has none', async () => {
    const navigate = jest.fn();
    await handleReferralUrl({
      url: 'padeliz-app://event/9?ref=ZZ',
      pathname: '/event/1',
      isAuthed: true,
      navigate,
    });
    expect(navigate).toHaveBeenCalledWith('/event/9');
  });
});
