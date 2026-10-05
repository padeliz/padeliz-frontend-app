import { Platform } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { openPaymentUrl } from '@/services/openPaymentUrl';

jest.mock('expo-linking', () => ({
  openURL: jest.fn(async () => undefined),
}));

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(async () => ({ type: 'dismiss' })),
}));

describe('openPaymentUrl', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    jest.clearAllMocks();
  });

  it('rejects an empty URL', async () => {
    await expect(openPaymentUrl('   ')).rejects.toThrow('Payment page URL is missing.');
    expect(ExpoLinking.openURL).not.toHaveBeenCalled();
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

  it('uses Expo Linking same-document navigation on web', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    await expect(
      openPaymentUrl('https://secure-sandbox.netopia-payments.com/ui/card?p=abc')
    ).resolves.toEqual({ platform: 'web', navigated: true });

    expect(ExpoLinking.openURL).toHaveBeenCalledWith(
      'https://secure-sandbox.netopia-payments.com/ui/card?p=abc'
    );
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

  it('uses WebBrowser on native', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });

    await expect(
      openPaymentUrl('https://secure-sandbox.netopia-payments.com/ui/card?p=abc')
    ).resolves.toEqual({
      platform: 'native',
      result: { type: 'dismiss' },
    });

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://secure-sandbox.netopia-payments.com/ui/card?p=abc'
    );
    expect(ExpoLinking.openURL).not.toHaveBeenCalled();
  });
});
