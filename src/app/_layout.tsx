import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { theme } from '../theme';
import { AuthProvider } from '@/context/auth/AuthContext';
import { ToastProvider } from '@/context/toast/ToastContext';
import { LoadingProvider } from '@/context/loading/LoadingContext';
import { EligibilityProvider } from '@/context/eligibility/EligibilityContext';
import { AuthGuard } from '@/components/common/AuthGuard';

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <LoadingProvider>
        <ToastProvider>
          <AuthProvider>
            <EligibilityProvider>
              <AuthGuard>
                <Stack>
                  <Stack.Screen
                    name="(auth)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(modals)"
                    options={{
                      presentation: 'modal',
                      headerStyle: {
                        backgroundColor: theme.colors.background,
                      },
                    }}
                  />
                  <Stack.Screen
                    name="(eligibility)"
                    options={{
                      headerStyle: {
                        backgroundColor: theme.colors.background,
                      },
                    }}
                  />
                </Stack>
              </AuthGuard>
            </EligibilityProvider>
          </AuthProvider>
        </ToastProvider>
      </LoadingProvider>
    </PaperProvider>
  );
}
