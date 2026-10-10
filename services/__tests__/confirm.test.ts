import { Alert, Platform } from 'react-native';
import { confirmAsync, confirmDirtyLeaveAsync } from '@/services/confirm';

describe('confirmAsync', () => {
  const originalOS = Platform.OS;
  const originalConfirm = typeof window !== 'undefined' ? window.confirm : undefined;

  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    if (typeof window !== 'undefined' && originalConfirm !== undefined) {
      window.confirm = originalConfirm;
    }
    jest.restoreAllMocks();
  });

  it('uses window.confirm on web and resolves true', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    window.confirm = jest.fn(() => true);

    await expect(confirmAsync('Title', 'Message')).resolves.toBe(true);

    expect(window.confirm).toHaveBeenCalledWith('Title\n\nMessage');
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('uses window.confirm on web and resolves false', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    window.confirm = jest.fn(() => false);

    await expect(confirmAsync('Title', 'Message')).resolves.toBe(false);

    expect(window.confirm).toHaveBeenCalledWith('Title\n\nMessage');
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('uses Alert.alert on native and resolves from Confirm', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    (Alert.alert as jest.Mock).mockImplementation((_title, _message, buttons) => {
      const confirm = buttons.find((b: { text: string }) => b.text === 'Confirm');
      confirm?.onPress?.();
    });

    await expect(confirmAsync('Title', 'Message')).resolves.toBe(true);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Title',
      'Message',
      expect.any(Array)
    );
  });

  it('uses Alert.alert on native and resolves from Cancel', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    (Alert.alert as jest.Mock).mockImplementation((_title, _message, buttons) => {
      const cancel = buttons.find((b: { text: string }) => b.text === 'Cancel');
      cancel?.onPress?.();
    });

    await expect(confirmAsync('Title', 'Message')).resolves.toBe(false);

    expect(Alert.alert).toHaveBeenCalled();
  });
});

describe('confirmDirtyLeaveAsync', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    ['Leave without saving', 'discard'],
    ['Save & leave', 'save'],
    ['Continue editing', 'stay'],
  ] as const)('resolves %s → %s', async (label, choice) => {
    (Alert.alert as jest.Mock).mockImplementation((_title, _message, buttons) => {
      const btn = buttons.find((b: { text: string }) => b.text === label);
      btn?.onPress?.();
    });

    await expect(confirmDirtyLeaveAsync()).resolves.toBe(choice);
  });
});

