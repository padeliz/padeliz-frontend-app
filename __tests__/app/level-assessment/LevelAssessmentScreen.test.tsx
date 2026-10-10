import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithQueryClient } from '@/testing/renderWithQueryClient';
import { disposeTestQueryClient } from '@/testing/createTestQueryClient';
import LevelAssessmentScreen from '@/app/level-assessment';
import { makeAssessment, makePlayer } from '@/testing/fixtures';
import { mapPlayerToUser } from '@/services/authUser';
import { confirmAsync } from '@/services/confirm';
import type { Level, PlayerLevelAssessment } from '@/types/api';

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockCanGoBack = jest.fn(() => true);
let mockParams: Record<string, string> = {};
jest.mock('expo-router', () =>
  require('@/testing/expoRouterMock').createExpoRouterMock({
    useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: mockBack }),
    useNavigation: () => ({ canGoBack: mockCanGoBack }),
    useLocalSearchParams: () => mockParams,
  })
);

jest.mock('@/context/auth', () => ({
  useAuth: () => ({ user: mockUser }),
}));
let mockUser: ReturnType<typeof mapPlayerToUser> | null = mapPlayerToUser(makePlayer());

const mockLoad = jest.fn();
const mockCreate = jest.fn();
const mockSave = jest.fn();
const mockReady = jest.fn();
const mockReopen = jest.fn();
const mockDiscard = jest.fn();
const mockUpload = jest.fn();
const mockDelete = jest.fn();
let mockSavePending = false;
let mockUploadPending = false;
let mockDeletePending = false;
let mockDeleteVariables: number | undefined;
let mockLoadPending = false;

jest.mock('@/services/hooks/useLevelAssessment', () => ({
  useLoadAssessmentMutation: () => ({
    mutateAsync: mockLoad,
    get isPending() {
      return mockLoadPending;
    },
  }),
  useCreatePendingAssessmentMutation: () => ({ mutateAsync: mockCreate, isPending: false }),
  useSaveAssessmentMutation: () => ({
    mutateAsync: mockSave,
    get isPending() {
      return mockSavePending;
    },
  }),
  useMarkAssessmentReadyMutation: () => ({ mutateAsync: mockReady, isPending: false }),
  useReopenAssessmentMutation: () => ({ mutateAsync: mockReopen, isPending: false }),
  useDiscardAssessmentMutation: () => ({ mutateAsync: mockDiscard, isPending: false }),
  useUploadAssessmentImageMutation: () => ({
    mutateAsync: mockUpload,
    get isPending() {
      return mockUploadPending;
    },
  }),
  useDeleteAssessmentImageMutation: () => ({
    mutateAsync: mockDelete,
    get isPending() {
      return mockDeletePending;
    },
    get variables() {
      return mockDeleteVariables;
    },
  }),
}));

const mockLevels: Level[] = [
  { id_level: 12, name: 'Division 2 Mid', level_min: '2.66', level_max: '2.34' },
];
jest.mock('@/services/hooks/useLevels', () => ({
  useLevels: () => ({ data: mockLevels, loading: false, error: null, refetch: jest.fn() }),
}));

jest.mock('@/services/confirm', () => ({
  confirmAsync: jest.fn(async () => true),
  confirmDirtyLeaveAsync: jest.requireActual('@/services/confirm').confirmDirtyLeaveAsync,
}));

function renderScreen() {
  return (() => {
    const r = renderWithQueryClient(<LevelAssessmentScreen />);
    testClient = r.client;
    return r;
  })();
}

async function renderDraft(assessment: PlayerLevelAssessment = makeAssessment()) {
  mockLoad.mockResolvedValue(assessment);
  renderScreen();
  await screen.findByTestId('assessment-wizard');
}

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
  mockUser = mapPlayerToUser(makePlayer());
  mockCanGoBack.mockReturnValue(true);
  mockSavePending = false;
  mockUploadPending = false;
  mockDeletePending = false;
  mockDeleteVariables = undefined;
  mockLoadPending = false;
  mockSave.mockImplementation(async () => makeAssessment());
  mockReady.mockImplementation(async () => makeAssessment({ ready_for_review: true }));
  mockCreate.mockImplementation(async () => makeAssessment());
  mockReopen.mockImplementation(async () => makeAssessment());
  mockDiscard.mockImplementation(async () => undefined);
  (confirmAsync as jest.Mock).mockResolvedValue(true);
  jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
});
let testClient: ReturnType<typeof renderWithQueryClient>['client'] | null = null;
afterEach(async () => {
  if (testClient) await disposeTestQueryClient(testClient);
  testClient = null;
  jest.restoreAllMocks();
});

