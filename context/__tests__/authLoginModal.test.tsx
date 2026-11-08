import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/context/auth';
import AuthLoginModalHost from '@/components/Login/AuthLoginModalHost';
import { makePlayer } from '@/testing/fixtures';

let unauthorizedHandler: (() => void) | null = null;

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: () => 'padeliz-app://redirect',
  useAuthRequest: () => [null, null, jest.fn()],
}));

jest.mock('@/services/apiClient', () => ({
  apiGetEnvelope: jest.fn(),
  apiPost: jest.fn(),
  setTokenGetter: jest.fn(),
  setUnauthorizedHandler: (fn: (() => void) | null) => {
    unauthorizedHandler = fn;
  },
}));

jest.mock('@/services/identities', () => ({
  linkGoogleIdentity: jest.fn(),
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

import { deleteToken } from '@/services/tokenStorage';

function Probe() {
  const { requestLogin, closeLoginModal, user } = useAuth();
  return (
    <>
      <Text testID="user">{user ? 'authed' : 'guest'}</Text>
      <Pressable
        testID="gate"
        onPress={() => requestLogin({ reason: 'gate' })}
      >
        <Text>gate</Text>
      </Pressable>
      <Pressable testID="close" onPress={closeLoginModal}>
        <Text>close</Text>
      </Pressable>
    </>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  unauthorizedHandler = null;
});

describe('AuthProvider LoginModal', () => {
  it('opens the shared modal for gated login', async () => {
    render(
      <AuthProvider>
        <AuthLoginModalHost />
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(unauthorizedHandler).not.toBeNull());
    fireEvent.press(screen.getByTestId('gate'));
    expect(screen.getByTestId('login-modal')).toBeTruthy();
    expect(screen.getByText('Sign in to continue')).toBeTruthy();
  });

  it('clears session and opens Session expired on authed 401', async () => {
    (require('@/services/tokenStorage').getToken as jest.Mock).mockResolvedValueOnce(
      'stale-token'
    );
    (require('@/services/apiClient').apiGetEnvelope as jest.Mock).mockResolvedValueOnce(
      makePlayer()
    );

    render(
      <AuthProvider>
        <AuthLoginModalHost />
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('user').props.children).toBe('authed'));
    expect(unauthorizedHandler).not.toBeNull();

    await act(async () => {
      unauthorizedHandler?.();
    });

    await waitFor(() => expect(screen.getByText('Session expired')).toBeTruthy());
    expect(deleteToken).toHaveBeenCalled();
    expect(screen.getByTestId('user').props.children).toBe('guest');
  });

  it('closes on cancel and stays guest on the same screen', async () => {
    render(
      <AuthProvider>
        <AuthLoginModalHost />
        <Probe />
      </AuthProvider>
    );
    await waitFor(() => expect(unauthorizedHandler).not.toBeNull());
    fireEvent.press(screen.getByTestId('gate'));
    expect(screen.getByText('Sign in to continue')).toBeTruthy();
    fireEvent.press(screen.getByTestId('login-modal-cancel'));
    await waitFor(() =>
      expect(screen.queryByText('Sign in to continue')).toBeNull()
    );
    expect(screen.getByTestId('user').props.children).toBe('guest');
  });
});
