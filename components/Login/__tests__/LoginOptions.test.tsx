import React from 'react';
import { fireEvent, render, screen, act } from '@testing-library/react-native';
import LoginOptions from '@/components/Login/LoginOptions';

const mockSignIn = jest.fn();
let mockUser: { id: string } | null = null;
let mockError: Error | null = null;

jest.mock('@/context/auth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    user: mockUser,
    error: mockError,
    isLoading: false,
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
      rejectSignIn?.(new Error('Google sign-in was cancelled'));
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
});
