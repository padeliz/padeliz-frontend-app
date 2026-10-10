import {
  createPendingAssessment,
  fetchCurrentLevel,
  fetchPendingAssessment,
  loadLatestOrCreateAssessment,
  markAssessmentReady,
  openOrCreatePendingAssessment,
  patchPendingAssessment,
  reopenAssessment,
  uploadAssessmentProfileImage,
} from '@/services/levelAssessment';
import { ApiError } from '@/services/apiError';
import { makeAssessment, makePlayerLevel } from '@/testing/fixtures';

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPatch = jest.fn();
const mockUpload = jest.fn();
const mockDelete = jest.fn();

jest.mock('@/services/apiClient', () => ({
  apiGetEnvelope: (...args: unknown[]) => mockGet(...args),
  apiPost: (...args: unknown[]) => mockPost(...args),
  apiPatch: (...args: unknown[]) => mockPatch(...args),
  apiUpload: (...args: unknown[]) => mockUpload(...args),
  apiDelete: (...args: unknown[]) => mockDelete(...args),
}));

beforeEach(() => jest.clearAllMocks());

describe('level assessment service', () => {
  it('opens the existing pending assessment without creating a new one', async () => {
    const pending = makeAssessment({ ready_for_review: true });
    mockGet.mockResolvedValue(pending);

    await expect(openOrCreatePendingAssessment()).resolves.toBe(pending);

    expect(mockGet).toHaveBeenCalledWith(
      '/app/my/level-assessment/pending',
      expect.anything()
    );
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('creates a new pending assessment when none exists (404)', async () => {
    const created = makeAssessment();
    mockGet.mockRejectedValue(new ApiError(404, 'No pending level assessment found'));
    mockPost.mockResolvedValue(created);

    await expect(openOrCreatePendingAssessment()).resolves.toBe(created);

    expect(mockPost).toHaveBeenCalledWith('/app/my/level-assessment/pending', {});
  });

  it('loads latest when present and creates only when latest is missing', async () => {
    const latest = makeAssessment({ review_status: 'approved' });
    mockGet.mockResolvedValueOnce(latest);
    await expect(loadLatestOrCreateAssessment()).resolves.toBe(latest);
    expect(mockPost).not.toHaveBeenCalled();

    mockGet.mockRejectedValueOnce(new ApiError(404, 'none'));
    const created = makeAssessment();
    mockPost.mockResolvedValueOnce(created);
    await expect(loadLatestOrCreateAssessment()).resolves.toBe(created);
    expect(mockGet).toHaveBeenCalledWith(
      '/app/my/level-assessment/latest',
      expect.anything()
    );
  });

  it('does not swallow non-404 errors when opening', async () => {
    mockGet.mockRejectedValue(new ApiError(500, 'boom'));
    await expect(openOrCreatePendingAssessment()).rejects.toThrow('boom');
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('maps 404 to null for pending and current-level reads', async () => {
    mockGet.mockRejectedValue(new ApiError(404, 'none'));
    await expect(fetchPendingAssessment()).resolves.toBeNull();
    await expect(fetchCurrentLevel()).resolves.toBeNull();
  });

  it('returns the current level when present', async () => {
    const level = makePlayerLevel();
    mockGet.mockResolvedValue(level);
    await expect(fetchCurrentLevel()).resolves.toBe(level);
  });

  it('writes answers under custom_fields', async () => {
    await createPendingAssessment({ year_of_birth: 1999 });
    expect(mockPost).toHaveBeenCalledWith('/app/my/level-assessment/pending', {
      custom_fields: { year_of_birth: 1999 },
    });

    await patchPendingAssessment({ playtomic_id: '1' });
    expect(mockPatch).toHaveBeenCalledWith('/app/my/level-assessment/pending', {
      custom_fields: { playtomic_id: '1' },
    });
  });

  it('marks ready and reopens via the pending endpoints', async () => {
    await markAssessmentReady();
    await reopenAssessment();
    expect(mockPost).toHaveBeenCalledWith('/app/my/level-assessment/pending/ready', {});
    expect(mockPost).toHaveBeenCalledWith('/app/my/level-assessment/pending/reopen', {});
  });

  it('uploads profile images under the image field', async () => {
    await uploadAssessmentProfileImage('file:///tmp/a.jpg', {
      name: 'a.jpg',
      type: 'image/jpeg',
    });
    const [path, form] = mockUpload.mock.calls[0];
    expect(path).toBe('/app/my/level-assessment/pending/profile-image');
    expect(form).toBeInstanceOf(FormData);
  });
});
