import { act, waitFor } from '@testing-library/react-native';
import {
  useIdentities,
  useLinkGoogleIdentityMutation,
  useUnlinkIdentityMutation,
} from '@/services/hooks/useIdentities';
import { renderHookWithQueryClient } from '@/testing/renderWithQueryClient';
import { disposeTestQueryClient } from '@/testing/createTestQueryClient';
import { makeGoogleIdentity } from '@/testing/fixtures';
import { queryKeys } from '@/lib/queryClient';

let mockUser: { id: string } | null = null;
jest.mock('@/context/auth', () => ({
  useAuth: () => ({ user: mockUser, isLoading: false }),
}));

jest.mock('@/services/identities', () => ({
  fetchIdentities: jest.fn(),
  linkGoogleIdentity: jest.fn(),
  unlinkIdentity: jest.fn(),
}));

import {
  fetchIdentities,
  linkGoogleIdentity,
  unlinkIdentity,
} from '@/services/identities';

const fetchIdentitiesMock = fetchIdentities as jest.MockedFunction<typeof fetchIdentities>;
const linkGoogleIdentityMock = linkGoogleIdentity as jest.MockedFunction<typeof linkGoogleIdentity>;
const unlinkIdentityMock = unlinkIdentity as jest.MockedFunction<typeof unlinkIdentity>;

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = null;
});

describe('useIdentities', () => {
  it('does not fetch for guests', async () => {
    const { result, client } = renderHookWithQueryClient(() => useIdentities());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchIdentitiesMock).not.toHaveBeenCalled();
    await disposeTestQueryClient(client);
  });

  it('scopes identity list by viewer', async () => {
    mockUser = { id: '9' };
    fetchIdentitiesMock.mockResolvedValue([makeGoogleIdentity()]);
    const { result, client } = renderHookWithQueryClient(() => useIdentities());

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(client.getQueryData(queryKeys.identities.list('9'))).toHaveLength(1);
    await disposeTestQueryClient(client);
  });
});

describe('identity mutations', () => {
  it('invalidates viewer identities after link', async () => {
    mockUser = { id: '3' };
    linkGoogleIdentityMock.mockResolvedValue({
      identity: makeGoogleIdentity(),
      result_code: 'linked',
    });

    const { result, client } = renderHookWithQueryClient(() =>
      useLinkGoogleIdentityMutation()
    );

    const invalidateSpy = jest.spyOn(client, 'invalidateQueries');

    await act(async () => {
      await result.current.mutateAsync('token');
    });

    expect(linkGoogleIdentityMock).toHaveBeenCalledWith('token');
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.identities.all('3'),
    });
    await disposeTestQueryClient(client);
  });

  it('invalidates viewer identities after unlink', async () => {
    mockUser = { id: '3' };
    unlinkIdentityMock.mockResolvedValue(null);

    const { result, client } = renderHookWithQueryClient(() =>
      useUnlinkIdentityMutation()
    );

    const invalidateSpy = jest.spyOn(client, 'invalidateQueries');

    await act(async () => {
      await result.current.mutateAsync(10);
    });

    expect(unlinkIdentityMock).toHaveBeenCalledWith(10);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.identities.all('3'),
    });
    await disposeTestQueryClient(client);
  });
});
