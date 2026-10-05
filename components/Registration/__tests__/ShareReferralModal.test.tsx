import React from 'react';
import { Share } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import ShareReferralModal from '@/components/Registration/ShareReferralModal';
import { confirmAsync } from '@/services/confirm';
import {
  createReferralCode,
  fetchReferralCodes,
  revokeReferralCode,
} from '@/services/referral';

const mockAuthUser = { id: '1', email: 'a@b.com', name: 'Test', player: {} };
let mockCurrentUser: typeof mockAuthUser | null = mockAuthUser;

jest.mock('@/context/auth', () => ({
  useAuth: () => ({
    user: mockCurrentUser,
    signIn: jest.fn(),
    isLoading: false,
  }),
}));

jest.mock('@/services/confirm', () => ({
  confirmAsync: jest.fn(),
}));

jest.mock('@/services/referral', () => ({
  createReferralCode: jest.fn(),
  fetchReferralCodes: jest.fn(),
  revokeReferralCode: jest.fn(),
  eventShareUrl: (eventId: number, slug?: string | null) =>
    slug
      ? `https://app.example.test/event/${eventId}/${slug}`
      : `https://app.example.test/event/${eventId}`,
  referralShareUrl: (eventId: number, code: string, slug?: string | null) =>
    slug
      ? `https://app.example.test/event/${eventId}/${slug}?ref=${code}`
      : `https://app.example.test/event/${eventId}?ref=${code}`,
  referralDeeplink: (eventId: number, code: string) =>
    `https://app.example.test/event/${eventId}?ref=${code}`,
}));

jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction } as any);

