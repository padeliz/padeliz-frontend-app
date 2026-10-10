import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { renderWithQueryClient } from '@/testing/renderWithQueryClient';
import { disposeTestQueryClient } from '@/testing/createTestQueryClient';
import StudentProofScreen from '@/app/student-proof';
import { makeStudentProof, makeStudentProofFile } from '@/testing/fixtures';
import type { StudentProofsIndex } from '@/types/api';

jest.mock('expo-router', () =>
  require('@/testing/expoRouterMock').createExpoRouterMock({
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  })
);

let mockIndex: StudentProofsIndex = { has_active: false, pending: null, items: [] };
const mockRefetch = jest.fn();
const mockCreate = jest.fn(async (_input: unknown) => undefined);
const mockUpdateDate = jest.fn(async (_date: unknown) => undefined);
const mockAddFile = jest.fn(async (_file: unknown) => undefined);
const mockRemoveFile = jest.fn(async (_id: unknown) => undefined);
const mockReady = jest.fn(async () => undefined);
const mockReopen = jest.fn(async () => undefined);
const mockDiscard = jest.fn(async () => undefined);
let mockAddFilePending = false;

jest.mock('@/services/hooks/useStudentProofs', () => ({
  useStudentProofs: () => ({
    data: mockIndex,
    loading: false,
    error: null,
    refetch: mockRefetch,
  }),
  useCreateStudentProofMutation: () => ({ mutateAsync: mockCreate, isPending: false }),
  useUpdateStudentProofDateMutation: () => ({ mutateAsync: mockUpdateDate, isPending: false }),
  useAddStudentProofFileMutation: () => ({
    mutateAsync: mockAddFile,
    get isPending() {
      return mockAddFilePending;
    },
  }),
  useRemoveStudentProofFileMutation: () => ({ mutateAsync: mockRemoveFile, isPending: false }),
  useMarkStudentProofReadyMutation: () => ({ mutateAsync: mockReady, isPending: false }),
  useReopenStudentProofMutation: () => ({ mutateAsync: mockReopen, isPending: false }),
  useDiscardStudentProofMutation: () => ({ mutateAsync: mockDiscard, isPending: false }),
}));

function renderScreen() {
  const result = renderWithQueryClient(<StudentProofScreen />);
  testClient = result.client;
  return result;
}

async function pickFile(uri = 'file:///tmp/id.png') {
  (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
    canceled: false,
    assets: [{ uri }],
  });
  const before = (ImagePicker.launchImageLibraryAsync as jest.Mock).mock.calls.length;
  fireEvent.press(screen.getByTestId('student-proof-add-file'));
  await waitFor(() =>
    expect((ImagePicker.launchImageLibraryAsync as jest.Mock).mock.calls.length).toBe(before + 1)
  );
}

