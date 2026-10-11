import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/context/auth';
import { apiGetEnvelope, apiPost } from '@/services/apiClient';
import { makePlayer } from '@/testing/fixtures';

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: () => 'padeliz://redirect',
  useAuthRequest: () => [null, null, jest.fn()],
}));

jest.mock('@/services/apiClient', () => ({
  apiGetEnvelope: jest.fn(),
  apiPost: jest.fn(),
  setTokenGetter: jest.fn(),
  setUnauthorizedHandler: jest.fn(),
}));

jest.mock('@/services/identities', () => ({
  linkGoogleIdentity: jest.fn(async () => ({
    identity: { id_user_identity: 99, provider: 'google' },
    result_code: 'linked',
  })),
}));

jest.mock('@/services/tokenStorage', () => ({
  getToken: jest.fn(async () => null),
  saveToken: jest.fn(async () => undefined),
  deleteToken: jest.fn(async () => undefined),
}));

jest.mock('@/services/push', () => ({
  syncPushToken: jest.fn(async () => undefined),
  clearPushToken: jest.fn(async () => undefined),
}));

jest.mock('@/services/referralQueue', () => ({
  flushReferralQueue: jest.fn(async () => ({ posted: 0, failed: 0 })),
}));

import { linkGoogleIdentity as apiLinkGoogleIdentity } from '@/services/identities';

const PLAYER = makePlayer();

function Probe() {
  const { linkGoogleIdentity, user } = useAuth();
  return (
    <>
      <Text testID="email">{user?.email ?? 'none'}</Text>
      <Pressable testID="link" onPress={() => void linkGoogleIdentity('id-token-1')}>
        <Text>link</Text>
      </Pressable>
    </>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  (apiPost as jest.Mock).mockResolvedValue({
    token: 't',
    user: PLAYER,
  });
  (apiGetEnvelope as jest.Mock).mockResolvedValue(
    makePlayer({ emails: [makePlayer().emails![0]] })
  );
});

describe('linkGoogleIdentity', () => {
  it('posts to identities/google and refreshes me without login endpoints', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    fireEvent.press(screen.getByTestId('link'));

    await waitFor(() => expect(apiLinkGoogleIdentity).toHaveBeenCalledWith('id-token-1'));
    await waitFor(() => expect(apiGetEnvelope).toHaveBeenCalledWith('/app/auth/me'));
    expect(apiPost).not.toHaveBeenCalledWith(
      '/app/auth/google',
      expect.anything(),
      expect.anything()
    );
  });
});
