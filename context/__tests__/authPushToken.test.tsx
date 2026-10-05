import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { AuthProvider, useAuth } from '@/context/auth';
import { apiPost } from '@/services/apiClient';
import { registerDeviceToken, unregisterDeviceToken } from '@/services/registration';
import { getToken } from '@/services/tokenStorage';
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

jest.mock('@/services/registration', () => ({
  registerDeviceToken: jest.fn(async () => ({})),
  unregisterDeviceToken: jest.fn(async () => ({})),
}));

jest.mock('@/services/tokenStorage', () => ({
  getToken: jest.fn(async () => null),
  saveToken: jest.fn(async () => undefined),
  deleteToken: jest.fn(async () => undefined),
}));

jest.mock('@/services/referralQueue', () => ({
  flushReferralQueue: jest.fn(async () => ({ posted: 0, failed: 0 })),
}));

const PLAYER = makePlayer();

function Probe() {
  const { user, devLogin, signOut } = useAuth();
  return (
    <>
      <Text testID="user">{user ? user.name : 'anonymous'}</Text>
      <Pressable testID="login" onPress={() => void devLogin('ana@example.com')}>
        <Text>login</Text>
      </Pressable>
      <Pressable testID="logout" onPress={() => void signOut()}>
        <Text>logout</Text>
      </Pressable>
    </>
  );
}

function renderProbe() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  (getToken as jest.Mock).mockResolvedValue(null);
  (apiPost as jest.Mock).mockResolvedValue({ token: 'sanctum-token', player: PLAYER });
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
  (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
    data: 'ExponentPushToken[test]',
  });
});

describe('push device token', () => {
  it('registers the Expo push token after login', async () => {
    renderProbe();

    fireEvent.press(screen.getByTestId('login'));

    await waitFor(() =>
      expect(registerDeviceToken).toHaveBeenCalledWith('ExponentPushToken[test]', 'ios')
    );
  });

  it('requests permission first when it was not granted yet', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: false,
    });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
    });
    renderProbe();

    fireEvent.press(screen.getByTestId('login'));

    await waitFor(() => expect(Notifications.requestPermissionsAsync).toHaveBeenCalled());
    await waitFor(() => expect(registerDeviceToken).toHaveBeenCalled());
  });

  it('does not register a token when notifications are declined', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: false,
    });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: false,
    });
    renderProbe();

    fireEvent.press(screen.getByTestId('login'));

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Ana Pop'));
    expect(registerDeviceToken).not.toHaveBeenCalled();
  });

  it('registers the token again when a stored session is restored', async () => {
    (getToken as jest.Mock).mockResolvedValue('stored-token');
    const { apiGetEnvelope } = jest.requireMock('@/services/apiClient');
    (apiGetEnvelope as jest.Mock).mockResolvedValue(PLAYER);

    renderProbe();

    await waitFor(() =>
      expect(registerDeviceToken).toHaveBeenCalledWith('ExponentPushToken[test]', 'ios')
    );
  });

  it('removes the registered token on sign-out', async () => {
    renderProbe();

    fireEvent.press(screen.getByTestId('login'));
    await waitFor(() => expect(registerDeviceToken).toHaveBeenCalled());

    fireEvent.press(screen.getByTestId('logout'));

    await waitFor(() =>
      expect(unregisterDeviceToken).toHaveBeenCalledWith('ExponentPushToken[test]')
    );
  });

  it('never blocks login when the push service fails', async () => {
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockRejectedValue(
      new Error('no credentials')
    );
    renderProbe();

    fireEvent.press(screen.getByTestId('login'));

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Ana Pop'));
    expect(registerDeviceToken).not.toHaveBeenCalled();
  });
});
