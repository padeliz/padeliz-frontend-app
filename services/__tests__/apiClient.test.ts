import { apiDelete, setTokenGetter } from '@/services/apiClient';
import { API_URL } from '@/utils/constants';

const fetchMock = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = fetchMock as unknown as typeof fetch;
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => JSON.stringify({ success: true, message: 'ok', data: { id: 1 } }),
  });
  setTokenGetter(() => 'test-token');
});

describe('apiDelete', () => {
  // Cancelling a registration needs `{cancel_reason}` in the DELETE body, which the
  // client did not support before.
  it('serializes a JSON body and sets the content type', async () => {
    await apiDelete('/app/event-registrations/501', {
      cancel_reason: 'travel_issue',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_URL}/app/event-registrations/501`);
    expect(init.method).toBe('DELETE');
    expect(init.body).toBe(JSON.stringify({ cancel_reason: 'travel_issue' }));
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.headers.Authorization).toBe('Bearer test-token');
  });

  it('sends no body when none is given', async () => {
    await apiDelete('/app/my/level-assessment/pending/profile-image/3');

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBeUndefined();
    expect(init.headers['Content-Type']).toBeUndefined();
  });

  it('unwraps the success envelope', async () => {
    await expect(apiDelete('/app/device-tokens', { token: 'abc' })).resolves.toEqual({
      id: 1,
    });
  });
});
