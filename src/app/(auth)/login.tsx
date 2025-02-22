import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { spacing } from '@/theme/spacing';
import { useAuth } from '@/context/auth/AuthContext';
import { googleAuth } from '@/services/auth/google';
import { useToast } from '@/context/toast/ToastContext';

export default function LoginScreen() {
  const router = useRouter();
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const [request, response, promptAsync] = googleAuth.useGoogleAuth();

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSignIn(response.authentication?.accessToken);
    } else if (response?.type === 'error') {
      showToast('Failed to sign in with Google', 'error');
      router.replace('/welcome');
    }
  }, [response]);

  const handleGoogleSignIn = async (accessToken?: string) => {
    if (!accessToken) {
      showToast('Failed to get access token', 'error');
      router.replace('/welcome');
      return;
    }

    try {
      const userInfo = await googleAuth.getUserInfo(accessToken);
      await signIn(userInfo);
      router.replace(redirectTo || '/upcoming-events');
    } catch (error) {
      console.error('Login error:', error);
      showToast('Failed to get user info', 'error');
      router.replace('/welcome');
    }
  };

  useEffect(() => {
    if (request) {
      promptAsync();
    }
  }, [request]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>Signing in with Google...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: spacing.md,
  },
});
