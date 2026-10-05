import { waitFor } from '@testing-library/react-native';
import {
  useBankTransferSettings,
  useEventRegistration,
} from '@/services/hooks/useRegistrations';
import { renderHookWithQueryClient } from '@/testing/renderWithQueryClient';
import { disposeTestQueryClient } from '@/testing/createTestQueryClient';
import { EDITION_ID, makeRegistration } from '@/testing/fixtures';

let mockUser: { id: string } | null = null;
jest.mock('@/context/auth', () => ({
  useAuth: () => ({ user: mockUser, isLoading: false }),
}));

jest.mock('@/services/registration', () => ({
  ...jest.requireActual('@/services/registration'),
  fetchMyRegistrations: jest.fn(),
  fetchBankTransferSettings: jest.fn(),
}));

import {
  fetchBankTransferSettings,
  fetchMyRegistrations,
} from '@/services/registration';

const fetchMyRegistrationsMock = fetchMyRegistrations as jest.Mock;
const fetchBankMock = fetchBankTransferSettings as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = { id: '1' };
});

describe('useEventRegistration', () => {
  it('does not fetch without a user', async () => {
    mockUser = null;
    const { result, client } = renderHookWithQueryClient(() =>
      useEventRegistration(EDITION_ID)
    );
    expect(fetchMyRegistrationsMock).not.toHaveBeenCalled();
    expect(result.current.registrations).toEqual([]);
    expect(result.current.loading).toBe(false);
    await disposeTestQueryClient(client);
  });

  it('does not fetch when disabled', async () => {
    const { client } = renderHookWithQueryClient(() =>
      useEventRegistration(EDITION_ID, false)
    );
    expect(fetchMyRegistrationsMock).not.toHaveBeenCalled();
    await disposeTestQueryClient(client);
  });

  it('resolves active registrations for the event', async () => {
    const reg = makeRegistration();
    const cancelled = {
      ...makeRegistration(),
      id_registration: 999,
      lifecycle_status: 'cancelled',
    };
    fetchMyRegistrationsMock.mockResolvedValue([reg, cancelled]);

    const { result, client } = renderHookWithQueryClient(() =>
      useEventRegistration(EDITION_ID)
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchMyRegistrationsMock).toHaveBeenCalledWith(
      EDITION_ID,
      expect.any(AbortSignal)
    );
    expect(result.current.registrations).toEqual([reg]);
    expect(result.current.registration).toEqual(reg);
    await disposeTestQueryClient(client);
  });

  it('refetch re-queries the server', async () => {
    fetchMyRegistrationsMock.mockResolvedValue([]);
    const { result, client } = renderHookWithQueryClient(() =>
      useEventRegistration(EDITION_ID)
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    result.current.refetch();
    await waitFor(() =>
      expect(fetchMyRegistrationsMock).toHaveBeenCalledTimes(2)
    );
    await disposeTestQueryClient(client);
  });
});

describe('useBankTransferSettings', () => {
  it('skips the request until a checkout/registration key exists', async () => {
    const { client } = renderHookWithQueryClient(() =>
      useBankTransferSettings(null, true)
    );
    expect(fetchBankMock).not.toHaveBeenCalled();
    await disposeTestQueryClient(client);
  });

  it('skips the request when disabled', async () => {
    const { client } = renderHookWithQueryClient(() =>
      useBankTransferSettings(5, false)
    );
    expect(fetchBankMock).not.toHaveBeenCalled();
    await disposeTestQueryClient(client);
  });

  it('loads settings by checkout id', async () => {
    const settings = { iban: 'RO00', beneficiary: 'Padeliz' };
    fetchBankMock.mockResolvedValue(settings);
    const { result, client } = renderHookWithQueryClient(() =>
      useBankTransferSettings({ checkoutId: 5, registrationId: null })
    );
    await waitFor(() => expect(result.current.data).toEqual(settings));
    expect(fetchBankMock).toHaveBeenCalledWith(
      { checkoutId: 5, registrationId: null },
      expect.any(AbortSignal)
    );
    await disposeTestQueryClient(client);
  });
});
