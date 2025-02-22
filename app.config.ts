import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Padel Events App',
  slug: 'padel-events-app',
  owner: 'arsh.padel.minitour',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/logo.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/images/backgrounds/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.padelevents.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/icons/adaptive-icon.png',
      backgroundColor: '#FFFFFF'
    },
    package: 'com.padelevents.app'
  },
  scheme: 'padelevents',
  experiments: {
    tsconfigPaths: true,
  },
  plugins: [
    'expo-router',
    'expo-calendar'
  ],
  extra: {
    router: {
      origin: false
    },
    eas: {
      projectId: '92811acd-121b-49e2-8887-ed1a724aea9f'
    },
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  },
});
