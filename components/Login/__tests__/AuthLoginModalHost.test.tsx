import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AuthLoginModalHost from '@/components/Login/AuthLoginModalHost';

const mockCloseLoginModal = jest.fn();

jest.mock('@/context/auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/Login/LoginOptions', () => {
  const { View } = require('react-native');
  return function MockLoginOptions() {
    return <View testID="login-options" />;
  };
});

import { useAuth } from '@/context/auth';

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('AuthLoginModalHost', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses default LoginModal copy for gate reason', () => {
    mockedUseAuth.mockReturnValue({
      loginModalVisible: true,
      loginModalReason: 'gate',
      closeLoginModal: mockCloseLoginModal,
    } as ReturnType<typeof useAuth>);

    render(<AuthLoginModalHost />);

    expect(screen.getByTestId('login-modal')).toBeTruthy();
    expect(screen.getByText('Sign in to continue')).toBeTruthy();
    expect(
      screen.getByText(
        'Sign in with Google to register for events, track payments, and manage your account.',
      ),
    ).toBeTruthy();
  });

  it('maps session reason to Session expired copy', () => {
    mockedUseAuth.mockReturnValue({
      loginModalVisible: true,
      loginModalReason: 'session',
      closeLoginModal: mockCloseLoginModal,
    } as ReturnType<typeof useAuth>);

    render(<AuthLoginModalHost />);

    expect(screen.getByText('Session expired')).toBeTruthy();
    expect(
      screen.getByText(
        'Sign in again to continue. You will stay on this screen after signing in.',
      ),
    ).toBeTruthy();
  });

  it('hides the modal when not visible', () => {
    mockedUseAuth.mockReturnValue({
      loginModalVisible: false,
      loginModalReason: 'gate',
      closeLoginModal: mockCloseLoginModal,
    } as ReturnType<typeof useAuth>);

    render(<AuthLoginModalHost />);

    expect(screen.queryByTestId('login-modal')).toBeNull();
  });
});
