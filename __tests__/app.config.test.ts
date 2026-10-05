describe('app.config Android intent host', () => {
  const prev = process.env.EXPO_PUBLIC_BASE_URL;

  afterEach(() => {
    if (prev === undefined) {
      delete process.env.EXPO_PUBLIC_BASE_URL;
    } else {
      process.env.EXPO_PUBLIC_BASE_URL = prev;
    }
    jest.resetModules();
  });

  it('uses host event for padeliz scheme', () => {
    process.env.EXPO_PUBLIC_BASE_URL = 'https://app.example.test';
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const config = require('../app.config.js') as {
      expo: {
        android: {
          intentFilters: Array<{
            data: Array<{ scheme?: string; host?: string }>;
          }>;
        };
      };
    };
    const data = config.expo.android.intentFilters[0].data[0];
    expect(data.scheme).toBe('padeliz');
    expect(data.host).toBe('event');
  });
});
