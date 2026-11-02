import React from 'react';
import { fireEvent, render, screen, act } from '@testing-library/react-native';
import LoginOptions from '@/components/Login/LoginOptions';
import { GOOGLE_SIGN_IN_CANCEL_MESSAGE } from '@/constants/authMessages';
import { ApiError } from '@/services/apiError';

const mockSignIn = jest.fn();
let mockUser: { id: string } | null = null;
let mockError: Error | null = null;

jest.mock('@/context/auth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    user: mockUser,
    error: mockError,
    isLoading: false,
    isHydrating: false,
  }),
}));

describe('LoginOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = null;
    mockError = null;
    mockSignIn.mockResolvedValue(undefined);
  });

  it('renders Google-only sign-in and calls signIn', () => {
    render(<LoginOptions />);

    expect(screen.getByTestId('login-options')).toBeTruthy();
    expect(screen.getByText('Sign in with Google')).toBeTruthy();
    expect(screen.queryByText(/Apple/i)).toBeNull();

    fireEvent.press(screen.getByText('Sign in with Google'));
    expect(mockSignIn).toHaveBeenCalled();
  });

  it('shows loading while signingIn and clears on cancel/error', async () => {
    let rejectSignIn: ((err: Error) => void) | undefined;
    mockSignIn.mockImplementation(
      () =>
        new Promise<void>((_, reject) => {
          rejectSignIn = reject;
        })
    );
    const onBusyChange = jest.fn();
    render(<LoginOptions onBusyChange={onBusyChange} />);

    fireEvent.press(screen.getByText('Sign in with Google'));
    expect(screen.getByTestId('login-google-button-loading')).toBeTruthy();
    expect(onBusyChange).toHaveBeenCalledWith(true);

    await act(async () => {
      rejectSignIn?.(new Error(GOOGLE_SIGN_IN_CANCEL_MESSAGE));
    });

    expect(onBusyChange).toHaveBeenCalledWith(false);
    expect(screen.getByText('Sign in with Google')).toBeTruthy();
  });

  it('calls onAuthSuccess when user becomes available', () => {
    const onAuthSuccess = jest.fn();
    const { rerender } = render(<LoginOptions onAuthSuccess={onAuthSuccess} />);

    fireEvent.press(screen.getByText('Sign in with Google'));
    mockUser = { id: '9' };
    rerender(<LoginOptions onAuthSuccess={onAuthSuccess} />);

    expect(onAuthSuccess).toHaveBeenCalled();
  });

  it('shows warning banner with cancel copy and keeps Google button', () => {
    const onAuthSuccess = jest.fn();
    mockError = new Error(GOOGLE_SIGN_IN_CANCEL_MESSAGE);
    render(<LoginOptions onAuthSuccess={onAuthSuccess} />);

    expect(screen.getByTestId('login-status-banner')).toBeTruthy();
    expect(screen.getByText(GOOGLE_SIGN_IN_CANCEL_MESSAGE)).toBeTruthy();
    expect(screen.getByText('Sign in with Google')).toBeTruthy();
    expect(onAuthSuccess).not.toHaveBeenCalled();
  });

  it('shows error banner for ApiError 404 account-not-found', () => {
    const onAuthSuccess = jest.fn();
    const message =
      'No player account found for this Google account. Ask an organizer to add your login email, then try again.';
    mockError = new ApiError(404, message);
    render(<LoginOptions onAuthSuccess={onAuthSuccess} />);

    expect(screen.getByText(message)).toBeTruthy();
    expect(onAuthSuccess).not.toHaveBeenCalled();
  });

  it('shows error banner for ApiError 422 unverified email', () => {
    const onAuthSuccess = jest.fn();
    const message =
      "This Google email isn't verified yet. Verify it in your Google account, then try again.";
    mockError = new ApiError(422, message);
    render(<LoginOptions onAuthSuccess={onAuthSuccess} />);

    expect(screen.getByText(message)).toBeTruthy();
    expect(onAuthSuccess).not.toHaveBeenCalled();
  });

  it('shows error banner for generic network Error', () => {
    const onAuthSuccess = jest.fn();
    mockError = new Error('Network request failed');
    render(<LoginOptions onAuthSuccess={onAuthSuccess} />);

    expect(screen.getByText('Network request failed')).toBeTruthy();
    expect(onAuthSuccess).not.toHaveBeenCalled();
  });
});
