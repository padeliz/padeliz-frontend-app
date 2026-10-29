describe('app.config identity', () => {
  const prev = process.env.EXPO_PUBLIC_BASE_URL;
  const PLAYER_PROJECT_ID = '68e596b3-81bb-41db-8b07-9b237adeba03';
  const MANAGER_PROJECT_ID = 'a6ab7b60-0498-49f4-84d6-f8d9089592ce';

  afterEach(() => {
    if (prev === undefined) {
      delete process.env.EXPO_PUBLIC_BASE_URL;
    } else {
      process.env.EXPO_PUBLIC_BASE_URL = prev;
    }
    jest.resetModules();
  });

  function loadConfig() {
    process.env.EXPO_PUBLIC_BASE_URL = 'https://app.example.test';
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../app.config.js') as {
      expo: {
        name: string;
        slug: string;
        scheme: string;
        ios: { bundleIdentifier: string };
        android: {
          package: string;
          intentFilters: Array<{
            data: Array<{ scheme?: string; host?: string }>;
          }>;
        };
        extra: { eas: { projectId: string } };
      };
    };
  }

  it('uses Padeliz App identity and padeliz-app scheme', () => {
    const config = loadConfig();
    expect(config.expo.name).toBe('Padeliz App');
    expect(config.expo.slug).toBe('padeliz-app');
    expect(config.expo.scheme).toBe('padeliz-app');
    expect(config.expo.ios.bundleIdentifier).toBe('com.padeliz.app');
    expect(config.expo.android.package).toBe('com.padeliz.app');
    expect(config.expo.extra.eas.projectId).toBe(PLAYER_PROJECT_ID);
    expect(config.expo.extra.eas.projectId).not.toBe(MANAGER_PROJECT_ID);

    const data = config.expo.android.intentFilters[0].data[0];
    expect(data.scheme).toBe('padeliz-app');
    expect(data.host).toBe('event');
  });
});
