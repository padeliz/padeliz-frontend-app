import { Platform } from 'react-native';
import { surfaceShadow } from '../surfaceShadow';

describe('surfaceShadow', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalOS,
    });
  });

  function setOS(os: typeof Platform.OS) {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: os,
    });
  }

  it('returns elevation only on android', () => {
    setOS('android');
    expect(surfaceShadow(5, '0px 2px 10px rgba(0, 0, 0, 0.25)')).toEqual({
      elevation: 5,
    });
  });

  it('returns boxShadow and omits elevation on ios', () => {
    setOS('ios');
    expect(surfaceShadow(5, '0px 2px 10px rgba(0, 0, 0, 0.25)')).toEqual({
      boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.25)',
    });
  });

  it('returns boxShadow and omits elevation on web', () => {
    setOS('web');
    expect(surfaceShadow(10, '0px 0px 10px rgba(0, 0, 0, 0.25)')).toEqual({
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)',
    });
  });
});