function pendingWithFiles(count: number, overrides: Parameters<typeof makeStudentProof>[0] = {}) {
  return makeStudentProof({
    files: Array.from({ length: count }, (_, i) =>
      makeStudentProofFile({ id_player_student_proof_file: 101 + i, sort_order: i })
    ),
    ...overrides,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockIndex = { has_active: false, pending: null, items: [] };
  mockAddFilePending = false;
});
let testClient: ReturnType<typeof renderWithQueryClient>['client'] | null = null;
afterEach(async () => {
  if (testClient) await disposeTestQueryClient(testClient);
  testClient = null;
});

describe('Student proof screen — creating', () => {
  it('requires at least one file and a valid student_until', async () => {
    renderScreen();

    fireEvent.press(screen.getByTestId('student-proof-submit'));

    await screen.findByTestId('student-proof-file-error');
    expect(screen.getByTestId('student-until-error')).toBeTruthy();
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockReady).not.toHaveBeenCalled();
  });

  it('blocks create when the date is valid but no file was added', async () => {
    renderScreen();
    fireEvent.changeText(screen.getByTestId('student-until-input'), '2099-06-30');

    fireEvent.press(screen.getByTestId('student-proof-submit'));

    await screen.findByTestId('student-proof-file-error');
    expect(screen.queryByTestId('student-until-error')).toBeNull();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('blocks create when a file is picked but the date is missing', async () => {
    renderScreen();
    await pickFile();

    fireEvent.press(screen.getByTestId('student-proof-submit'));

    await screen.findByTestId('student-until-error');
    expect(screen.queryByTestId('student-proof-file-error')).toBeNull();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('rejects a past date', async () => {
    renderScreen();
    await pickFile();

    fireEvent.changeText(screen.getByTestId('student-until-input'), '2020-01-01');
    fireEvent.press(screen.getByTestId('student-proof-submit'));

    await screen.findByTestId('student-until-error');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('offers up to three slots and hides the add slot at the maximum', async () => {
    renderScreen();

    expect(screen.getByText('Student ID photos (0/3)')).toBeTruthy();
    await pickFile('file:///tmp/a.png');
    await pickFile('file:///tmp/b.png');
    expect(screen.getByText('Student ID photos (2/3)')).toBeTruthy();
    expect(screen.getByTestId('student-proof-add-file')).toBeTruthy();

    await pickFile('file:///tmp/c.png');

    expect(screen.getByText('Student ID photos (3/3)')).toBeTruthy();
    expect(screen.getByTestId('student-proof-local-file-2')).toBeTruthy();
    expect(screen.queryByTestId('student-proof-add-file')).toBeNull();
    expect(screen.getByTestId('student-proof-max-files')).toBeTruthy();
  });

  it('removing a local pick frees a slot again', async () => {
    renderScreen();
    await pickFile('file:///tmp/a.png');
    await pickFile('file:///tmp/b.png');
    await pickFile('file:///tmp/c.png');
    expect(screen.queryByTestId('student-proof-add-file')).toBeNull();

    fireEvent.press(screen.getByTestId('student-proof-remove-local-1'));

    expect(screen.getByText('Student ID photos (2/3)')).toBeTruthy();
    expect(screen.getByTestId('student-proof-add-file')).toBeTruthy();
  });

  it('creates with files[] and student_until, then marks the proof ready', async () => {
    renderScreen();
    await pickFile('file:///tmp/front.png');
    await pickFile('file:///tmp/back.png');

    fireEvent.changeText(screen.getByTestId('student-until-input'), '2099-06-30');
    fireEvent.press(screen.getByTestId('student-proof-submit'));

    await waitFor(() => expect(mockReady).toHaveBeenCalledTimes(1));
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith({
      files: [{ uri: 'file:///tmp/front.png' }, { uri: 'file:///tmp/back.png' }],
      studentUntil: '2099-06-30',
    });
    expect(mockCreate.mock.invocationCallOrder[0]).toBeLessThan(
      mockReady.mock.invocationCallOrder[0]
    );
    expect(mockUpdateDate).not.toHaveBeenCalled();
    expect(await screen.findByText(/submitted for review/i)).toBeTruthy();
  });

  it('does not mark ready when create fails', async () => {
    mockCreate.mockRejectedValueOnce(new Error('boom'));
    renderScreen();
    await pickFile();
    fireEvent.changeText(screen.getByTestId('student-until-input'), '2099-06-30');

    fireEvent.press(screen.getByTestId('student-proof-submit'));

    expect(await screen.findByText(/something went wrong/i)).toBeTruthy();
    expect(mockReady).not.toHaveBeenCalled();
  });
});

describe('Student proof screen — editing a pending draft', () => {
  it('shows the saved files and appends a picked file through the API', async () => {
    mockIndex = { has_active: false, pending: pendingWithFiles(1), items: [] };
    renderScreen();

    expect(screen.getByText('Student ID photos (1/3)')).toBeTruthy();
    expect(screen.getByTestId('student-proof-file-101')).toBeTruthy();

    await pickFile('file:///tmp/second.png');

    await waitFor(() => expect(mockAddFile).toHaveBeenCalledTimes(1));
    expect(mockAddFile).toHaveBeenCalledWith({ uri: 'file:///tmp/second.png' });
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('hides the add slot when the draft already holds three files', () => {
    mockIndex = { has_active: false, pending: pendingWithFiles(3), items: [] };
    renderScreen();

    expect(screen.getByText('Student ID photos (3/3)')).toBeTruthy();
    expect(screen.queryByTestId('student-proof-add-file')).toBeNull();
    expect(screen.getByTestId('student-proof-max-files')).toBeTruthy();
  });

  it('shows an in-slot loader on the add-file control while uploading', () => {
    mockIndex = { has_active: false, pending: pendingWithFiles(1), items: [] };
    mockAddFilePending = true;
    renderScreen();

    expect(screen.getByTestId('student-proof-add-file-loading')).toBeTruthy();
  });

  it('deletes a saved file through the API', async () => {
    mockIndex = { has_active: false, pending: pendingWithFiles(2), items: [] };
    renderScreen();

    fireEvent.press(screen.getByTestId('student-proof-remove-file-102'));

    await waitFor(() => expect(mockRemoveFile).toHaveBeenCalledWith(102));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('marks an existing draft ready without re-uploading or patching an unchanged date', async () => {
    mockIndex = { has_active: false, pending: pendingWithFiles(1), items: [] };
    renderScreen();

    fireEvent.press(screen.getByTestId('student-proof-submit'));

    await waitFor(() => expect(mockReady).toHaveBeenCalledTimes(1));
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdateDate).not.toHaveBeenCalled();
  });

  it('patches the date before marking ready when it changed', async () => {
    mockIndex = { has_active: false, pending: pendingWithFiles(1), items: [] };
    renderScreen();

    fireEvent.changeText(screen.getByTestId('student-until-input'), '2099-12-31');
    fireEvent.press(screen.getByTestId('student-proof-submit'));

    await waitFor(() => expect(mockReady).toHaveBeenCalledTimes(1));
    expect(mockUpdateDate).toHaveBeenCalledWith('2099-12-31');
    expect(mockUpdateDate.mock.invocationCallOrder[0]).toBeLessThan(
      mockReady.mock.invocationCallOrder[0]
    );
  });

  it('blocks mark-ready when the draft has zero files', async () => {
    mockIndex = { has_active: false, pending: pendingWithFiles(0), items: [] };
    renderScreen();

    fireEvent.press(screen.getByTestId('student-proof-submit'));

    await screen.findByTestId('student-proof-file-error');
    expect(mockReady).not.toHaveBeenCalled();
    expect(mockUpdateDate).not.toHaveBeenCalled();
  });

  it('shows the server error when appending is rejected', async () => {
    mockAddFile.mockRejectedValueOnce(new Error('nope'));
    mockIndex = { has_active: false, pending: pendingWithFiles(1), items: [] };
    renderScreen();

    await pickFile();

    expect(await screen.findByText(/something went wrong/i)).toBeTruthy();
  });
});

describe('Student proof screen — locked, reopen, discard', () => {
  it('shows a locked view without append, delete or date edit when ready for review', async () => {
    mockIndex = {
      has_active: false,
      pending: pendingWithFiles(2, { ready_for_review: true }),
      items: [],
    };
    renderScreen();

    expect(screen.getByTestId('student-proof-locked')).toBeTruthy();
    expect(screen.getByTestId('student-proof-locked-file-101')).toBeTruthy();
    expect(screen.getByTestId('student-proof-locked-file-102')).toBeTruthy();
    expect(screen.queryByTestId('student-proof-form')).toBeNull();
    expect(screen.queryByTestId('student-proof-add-file')).toBeNull();
    expect(screen.queryByTestId('student-until-input')).toBeNull();
    expect(screen.queryByTestId('student-proof-remove-file-101')).toBeNull();
    expect(screen.queryByTestId('student-proof-submit')).toBeNull();

    fireEvent.press(screen.getByTestId('student-proof-reopen'));
    await waitFor(() => expect(mockReopen).toHaveBeenCalledTimes(1));
    expect(mockAddFile).not.toHaveBeenCalled();
    expect(mockRemoveFile).not.toHaveBeenCalled();
  });

  it('unlocks editing once the proof is reopened', () => {
    mockIndex = {
      has_active: false,
      pending: pendingWithFiles(2, { ready_for_review: false }),
      items: [],
    };
    renderScreen();

    expect(screen.queryByTestId('student-proof-locked')).toBeNull();
    expect(screen.getByTestId('student-proof-form')).toBeTruthy();
    expect(screen.getByTestId('student-until-input')).toBeTruthy();
    expect(screen.getByTestId('student-proof-remove-file-101')).toBeTruthy();
    expect(screen.getByTestId('student-proof-add-file')).toBeTruthy();
  });

  it('discards the draft from the form', async () => {
    mockIndex = { has_active: false, pending: pendingWithFiles(1), items: [] };
    renderScreen();

    fireEvent.press(screen.getByTestId('student-proof-discard'));

    await waitFor(() => expect(mockDiscard).toHaveBeenCalledTimes(1));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('discards a locked proof and then allows a brand-new create', async () => {
    mockIndex = {
      has_active: false,
      pending: pendingWithFiles(1, { ready_for_review: true }),
      items: [],
    };
    const { rerender } = renderScreen();

    fireEvent.press(screen.getByTestId('student-proof-discard'));
    await waitFor(() => expect(mockDiscard).toHaveBeenCalledTimes(1));

    // The refetch now reports no pending proof (the old one is discarded).
    mockIndex = {
      has_active: false,
      pending: null,
      items: [makeStudentProof({ review_status: 'discarded' })],
    };
    rerender(<StudentProofScreen />);

    expect(screen.queryByTestId('student-proof-locked')).toBeNull();
    expect(screen.getByText('Student ID photos (0/3)')).toBeTruthy();

    await pickFile('file:///tmp/new.png');
    fireEvent.changeText(screen.getByTestId('student-until-input'), '2099-06-30');
    fireEvent.press(screen.getByTestId('student-proof-submit'));

    await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
    expect(mockCreate).toHaveBeenCalledWith({
      files: [{ uri: 'file:///tmp/new.png' }],
      studentUntil: '2099-06-30',
    });
    await waitFor(() => expect(mockReady).toHaveBeenCalledTimes(1));
  });

  it('surfaces a rejection reason when there is no pending proof', () => {
    mockIndex = {
      has_active: false,
      pending: null,
      items: [makeStudentProof({ review_status: 'rejected', review_message: 'Blurry photo' })],
    };
    renderScreen();
    expect(screen.getByText(/Blurry photo/)).toBeTruthy();
  });
});
