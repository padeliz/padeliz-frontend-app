/**
 * Dynamic Expo config: router origin tracks EXPO_PUBLIC_BASE_URL so OAuth,
 * share links, and Expo Router share one public web origin per environment.
 */
function normalizeBaseUrl(raw) {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) {
    throw new Error(
      'EXPO_PUBLIC_BASE_URL is not set. Set it in .env.local (e.g. http://localhost:8081).'
    );
  }
  return trimmed.replace(/\/+$/, '');
}

const origin = normalizeBaseUrl(process.env.EXPO_PUBLIC_BASE_URL);

module.exports = {
  expo: {
    name: 'Padeliz App',
    slug: 'padeliz-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'padeliz-app',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.padeliz.app',
      usesAppleSignIn: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.padeliz.app',
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: false,
          data: [
            {
              scheme: 'padeliz-app',
              host: 'event',
              pathPrefix: '/',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    web: {
      bundler: 'metro',
      output: 'server',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      [
        'expo-router',
        {
          origin,
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      'expo-secure-store',
      'expo-apple-authentication',
      'expo-font',
      'expo-web-browser',
      'expo-notifications',
    ],
    experiments: {
      typedRoutes: true,
    },
    owner: 'padeliz',
    extra: {
      router: {
        origin,
      },
      eas: {
        projectId: '68e596b3-81bb-41db-8b07-9b237adeba03',
      },
      expoConfig: {},
    },
  },
};
