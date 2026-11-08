import React from 'react';
import { fireEvent, render, screen, act } from '@testing-library/react-native';
import LoginModal from '@/components/Login/LoginModal';
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

describe('LoginModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = null;
    mockError = null;
    mockSignIn.mockResolvedValue(undefined);
  });

  it('renders custom session-expired title and closes only via onClose (no router)', () => {
    const onClose = jest.fn();
    const { rerender } = render(
      <LoginModal
        visible
        onClose={onClose}
        title="Session expired"
        subtitle="Sign in again to continue. You will stay on this screen after signing in."
      />
    );

    expect(screen.getByText('Session expired')).toBeTruthy();
    fireEvent.press(screen.getByText('Sign in with Google'));
    mockUser = { id: '1' };
    rerender(
      <LoginModal
        visible
        onClose={onClose}
        title="Session expired"
        subtitle="Sign in again to continue. You will stay on this screen after signing in."
      />
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('does not close when Google sign-in is pressed', () => {
    const onClose = jest.fn();
    render(<LoginModal visible onClose={onClose} />);

    fireEvent.press(screen.getByText('Sign in with Google'));
    expect(mockSignIn).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId('login-modal')).toBeTruthy();
  });

  it('shows loading and blocks Cancel / backdrop while signing in', async () => {
    let resolveSignIn: (() => void) | undefined;
    mockSignIn.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSignIn = resolve;
        })
    );
    const onClose = jest.fn();
    render(<LoginModal visible onClose={onClose} />);

    fireEvent.press(screen.getByText('Sign in with Google'));
    expect(screen.getByTestId('login-google-button-loading')).toBeTruthy();

    fireEvent.press(screen.getByTestId('login-modal-cancel'));
    fireEvent.press(screen.getByTestId('login-modal-backdrop'));
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => {
      resolveSignIn?.();
    });
  });

  it('closes on auth success', async () => {
    const onClose = jest.fn();
    const { rerender } = render(<LoginModal visible onClose={onClose} />);

    fireEvent.press(screen.getByText('Sign in with Google'));
    mockUser = { id: '1' };
    rerender(<LoginModal visible onClose={onClose} />);

    expect(onClose).toHaveBeenCalled();
  });

  it('clears signingIn on OAuth error and keeps modal open', async () => {
    mockSignIn.mockRejectedValue(new Error(GOOGLE_SIGN_IN_CANCEL_MESSAGE));
    const onClose = jest.fn();
    render(<LoginModal visible onClose={onClose} />);

    await act(async () => {
      fireEvent.press(screen.getByText('Sign in with Google'));
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('Sign in with Google')).toBeTruthy();
    expect(screen.queryByTestId('login-google-button-loading')).toBeNull();
  });

  it('stays open on 404/422 auth errors and Cancel still dismisses when idle', async () => {
    mockError = new ApiError(
      404,
      'No player account found for this Google account. Ask an organizer to add your login email, then try again.'
    );
    mockSignIn.mockRejectedValue(mockError);
    const onClose = jest.fn();
    const { rerender } = render(<LoginModal visible onClose={onClose} />);

    await act(async () => {
      fireEvent.press(screen.getByText('Sign in with Google'));
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId('login-modal')).toBeTruthy();

    mockError = new ApiError(
      422,
      "This Google email isn't verified yet. Verify it in your Google account, then try again."
    );
    rerender(<LoginModal visible onClose={onClose} />);
    expect(screen.getByTestId('login-modal')).toBeTruthy();

    fireEvent.press(screen.getByTestId('login-modal-cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
