import { waitFor } from '@testing-library/react-native';
import { useEligibilityGate } from '@/services/hooks/useEligibility';
import { renderHookWithQueryClient } from '@/testing/renderWithQueryClient';
import { disposeTestQueryClient } from '@/testing/createTestQueryClient';

let mockUser: { id: string } | null = null;
jest.mock('@/context/auth', () => ({
  useAuth: () => ({ user: mockUser, isLoading: false }),
}));

jest.mock('@/services/eligibility', () => ({
  fetchEligibilityStatus: jest.fn(),
  fetchEligibilityLatest: jest.fn(),
  fetchEligibilityApproved: jest.fn(),
}));

import {
  fetchEligibilityApproved,
  fetchEligibilityStatus,
} from '@/services/eligibility';

const statusMock = fetchEligibilityStatus as jest.Mock;
const approvedMock = fetchEligibilityApproved as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = { id: '1' };
});

describe('useEligibilityGate', () => {
  it('makes no requests for guests', async () => {
    mockUser = null;
    const { result, client } = renderHookWithQueryClient(() =>
      useEligibilityGate()
    );
    expect(statusMock).not.toHaveBeenCalled();
    expect(approvedMock).not.toHaveBeenCalled();
    expect(result.current.isApproved).toBe(false);
    await disposeTestQueryClient(client);
  });

  it('makes no requests when disabled', async () => {
    const { result, client } = renderHookWithQueryClient(() =>
      useEligibilityGate(false)
    );
    expect(statusMock).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({ loading: false, isMissing: true });
    await disposeTestQueryClient(client);
  });

  it('reports approved when an approved record exists', async () => {
    const approved = { id_eligibility: 1, being_student: true };
    statusMock.mockResolvedValue({ latest: 'approved' });
    approvedMock.mockResolvedValue(approved);

    const { result, client } = renderHookWithQueryClient(() =>
      useEligibilityGate()
    );
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({
      isApproved: true,
      isPending: false,
      isMissing: false,
      approved,
    });
    await disposeTestQueryClient(client);
  });

  it('reports pending when only a pending record exists', async () => {
    statusMock.mockResolvedValue({ latest: 'pending' });
    approvedMock.mockResolvedValue(null);
    const { result, client } = renderHookWithQueryClient(() =>
      useEligibilityGate()
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({ isPending: true, isMissing: false });
    await disposeTestQueryClient(client);
  });

  it('reports missing when nothing was submitted', async () => {
    statusMock.mockResolvedValue({ latest: null });
    approvedMock.mockResolvedValue(null);
    const { result, client } = renderHookWithQueryClient(() =>
      useEligibilityGate()
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({ isMissing: true, isApproved: false });
    await disposeTestQueryClient(client);
  });
});
