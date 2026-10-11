import { replaceFriends, searchPlayers } from '@/services/discovery';

const mockGet = jest.fn();
const mockRequest = jest.fn();
jest.mock('@/services/apiClient', () => ({
  apiGetEnvelope: (...args: unknown[]) => mockGet(...args),
  request: (...args: unknown[]) => mockRequest(...args),
}));

beforeEach(() => jest.clearAllMocks());

describe('discovery services', () => {
  it('searchPlayers GETs search-players with the trimmed query', async () => {
    const results = [
      { id_user: 5, name: 'Ana', email_masked: null, phone_masked: null, avatar_url: null },
    ];
    mockGet.mockResolvedValue(results);

    await expect(searchPlayers('  ana ')).resolves.toEqual(results);
    expect(mockGet).toHaveBeenCalledWith('/app/my/discovery/search-players', {
      query: { q: 'ana' },
      signal: undefined,
    });
  });

  it('replaceFriends PUTs rows including phone', async () => {
    mockRequest.mockResolvedValue(undefined);
    const friends = [{ friend_player_user_id: null, full_name: null, email: null, phone: '+40712000009' }];

    await replaceFriends(friends);
    expect(mockRequest).toHaveBeenCalledWith('/app/my/discovery/friends', {
      method: 'PUT',
      body: { friends },
    });
  });
});
