import {
  MAX_STUDENT_PROOF_FILES,
  addStudentProofFile,
  createStudentProof,
  discardStudentProof,
  markStudentProofReady,
  removeStudentProofFile,
  reopenStudentProof,
  studentUntilError,
  updateStudentProofDate,
} from '@/services/studentProofs';

const mockUpload = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();
const mockPost = jest.fn();
jest.mock('@/services/apiClient', () => ({
  apiGetEnvelope: jest.fn(),
  apiPost: (...args: unknown[]) => mockPost(...args),
  apiPatch: (...args: unknown[]) => mockPatch(...args),
  apiDelete: (...args: unknown[]) => mockDelete(...args),
  apiUpload: (...args: unknown[]) => mockUpload(...args),
}));

type Part = { fieldName: string; value: unknown };

/** FormData is opaque in the jest runtime, so record what gets appended to each instance. */
const recorded = new Map<FormData, Part[]>();

function parts(form: FormData): Part[] {
  return recorded.get(form) ?? [];
}

function fileUri(part: Part): unknown {
  return (part.value as { uri?: unknown }).uri;
}

beforeAll(() => {
  const original = FormData.prototype.append;
  jest.spyOn(FormData.prototype, 'append').mockImplementation(function (
    this: FormData,
    name: string,
    value: unknown,
    ...rest: unknown[]
  ) {
    const list = recorded.get(this) ?? [];
    list.push({ fieldName: name, value });
    recorded.set(this, list);
    return (original as (...args: unknown[]) => void).call(this, name, value, ...rest);
  } as never);
});

afterAll(() => jest.restoreAllMocks());

beforeEach(() => jest.clearAllMocks());

describe('studentUntilError', () => {
  const now = new Date(2026, 9, 7);

  it('accepts today and future dates', () => {
    expect(studentUntilError('2026-10-07', now)).toBeNull();
    expect(studentUntilError('2027-06-30', now)).toBeNull();
  });

  it('rejects past, malformed and impossible dates', () => {
    expect(studentUntilError('2026-10-06', now)).toMatch(/past/i);
    expect(studentUntilError('30/06/2027', now)).toMatch(/YYYY-MM-DD/);
    expect(studentUntilError('2027-02-31', now)).toMatch(/valid/i);
  });
});

describe('student proof API client', () => {
  it('caps a proof at three files', () => {
    expect(MAX_STUDENT_PROOF_FILES).toBe(3);
  });

  it.each([1, 2, 3])('create posts student_until and %i files[] parts', async (count) => {
    const files = Array.from({ length: count }, (_, i) => ({ uri: `file:///tmp/id-${i}.png` }));

    await createStudentProof({ files, studentUntil: '2027-06-30' });

    const [path, form] = mockUpload.mock.calls[0];
    expect(path).toBe('/app/my/student-proofs');
    expect(form).toBeInstanceOf(FormData);
    const sent = parts(form);
    expect(sent.filter((p) => p.fieldName === 'student_until').map((p) => p.value)).toEqual([
      '2027-06-30',
    ]);
    const fileParts = sent.filter((p) => p.fieldName === 'files[]');
    expect(fileParts).toHaveLength(count);
    expect(fileParts.map(fileUri)).toEqual(files.map((f) => f.uri));
    expect(sent.some((p) => p.fieldName === 'file')).toBe(false);
  });

  it('updates only the date with PATCH pending', async () => {
    await updateStudentProofDate('2027-09-01');

    expect(mockPatch).toHaveBeenCalledWith('/app/my/student-proofs/pending', {
      student_until: '2027-09-01',
    });
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('appends one file with a multipart `file` part', async () => {
    await addStudentProofFile({ uri: 'file:///tmp/extra.png' });

    const [path, form] = mockUpload.mock.calls[0];
    expect(path).toBe('/app/my/student-proofs/pending/files');
    const sent = parts(form);
    expect(sent).toHaveLength(1);
    expect(sent[0].fieldName).toBe('file');
    expect(fileUri(sent[0])).toBe('file:///tmp/extra.png');
  });

  it('deletes a single file by id', async () => {
    await removeStudentProofFile(77);

    expect(mockDelete).toHaveBeenCalledWith('/app/my/student-proofs/pending/files/77');
  });

  it('marks ready, reopens and discards through their endpoints', async () => {
    await markStudentProofReady();
    await reopenStudentProof();
    await discardStudentProof();

    expect(mockPost).toHaveBeenNthCalledWith(1, '/app/my/student-proofs/pending/ready', {});
    expect(mockPost).toHaveBeenNthCalledWith(2, '/app/my/student-proofs/pending/reopen', {});
    expect(mockPost).toHaveBeenNthCalledWith(3, '/app/my/student-proofs/discard', {});
  });
});
