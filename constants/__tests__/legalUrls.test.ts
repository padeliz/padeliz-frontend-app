describe('legalUrls', () => {
  const original = process.env.EXPO_PUBLIC_LEGAL_SITE_URL;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.EXPO_PUBLIC_LEGAL_SITE_URL;
    } else {
      process.env.EXPO_PUBLIC_LEGAL_SITE_URL = original;
    }
    jest.resetModules();
  });

  it('throws when EXPO_PUBLIC_LEGAL_SITE_URL is unset', () => {
    delete process.env.EXPO_PUBLIC_LEGAL_SITE_URL;
    jest.resetModules();
    const { legalSiteBaseUrl } = require('../legalUrls');
    expect(() => legalSiteBaseUrl()).toThrow(/EXPO_PUBLIC_LEGAL_SITE_URL is required/);
  });

  it('uses EXPO_PUBLIC_LEGAL_SITE_URL without trailing slash', () => {
    process.env.EXPO_PUBLIC_LEGAL_SITE_URL = 'https://staging.padeliz.ro/';
    jest.resetModules();
    const { legalSiteBaseUrl, legalUrl } = require('../legalUrls');
    expect(legalSiteBaseUrl()).toBe('https://staging.padeliz.ro');
    expect(legalUrl('privacy')).toBe(
      'https://staging.padeliz.ro/privacy-policy.html',
    );
  });
});