describe('Level assessment screen', () => {
  it('loads latest (or creates) exactly once', async () => {
    await renderDraft();
    expect(mockLoad).toHaveBeenCalledTimes(1);
  });

  it('opens editable drafts on Sports', async () => {
    await renderDraft();
    expect(screen.getByTestId('step-racket-experience')).toBeTruthy();
    expect(screen.getByTestId('step-forward')).toBeTruthy();
  });

  it('opens ready-for-review on Status without bottom StepNavButtons', async () => {
    mockLoad.mockResolvedValue(makeAssessment({ ready_for_review: true }));
    renderScreen();

    await screen.findByTestId('assessment-status');
    expect(screen.queryByTestId('step-forward')).toBeNull();
    expect(screen.getByTestId('assessment-reopen')).toBeTruthy();
  });

  it('reopens a ready assessment into an editable Sports step after confirm', async () => {
    mockLoad.mockResolvedValue(makeAssessment({ ready_for_review: true }));
    mockReopen.mockResolvedValue(makeAssessment());
    renderScreen();

    fireEvent.press(await screen.findByTestId('assessment-reopen'));

    await screen.findByTestId('step-racket-experience');
    expect(confirmAsync).toHaveBeenCalled();
    expect(mockReopen).toHaveBeenCalledTimes(1);
  });

  it('shows review_message for approved assessments and offers Create new', async () => {
    mockLoad.mockResolvedValue(
      makeAssessment({
        review_status: 'approved',
        ready_for_review: false,
        review_message: 'Welcome to Division 3',
      })
    );
    renderScreen();

    await screen.findByTestId('assessment-review-message');
    expect(screen.getByText('Welcome to Division 3')).toBeTruthy();
    expect(screen.getByTestId('assessment-create-new')).toBeTruthy();
    expect(screen.queryByTestId('assessment-reopen')).toBeNull();
  });

  it('hides review_message when pending/ready/discarded or empty', async () => {
    mockLoad.mockResolvedValue(
      makeAssessment({
        review_status: 'discarded',
        ready_for_review: false,
        review_message: 'Should stay hidden',
      })
    );
    renderScreen();
    await screen.findByTestId('assessment-status');
    expect(screen.queryByTestId('assessment-review-message')).toBeNull();
  });

  it('Create new assessment posts pending and opens Sports', async () => {
    mockLoad.mockResolvedValue(
      makeAssessment({ review_status: 'rejected', ready_for_review: false })
    );
    mockCreate.mockResolvedValue(makeAssessment());
    renderScreen();

    fireEvent.press(await screen.findByTestId('assessment-create-new'));
    await screen.findByTestId('step-racket-experience');
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('submits for review from Status after confirm (not bottom nav)', async () => {
    await renderDraft();
    fireEvent.press(screen.getByTestId('wizard-step-4'));
    await screen.findByTestId('assessment-submit-for-review');
    expect(screen.queryByTestId('step-forward')).toBeNull();

    fireEvent.press(screen.getByTestId('assessment-submit-for-review'));
    await waitFor(() => expect(mockReady).toHaveBeenCalledTimes(1));
    expect(confirmAsync).toHaveBeenCalled();
  });

  it('cancelling submit confirm does not call the API', async () => {
    (confirmAsync as jest.Mock).mockResolvedValueOnce(false);
    await renderDraft();
    fireEvent.press(screen.getByTestId('wizard-step-4'));
    fireEvent.press(await screen.findByTestId('assessment-submit-for-review'));
    await waitFor(() => expect(confirmAsync).toHaveBeenCalled());
    expect(mockReady).not.toHaveBeenCalled();
  });

  it('discards via the discard endpoint after confirm and leaves', async () => {
    await renderDraft();
    fireEvent.press(screen.getByTestId('wizard-step-4'));
    fireEvent.press(await screen.findByTestId('assessment-discard'));
    await waitFor(() => expect(mockDiscard).toHaveBeenCalledTimes(1));
    expect(mockBack).toHaveBeenCalled();
  });

  it('Finish later leaves without discarding', async () => {
    await renderDraft();
    fireEvent.press(screen.getByTestId('wizard-step-4'));
    fireEvent.press(await screen.findByTestId('assessment-finish-later'));
    expect(mockDiscard).not.toHaveBeenCalled();
    expect(mockBack).toHaveBeenCalled();
  });

  it('navigates clean top steps without saving', async () => {
    await renderDraft();
    fireEvent.press(screen.getByTestId('wizard-step-2'));
    await screen.findByTestId('step-about-you');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('dirty step change PATCHes before leaving', async () => {
    await renderDraft();
    fireEvent.press(screen.getByText('Padel'));
    fireEvent.press(screen.getByTestId('racket-padel-level'));
    fireEvent.press(screen.getByTestId('racket-padel-level-option-advanced'));
    fireEvent.changeText(screen.getByTestId('racket-padel-matches_played'), '40');
    fireEvent.press(screen.getByTestId('wizard-step-2'));

    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    expect(mockSave).toHaveBeenCalledWith({
      racket_experience: [{ sport: 'padel', level: 'advanced', matches_played: 40 }],
    });
    await screen.findByTestId('step-about-you');
  });

  it('saves big_tournament_division as an integer level id', async () => {
    await renderDraft();
    fireEvent.press(screen.getByTestId('wizard-step-2'));
    await screen.findByTestId('step-about-you');
    fireEvent.press(screen.getByTestId('field-big-tournament-division'));
    fireEvent.press(screen.getByTestId('field-big-tournament-division-option-12'));
    fireEvent.press(screen.getByTestId('wizard-step-3'));
    await waitFor(() => expect(mockSave).toHaveBeenCalled());
    expect(mockSave).toHaveBeenCalledWith({ big_tournament_division: 12 });
  });

  it('does not checkmark empty previous Sports when navigating to Details', async () => {
    await renderDraft();
    fireEvent.press(screen.getByTestId('wizard-step-2'));
    await screen.findByTestId('step-about-you');
    expect(
      screen.UNSAFE_root.findAll(
        (node) =>
          (node.type as unknown) === 'MaterialCommunityIcons' &&
          node.props.name === 'check'
      )
    ).toHaveLength(0);
  });

  it('checkmarks Sports when hydrated with valid racket content', async () => {
    await renderDraft(
      makeAssessment({
        submission: {
          id_player_custom_field_submission: 77,
          values: [
            {
              id_player_custom_field_value: 1,
              player_custom_field_id: 1,
              field: { id_player_custom_field: 1, code: 'racket_experience' },
              value: [{ sport: 'padel', level: 'advanced', matches_played: 40 }],
            },
          ],
        },
      })
    );
    fireEvent.press(screen.getByTestId('wizard-step-2'));
    await screen.findByTestId('step-about-you');
    expect(
      screen.UNSAFE_root.findAll(
        (node) =>
          (node.type as unknown) === 'MaterialCommunityIcons' &&
          node.props.name === 'check'
      ).length
    ).toBeGreaterThanOrEqual(1);
  });

  it('top-left back leaves the wizard (not previous step)', async () => {
    await renderDraft();
    fireEvent.press(screen.getByTestId('wizard-step-2'));
    await screen.findByTestId('step-about-you');
    fireEvent.press(screen.getByTestId('screen-header-back'));
    expect(mockBack).toHaveBeenCalled();
    expect(screen.getByTestId('step-about-you')).toBeTruthy();
  });

  it('dirty top-left back offers Leave without saving / Save & leave / Continue editing', async () => {
    await renderDraft();
    fireEvent.press(screen.getByText('Padel'));
    (Alert.alert as jest.Mock).mockImplementation((_t, _m, buttons) => {
      const stay = buttons.find((b: { text: string }) => b.text === 'Continue editing');
      stay?.onPress?.();
    });
    fireEvent.press(screen.getByTestId('screen-header-back'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2] as { text: string }[];
    expect(buttons.map((b) => b.text)).toEqual([
      'Leave without saving',
      'Save & leave',
      'Continue editing',
    ]);
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('dirty Save & leave PATCHes then leaves', async () => {
    await renderDraft();
    fireEvent.press(screen.getByText('Padel'));
    fireEvent.press(screen.getByTestId('racket-padel-level'));
    fireEvent.press(screen.getByTestId('racket-padel-level-option-advanced'));
    fireEvent.changeText(screen.getByTestId('racket-padel-matches_played'), '10');
    (Alert.alert as jest.Mock).mockImplementation((_t, _m, buttons) => {
      const save = buttons.find((b: { text: string }) => b.text === 'Save & leave');
      save?.onPress?.();
    });
    fireEvent.press(screen.getByTestId('screen-header-back'));
    await waitFor(() => expect(mockSave).toHaveBeenCalled());
    await waitFor(() => expect(mockBack).toHaveBeenCalled());
  });

  it('blocks invalid dirty sports before navigating', async () => {
    await renderDraft();
    fireEvent.press(screen.getByText('Padel'));
    fireEvent.press(screen.getByTestId('wizard-step-2'));
    await screen.findByTestId('racket-padel-error');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('does not ask for names or phone (Account-only)', async () => {
    await renderDraft();
    expect(screen.queryByText(/phone/i)).toBeNull();
    expect(screen.queryByText(/first name/i)).toBeNull();
  });

  it('offers a retry when the assessment cannot be loaded', async () => {
    mockLoad.mockRejectedValueOnce(new Error('boom'));
    mockLoad.mockResolvedValueOnce(makeAssessment());
    renderScreen();

    fireEvent.press(await screen.findByTestId('assessment-retry'));
    await screen.findByTestId('assessment-wizard');
    expect(mockLoad).toHaveBeenCalledTimes(2);
  });

  it('shows StepNavButtons loading while a step save is in flight', async () => {
    mockSave.mockImplementation(
      () =>
        new Promise((resolve) => {
          mockSavePending = true;
          setTimeout(() => {
            mockSavePending = false;
            resolve(makeAssessment());
          }, 50);
        })
    );
    await renderDraft();
    fireEvent.press(screen.getByText('Padel'));
    fireEvent.press(screen.getByTestId('racket-padel-level'));
    fireEvent.press(screen.getByTestId('racket-padel-level-option-advanced'));
    fireEvent.changeText(screen.getByTestId('racket-padel-matches_played'), '40');
    fireEvent.press(screen.getByTestId('step-forward'));
    await waitFor(() => expect(screen.getByTestId('step-forward-loading')).toBeTruthy());
    await screen.findByTestId('step-about-you');
  });
});
