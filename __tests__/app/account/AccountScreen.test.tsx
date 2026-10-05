import React from 'react';
import { Alert } from 'react-native';
import {
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { renderWithQueryClient } from '@/testing/renderWithQueryClient';
import { disposeTestQueryClient } from '@/testing/createTestQueryClient';
import AccountScreen from '@/app/(tabs)/account';
import { confirmAsync } from '@/services/confirm';
import { mapPlayerToUser } from '@/services/authUser';
import { makeGoogleIdentity, makePlayer } from '@/testing/fixtures';
import { ApiError } from '@/services/apiError';

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

const mockObtainGoogleIdToken = jest.fn(async () => 'google-id-token');
const mockLinkGoogleIdentity = jest.fn(async () => undefined);
const mockSignOut = jest.fn(async () => undefined);

let mockUser: ReturnType<typeof mapPlayerToUser> | null = mapPlayerToUser(makePlayer());
let mockAuthLoading = false;

function renderAccount() {
  const result = renderWithQueryClient(<AccountScreen />);
  return result;
}

jest.mock('@/context/auth', () => ({
  useAuth: () => ({
    get user() {
      return mockUser;
    },
    isLoading: mockAuthLoading,
    signOut: mockSignOut,
    obtainGoogleIdToken: mockObtainGoogleIdToken,
    linkGoogleIdentity: mockLinkGoogleIdentity,
  }),
}));

jest.mock('@/services/eventHistory', () => ({
  fetchEventHistory: jest.fn(async () => ({ data: [] })),
}));

jest.mock('@/services/confirm', () => ({
  confirmAsync: jest.fn(async () => true),
}));

const mockRefetchIdentities = jest.fn();
let mockIdentities = [makeGoogleIdentity({ id_identity: 10, email: 'linked@example.com' })];
let mockIdentitiesLoading = false;
let mockUnlinkPending = false;
const mockUnlinkMutateAsync = jest.fn(async () => undefined);

jest.mock('@/services/hooks/useIdentities', () => ({
  useIdentities: () => ({
    data: mockIdentities,
    loading: mockIdentitiesLoading,
    error: null,
    refetch: mockRefetchIdentities,
  }),
  useUnlinkIdentityMutation: () => ({
    mutateAsync: mockUnlinkMutateAsync,
    get isPending() {
      return mockUnlinkPending;
    },
  }),
}));

jest.mock('expo-router', () =>
  require('@/testing/expoRouterMock').createExpoRouterMock()
);

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthLoading = false;
  mockUser = mapPlayerToUser(makePlayer());
  mockIdentities = [makeGoogleIdentity({ id_identity: 10, email: 'linked@example.com' })];
  mockIdentitiesLoading = false;
  mockUnlinkPending = false;
  (confirmAsync as jest.Mock).mockResolvedValue(true);
});

describe('AccountScreen', () => {
  it('shows guest login when logged out', async () => {
    mockUser = null;
    const { client } = renderAccount();
    expect(screen.getByTestId('account-guest-login')).toBeTruthy();
    await disposeTestQueryClient(client);
  });

  it('lists linked Google identities without primary badge', async () => {
    const { client } = renderAccount();
    expect(screen.getByTestId('google-identities-list')).toBeTruthy();
    expect(screen.getByText('linked@example.com')).toBeTruthy();
    expect(screen.queryByText('Primary Account')).toBeNull();
    await disposeTestQueryClient(client);
  });

  it('shows locked personal info fields', async () => {
    const { client } = renderAccount();
    expect(screen.getByText('Full Name')).toBeTruthy();
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Phone Number')).toBeTruthy();
    expect(screen.getByTestId('account-avatar-lock')).toBeTruthy();
    expect(screen.queryByText('private section')).toBeNull();
    expect(screen.queryByText('Birthdate')).toBeNull();
    expect(screen.queryByText('High School / University student')).toBeNull();
    await disposeTestQueryClient(client);
  });

  it('hides Unlink when the identity is the last for that provider', async () => {
    const { client } = renderAccount();
    fireEvent.press(screen.getByTestId('google-identity-10'));
    expect(screen.queryByText('Unlink')).toBeNull();
    expect(screen.getByText('Close')).toBeTruthy();
    await disposeTestQueryClient(client);
  });

  it('shows Unlink when multiple Google identities exist', async () => {
    mockIdentities = [
      makeGoogleIdentity({ id_identity: 10, email: 'linked@example.com' }),
      makeGoogleIdentity({ id_identity: 11, email: 'second@example.com' }),
    ];
    const { client } = renderAccount();
    fireEvent.press(screen.getByTestId('google-identity-10'));
    expect(screen.getByText('Unlink')).toBeTruthy();
    await disposeTestQueryClient(client);
  });

  it('surfaces unlink errors in the identity modal', async () => {
    mockIdentities = [
      makeGoogleIdentity({ id_identity: 10, email: 'linked@example.com' }),
      makeGoogleIdentity({ id_identity: 11, email: 'second@example.com' }),
    ];
    mockUnlinkMutateAsync.mockRejectedValueOnce(
      new ApiError(422, 'Cannot unlink the last Google identity')
    );
    const { client } = renderAccount();
    fireEvent.press(screen.getByTestId('google-identity-10'));
    fireEvent.press(screen.getByText('Unlink'));

    await waitFor(() =>
      expect(screen.getByTestId('identity-unlink-error')).toBeTruthy()
    );
    expect(screen.getByText('Cannot unlink the last Google identity')).toBeTruthy();
    await disposeTestQueryClient(client);
  });

  it('shows on-button loading and disables close while unlink is pending', async () => {
    mockIdentities = [
      makeGoogleIdentity({ id_identity: 10, email: 'linked@example.com' }),
      makeGoogleIdentity({ id_identity: 11, email: 'second@example.com' }),
    ];
    mockUnlinkPending = true;
    const { client } = renderAccount();
    fireEvent.press(screen.getByTestId('google-identity-10'));

    expect(screen.getByText('Unlinking…')).toBeTruthy();
    fireEvent.press(screen.getByText('Close'));
    expect(screen.getByText('Unlinking…')).toBeTruthy();
    await disposeTestQueryClient(client);
  });

  it('links another Google account via obtainGoogleIdToken', async () => {
    const { client } = renderAccount();
    fireEvent.press(screen.getByTestId('link-google-account'));

    await waitFor(() => expect(mockObtainGoogleIdToken).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockLinkGoogleIdentity).toHaveBeenCalledWith('google-id-token')
    );
    await disposeTestQueryClient(client);
  });

  it('alerts on link conflict', async () => {
    mockLinkGoogleIdentity.mockRejectedValueOnce(
      new ApiError(409, 'Identity already linked to another player')
    );
    const { client } = renderAccount();
    fireEvent.press(screen.getByTestId('link-google-account'));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Could not link account',
        'Identity already linked to another player'
      )
    );
    await disposeTestQueryClient(client);
  });

  it('confirms before sign out', async () => {
    const { client } = renderAccount();
    fireEvent.press(screen.getByTestId('account-sign-out'));

    await waitFor(() => expect(confirmAsync).toHaveBeenCalled());
    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    await disposeTestQueryClient(client);
  });

  it('does not sign out when confirmation is cancelled', async () => {
    (confirmAsync as jest.Mock).mockResolvedValueOnce(false);
    const { client } = renderAccount();
    fireEvent.press(screen.getByTestId('account-sign-out'));

    await waitFor(() => expect(confirmAsync).toHaveBeenCalled());
    expect(mockSignOut).not.toHaveBeenCalled();
    await disposeTestQueryClient(client);
  });
});
