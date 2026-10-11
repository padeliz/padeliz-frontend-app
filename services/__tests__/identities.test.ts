import { setAvatarPrimaryIdentity } from '@/services/identities';
import { makeGoogleIdentity } from '@/testing/fixtures';

const mockPost = jest.fn();
jest.mock('@/services/apiClient', () => ({
  apiGetEnvelope: jest.fn(),
  apiPost: (...args: unknown[]) => mockPost(...args),
  apiDelete: jest.fn(),
}));

describe('setAvatarPrimaryIdentity', () => {
  it('POSTs to the avatar-primary endpoint and returns the identity', async () => {
    const identity = makeGoogleIdentity({ id_user_identity: 12, is_avatar_primary: true });
    mockPost.mockResolvedValue(identity);

    await expect(setAvatarPrimaryIdentity(12)).resolves.toEqual(identity);
    expect(mockPost).toHaveBeenCalledWith('/app/auth/identities/12/avatar-primary');
  });
});
