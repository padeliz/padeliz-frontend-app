import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/context/auth/AuthContext';
import { type ReactNode } from 'react';

const PROTECTED_ROUTES = [
  'register-check',
  'register',
  'payment-confirmation',
  'eligibility',
];

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const currentRoute = segments[segments.length - 1];
    const requiresAuth = PROTECTED_ROUTES.some(route => currentRoute?.startsWith(route));

    if (!isAuthenticated && requiresAuth) {
      // Redirect to login only when trying to access protected routes
      router.push('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated and trying to access auth pages
      router.replace('/upcoming-events');
    }
  }, [isAuthenticated, segments]);

  return <>{children}</>;
}