describe('ShareReferralModal tabs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = mockAuthUser;
    (fetchReferralCodes as jest.Mock).mockResolvedValue({
      remaining_slots: 6,
      codes: [],
    });
  });

  it('shows Share event and Share referral tabs without plain URL', async () => {
    render(
      <ShareReferralModal visible eventId={42} eventName="Tour" onClose={jest.fn()} />
    );

    expect(screen.getByTestId('share-tab-event')).toBeTruthy();
    expect(screen.getByTestId('share-tab-referral')).toBeTruthy();
    expect(screen.queryByTestId('share-event-url')).toBeNull();
    expect(screen.getByTestId('copy-event-link')).toBeTruthy();
    expect(screen.getByTestId('share-event-link')).toBeTruthy();
    await waitFor(() => expect(fetchReferralCodes).toHaveBeenCalled());
  });

  it('puts Add invitee and Create code on the same row', async () => {
    render(
      <ShareReferralModal visible eventId={42} eventName="Tour" onClose={jest.fn()} />
    );
    fireEvent.press(screen.getByTestId('share-tab-referral'));
    await waitFor(() => expect(fetchReferralCodes).toHaveBeenCalled());

    const row = screen.getByTestId('create-invitee-actions');
    expect(row).toBeTruthy();
    expect(screen.getByTestId('add-invitee')).toBeTruthy();
    expect(screen.getByTestId('create-referral-code')).toBeTruthy();
  });

  it('shows LoginOptions on referral tab for guests', () => {
    mockCurrentUser = null;
    render(
      <ShareReferralModal visible eventId={42} eventName="Tour" onClose={jest.fn()} />
    );

    fireEvent.press(screen.getByTestId('share-tab-referral'));
    expect(screen.getByTestId('share-referral-guest')).toBeTruthy();
    expect(screen.getByTestId('login-options')).toBeTruthy();
    expect(
      screen.getByText('Invite newcomers join Tour with your personal code.')
    ).toBeTruthy();
  });

  it('uses exact referral subtitle when authenticated', async () => {
    render(
      <ShareReferralModal visible eventId={42} eventName="Tour" onClose={jest.fn()} />
    );
    fireEvent.press(screen.getByTestId('share-tab-referral'));

    await waitFor(() => expect(fetchReferralCodes).toHaveBeenCalled());
    expect(screen.getByTestId('share-referral-subtitle').props.children).toBe(
      'Invite newcomers join Tour with your personal code.'
    );
  });

  it('creates a code without calling Share.share', async () => {
    (createReferralCode as jest.Mock).mockResolvedValue({
      remaining_slots: 5,
      code: {
        id_referral_code: 11,
        code: 'ABC12345',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        revoked_at: null,
        invitees: [{ email: 'a@b.com', phone: null }],
      },
    });

    render(
      <ShareReferralModal visible eventId={42} eventName="Tour" onClose={jest.fn()} />
    );
    fireEvent.press(screen.getByTestId('share-tab-referral'));

    await waitFor(() => expect(fetchReferralCodes).toHaveBeenCalled());

    fireEvent.changeText(screen.getByTestId('invitee-email-0'), 'a@b.com');
    fireEvent.press(screen.getByTestId('create-referral-code'));

    await waitFor(() => expect(createReferralCode).toHaveBeenCalled());
    expect(Share.share).not.toHaveBeenCalled();
    expect(screen.getByText('ABC12345')).toBeTruthy();
  });

  it('shares an existing code on Share press', async () => {
    (fetchReferralCodes as jest.Mock).mockResolvedValue({
      remaining_slots: 5,
      codes: [
        {
          id_referral_code: 11,
          code: 'ABC12345',
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          revoked_at: null,
          invitees: [],
        },
      ],
    });

    render(
      <ShareReferralModal
        visible
        eventId={42}
        eventName="Tour"
        eventSlug="tour-org-tour"
        onClose={jest.fn()}
      />
    );
    fireEvent.press(screen.getByTestId('share-tab-referral'));

    await waitFor(() => expect(screen.getByText('ABC12345')).toBeTruthy());
    fireEvent.press(screen.getByText('Share'));

    await waitFor(() =>
      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('/event/42/tour-org-tour?ref=ABC12345'),
        })
      )
    );
  });

  it('disables close while create is pending', async () => {
    let resolveCreate: ((value: unknown) => void) | undefined;
    (createReferralCode as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve;
        })
    );

    const onClose = jest.fn();
    render(
      <ShareReferralModal visible eventId={42} eventName="Tour" onClose={onClose} />
    );
    fireEvent.press(screen.getByTestId('share-tab-referral'));
    await waitFor(() => expect(fetchReferralCodes).toHaveBeenCalled());

    fireEvent.changeText(screen.getByTestId('invitee-email-0'), 'a@b.com');
    fireEvent.press(screen.getByTestId('create-referral-code'));

    await waitFor(() => expect(screen.getByText('Creating…')).toBeTruthy());
    fireEvent.press(screen.getByTestId('close-share-referral'));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId('close-share-referral')).toBeDisabled();

    resolveCreate?.({
      remaining_slots: 5,
      code: {
        id_referral_code: 11,
        code: 'ABC12345',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        revoked_at: null,
        invitees: [{ email: 'a@b.com', phone: null }],
      },
    });
  });

  describe('revoke', () => {
    const futureExpiry = () => Math.floor(Date.now() / 1000) + 3600;

    const activeCode = {
      id_referral_code: 11,
      code: 'ABC12345',
      revoked_at: null,
      invitees: [],
    };

    const renderReferralTab = async () => {
      render(
        <ShareReferralModal visible eventId={42} eventName="Tour" onClose={jest.fn()} />
      );
      fireEvent.press(screen.getByTestId('share-tab-referral'));
      await waitFor(() => expect(screen.getByText('ABC12345')).toBeTruthy());
    };

    it('confirms before revoking and revokes when confirmed', async () => {
      (fetchReferralCodes as jest.Mock).mockResolvedValue({
        remaining_slots: 5,
        codes: [{ ...activeCode, expires_at: futureExpiry() }],
      });
      (confirmAsync as jest.Mock).mockResolvedValue(true);
      (revokeReferralCode as jest.Mock).mockResolvedValue({
        remaining_slots: 6,
        code: { ...activeCode, expires_at: futureExpiry(), revoked_at: 1_700_000_000 },
      });

      await renderReferralTab();
      fireEvent.press(screen.getByTestId('revoke-referral-11'));

      await waitFor(() =>
        expect(confirmAsync).toHaveBeenCalledWith(
          'Revoke code?',
          'Players won’t be able to use this referral code.'
        )
      );
      await waitFor(() => expect(revokeReferralCode).toHaveBeenCalledWith(11));
      await waitFor(() => expect(screen.queryByTestId('revoke-referral-11')).toBeNull());
      expect(screen.getByText(/Revoked/)).toBeTruthy();
    });

    it('does not revoke when the confirmation is dismissed', async () => {
      (fetchReferralCodes as jest.Mock).mockResolvedValue({
        remaining_slots: 5,
        codes: [{ ...activeCode, expires_at: futureExpiry() }],
      });
      (confirmAsync as jest.Mock).mockResolvedValue(false);

      await renderReferralTab();
      fireEvent.press(screen.getByTestId('revoke-referral-11'));

      await waitFor(() => expect(confirmAsync).toHaveBeenCalled());
      expect(revokeReferralCode).not.toHaveBeenCalled();
      expect(screen.getByTestId('revoke-referral-11')).toBeTruthy();
    });

    it('shows Copy/Share/Revoke only for active codes', async () => {
      (fetchReferralCodes as jest.Mock).mockResolvedValue({
        remaining_slots: 3,
        codes: [
          { ...activeCode, expires_at: futureExpiry() },
          {
            id_referral_code: 12,
            code: 'EXPIRED01',
            expires_at: Math.floor(Date.now() / 1000) - 60,
            revoked_at: null,
            invitees: [],
          },
          {
            id_referral_code: 13,
            code: 'REVOKED01',
            expires_at: futureExpiry(),
            revoked_at: 1_700_000_000,
            invitees: [],
          },
        ],
      });

      await renderReferralTab();

      expect(screen.getByTestId('copy-referral-11')).toBeTruthy();
      expect(screen.getByTestId('share-referral-11')).toBeTruthy();
      expect(screen.getByTestId('revoke-referral-11')).toBeTruthy();
      for (const id of [12, 13]) {
        expect(screen.queryByTestId(`copy-referral-${id}`)).toBeNull();
        expect(screen.queryByTestId(`share-referral-${id}`)).toBeNull();
        expect(screen.queryByTestId(`revoke-referral-${id}`)).toBeNull();
      }
    });
  });
});
