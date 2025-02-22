import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { googleAuth } from '@/services/auth/google';
import { useProfile } from '@/hooks/api/useProfile';
import { useToast } from '@/context/toast/ToastContext';
import { spacing } from '@/theme/spacing';

export default function LinkAccountScreen() {
  const router = useRouter();
  const { linkGoogleAccount } = useProfile();
  const { showToast } = useToast();
  const [request, response, promptAsync] = googleAuth.useGoogleAuth();

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleLink(response.authentication?.accessToken);
    } else if (response?.type === 'error') {
      showToast('Failed to link Google account', 'error');
      router.back();
    }
  }, [response]);

  const handleGoogleLink = async (accessToken?: string) => {
    if (!accessToken) {
      showToast('Failed to get access token', 'error');
      router.back();
      return;
    }

    try {
      const userInfo = await googleAuth.getUserInfo(accessToken);
      await linkGoogleAccount(userInfo);
      showToast('Google account linked successfully', 'success');
      router.back();
    } catch (error) {
      console.error('Link account error:', error);
      showToast('Failed to link account', 'error');
      router.back();
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
      <Text style={styles.text}>Linking Google Account...</Text>
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
