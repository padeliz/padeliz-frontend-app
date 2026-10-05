/**
 * Open a hosted payment page URL.
 *
 * Web: Expo Linking assigns `window.location` (same-document navigation). That is the
 * correct pattern for hosted checkout; React Native's Linking uses `window.open('_blank')`
 * on web, which Chrome blocks after an async payment-start request.
 *
 * Native: Expo WebBrowser keeps the session in an in-app browser and resolves when closed.
 */
import { Platform } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

export type OpenPaymentUrlResult =
  | { platform: 'web'; navigated: true }
  | { platform: 'native'; result: WebBrowser.WebBrowserResult };

export async function openPaymentUrl(url: string): Promise<OpenPaymentUrlResult> {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new Error('Payment page URL is missing.');
  }

  if (Platform.OS === 'web') {
    await ExpoLinking.openURL(trimmed);
    return { platform: 'web', navigated: true };
  }

  const result = await WebBrowser.openBrowserAsync(trimmed);
  return { platform: 'native', result };
}
